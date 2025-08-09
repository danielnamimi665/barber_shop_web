"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatHebrewDate } from "@/lib/date";
import { getAppointmentBroadcast } from "@/lib/broadcast";

export default function Appointments() {
  const [appointment, setAppointment] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // Try to get appointment from localStorage first (for immediate display)
        const storedAppointment = localStorage.getItem('finalAppointment');
        if (storedAppointment) {
          const parsed = JSON.parse(storedAppointment);
          if (parsed && parsed.status !== 'cancelled') {
            setAppointment(parsed);
          }
        }
        
        // Also fetch from API to ensure sync
        const response = await fetch('/api/appointments');
        if (response.ok) {
          const data = await response.json();
          // Find user's appointment (could be improved with user identification)
          const userEmail = session?.user?.email;
          if (userEmail && data) {
            // Look through all appointments to find one matching the user
            let userAppointment = null;
            Object.keys(data).forEach(dateKey => {
              if (Array.isArray(data[dateKey])) {
                const found = data[dateKey].find((apt: any) => 
                  apt.phoneNumber && storedAppointment && 
                  JSON.parse(storedAppointment).phoneNumber === apt.phoneNumber
                );
                if (found) {
                  userAppointment = found;
                }
              }
            });
            
            if (userAppointment && userAppointment.status !== 'cancelled') {
              setAppointment(userAppointment);
              // Update localStorage with latest data
              localStorage.setItem('finalAppointment', JSON.stringify(userAppointment));
            }
          }
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
    };
    
    if (session) {
      loadAppointments();
    }
    
    // Listen for appointment updates from other tabs
    const broadcast = getAppointmentBroadcast();
    const cleanup = broadcast.onAppointmentUpdate(({ action, appointment: updatedAppointment }) => {
      if (action === 'cancelled' || action === 'updated') {
        // Reload appointments when there's an update
        loadAppointments();
      }
    });
    
    return cleanup;
  }, [session]);

  const formatDate = (dateString: string) => {
    // If it's a UTC timestamp, use formatHebrewDate
    if (dateString.includes('T') && dateString.includes('Z')) {
      return formatHebrewDate(dateString);
    }
    
    // Handle local date format (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const dayName = days[date.getDay()];
    
    return `${dayName}, ${day}/${month}/${year}`;
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'waiting':
        return { text: 'ממתין לאישור', background: '#ffc107', color: 'black' };
      case 'completed':
        return { text: 'התור מאושר', background: '#28a745', color: 'white' };
      case 'cancelled':
        return { text: 'התור מבוטל', background: '#dc3545', color: 'white' };
      default:
        return { text: 'לא ידוע', background: '#6c757d', color: 'white' };
    }
  };

  const handleCancelAppointment = async () => {
    try {
      // Update appointment status to cancelled
      const updatedAppointment = { ...appointment, status: 'cancelled' };
      
      // Save to localStorage
      localStorage.setItem('finalAppointment', JSON.stringify(updatedAppointment));
      
      // Update state
      setAppointment(updatedAppointment);
      
      // Close modal
      setShowCancelModal(false);
      
      // Make the time slot available again and remove from admin table
      const response = await fetch('/api/appointments/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          appointmentId: appointment.id,
          selectedDate: appointment.selectedDate,
          selectedTime: appointment.selectedTime
        }),
      });
      
      if (response.ok) {
        console.log('Appointment cancelled successfully');
        // Hide the appointment after a short delay
        setTimeout(() => {
          setAppointment(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  if (status === "loading") {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        טוען...
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  if (!appointment) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px'
      }}>
        אין תורים להצגה.
      </div>
    );
  }

  const statusInfo = getStatusDisplay(appointment.status || 'waiting');

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Main content */}
      <main style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 10,
        marginTop: isMobile ? 'max(60px, 8vh)' : 'max(80px, 10vh)'
      }}>
        {/* Appointment Summary Container */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: isMobile ? '24px' : '32px',
          width: '100%',
          minWidth: isMobile ? '300px' : '420px',
          maxWidth: isMobile ? '350px' : '600px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '16px' : '24px',
          border: '2px solid black',
          color: 'black'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            {/* Status Indicator - Left Side */}
            <div style={{
              background: statusInfo.background,
              color: statusInfo.color,
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              border: statusInfo.background === '#ffc107' ? '1px solid black' : 'none'
            }}>
              {statusInfo.text}
            </div>
            
            {/* Title - Center */}
            <div style={{
              background: "#ffffff",
              color: "black",
              border: "2px solid black",
              borderRadius: "12px",
              padding: "8px 16px",
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: "bold",
              textAlign: "center",
              whiteSpace: 'nowrap'
            }}>
              סיכום התור
            </div>
            
            {/* Empty space for balance */}
            <div style={{ width: '80px' }}></div>
          </div>

          {/* Appointment Details */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '10px' : '12px',
            fontSize: isMobile ? '14px' : '16px'
          }}>
            <div><strong>סוג שירות:</strong> {appointment.serviceType}</div>
            <div><strong>תאריך:</strong> {formatDate(appointment.selectedDate)}</div>
            <div><strong>שעה:</strong> {appointment.selectedTime}</div>
            <div><strong>שם:</strong> {appointment.fullName}</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div><strong>טלפון:</strong> {appointment.phoneNumber}</div>
              {appointment.status !== 'cancelled' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#c82333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc3545';
                  }}
                >
                  ביטול התור
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: isMobile ? '90%' : '400px',
            maxWidth: '500px',
            textAlign: 'center',
            border: '2px solid black'
          }}>
            <h3 style={{
              color: 'black',
              marginBottom: '24px',
              fontSize: isMobile ? '18px' : '20px'
            }}>
              האם אתה בטוח שברצונך לבטל את התור?
            </h3>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              {/* Cancel Button */}
              <button
                onClick={handleCancelAppointment}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  minWidth: '100px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                }}
              >
                תבטל
              </button>
              
              {/* Don't Cancel Button */}
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  minWidth: '100px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#218838';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                }}
              >
                אל תבטל
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 