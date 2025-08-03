"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Appointments() {
  const [appointment, setAppointment] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
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
    const storedAppointment = localStorage.getItem('finalAppointment');
    let parsed = null;
    if (storedAppointment) {
      parsed = JSON.parse(storedAppointment);
      // Ensure serviceType is present, fallback to localStorage if needed
      if (!parsed.serviceType) {
        parsed.serviceType = localStorage.getItem('serviceType') || "שירות לא ידוע";
      }
    }
    
    // Don't show cancelled appointments
    if (parsed && parsed.status === 'cancelled') {
      setAppointment(null);
      return;
    }
    
    setAppointment(parsed);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
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
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            {/* Status Indicator */}
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
            {/* Title */}
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
            <div><strong>טלפון:</strong> {appointment.phoneNumber}</div>
          </div>
        </div>
      </main>
    </div>
  );
} 