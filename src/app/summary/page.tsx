"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Summary() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [appointmentData, setAppointmentData] = useState<any>(null);
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
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Get data from localStorage
    const bookingData = localStorage.getItem('bookingData');
    const appointmentDetails = localStorage.getItem('appointmentDetails');
    const serviceType = localStorage.getItem('serviceType'); // Get service type

    if (bookingData && appointmentDetails) {
      const booking = JSON.parse(bookingData);
      const details = JSON.parse(appointmentDetails);

      setAppointmentData({
        ...booking,
        ...details,
        serviceType: serviceType || "שירות לא ידוע" // Add service type
      });
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  const handleConfirm = async () => {
    // Get serviceType from localStorage
    let serviceType = appointmentData.serviceType;
    if (!serviceType) {
      serviceType = localStorage.getItem('serviceType') || '';
    }
    
    // Create unique appointment ID
    const appointmentId = `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Try to save to centralized API first
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          selectedDate: appointmentData.selectedDate,
          selectedTime: appointmentData.selectedTime,
          fullName: appointmentData.fullName,
          phoneNumber: appointmentData.phoneNumber,
          serviceType,
          confirmed: true,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        // Successfully saved to centralized system
        const finalData = {
          ...appointmentData,
          serviceType,
          confirmed: true,
          timestamp: new Date().toISOString(),
          appointmentId: appointmentId,
          status: 'waiting' // Default status for new appointments
        };
        localStorage.setItem('finalAppointment', JSON.stringify(finalData));
        
        // Navigate to appointments page
        router.push('/appointments');
        return;
      }
    } catch (error) {
      console.log('API not available, using fallback');
    }
    
    // Fallback to localStorage if API is not available
    const allAppointments = localStorage.getItem('allAppointments');
    const sessionAppointments = sessionStorage.getItem('allAppointments');
    
    let combinedAppointments: { [key: string]: any[] } = {};
    
    if (allAppointments) {
      combinedAppointments = { ...combinedAppointments, ...JSON.parse(allAppointments) };
    }
    if (sessionAppointments) {
      combinedAppointments = { ...combinedAppointments, ...JSON.parse(sessionAppointments) };
    }
    
    const dateKey = new Date(appointmentData.selectedDate).toISOString().split('T')[0];
    const appointmentsForDate = combinedAppointments[dateKey] || [];
    
    // Check if this time slot is already occupied
    const isAlreadyOccupied = appointmentsForDate.some((appointment: any) => 
      appointment.selectedTime === appointmentData.selectedTime
    );
    
    if (isAlreadyOccupied) {
      alert('תור זה כבר תפוס. אנא בחר זמן אחר.');
      return;
    }
    
    // Add the complete appointment object to occupied slots for this date
    if (!combinedAppointments[dateKey]) {
      combinedAppointments[dateKey] = [];
    }
    
    combinedAppointments[dateKey].push({
      appointmentId: appointmentId,
      selectedTime: appointmentData.selectedTime,
      fullName: appointmentData.fullName,
      phoneNumber: appointmentData.phoneNumber,
      serviceType: serviceType,
      confirmed: true,
      timestamp: new Date().toISOString()
    });
    
    // Save to both localStorage and sessionStorage for cross-device compatibility
    localStorage.setItem('allAppointments', JSON.stringify(combinedAppointments));
    sessionStorage.setItem('allAppointments', JSON.stringify(combinedAppointments));
    
    // Save final appointment data
    const finalData = {
      ...appointmentData,
      serviceType,
      confirmed: true,
      timestamp: new Date().toISOString(),
      appointmentId: appointmentId,
      status: 'waiting' // Default status for new appointments
    };
    localStorage.setItem('finalAppointment', JSON.stringify(finalData));

    // Navigate to appointments page
    router.push('/appointments');
  };

  const handleReject = () => {
    // Clear data and go back to details page
    localStorage.removeItem('bookingData');
    localStorage.removeItem('appointmentDetails');
    localStorage.removeItem('serviceType');
    router.push('/details');
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

  if (!appointmentData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        טוען...
      </div>
    );
  }

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
        {/* Main container */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px 24px',
          width: isMobile ? '90vw' : '500px',
          maxWidth: '500px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Confirmation Message */}
          <div style={{
            textAlign: 'center',
            color: 'black',
            marginBottom: '16px'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              תודה, הפרטים נשמרו בהצלחה.
            </div>
          </div>

          {/* Appointment Summary */}
          <div style={{
            color: 'black'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '16px',
              textAlign: 'center',
              textDecoration: 'underline'
            }}>
              סיכום התור:
            </div>

            {/* Service Type */}
            <div style={{
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              <strong>סוג שירות:</strong> {appointmentData.serviceType || "שירות לא ידוע"}
            </div>

            {/* Date */}
            <div style={{
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              <strong>תאריך:</strong> {appointmentData.selectedDate ? formatDate(appointmentData.selectedDate) : "-"}
            </div>

            {/* Time */}
            <div style={{
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              <strong>שעה:</strong> {appointmentData.selectedTime || "-"}
            </div>

            {/* Name */}
            <div style={{
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              <strong>שם:</strong> {appointmentData.fullName || "-"}
            </div>

            {/* Phone */}
            <div style={{
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              <strong>טלפון:</strong> {appointmentData.phoneNumber || "-"}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginTop: '16px'
          }}>
            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              style={{
                flex: 1,
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              מאשר
            </button>

            {/* Reject Button */}
            <button
              onClick={handleReject}
              style={{
                flex: 1,
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              לא מאשר
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 