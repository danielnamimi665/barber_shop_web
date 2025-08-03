"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function Booking() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  // Load all existing appointments on component mount
  useEffect(() => {
    const loadAllAppointments = async () => {
      try {
        // Try to get appointments from a centralized source
        const response = await fetch('/api/appointments');
        if (response.ok) {
          const appointments = await response.json();
          if (selectedDate) {
            const dateKey = selectedDate.toISOString().split('T')[0];
            const appointmentsForDate = appointments[dateKey] || [];
            const occupiedTimes = appointmentsForDate.map((appointment: any) => appointment.selectedTime);
            setOccupiedSlots(occupiedTimes);
          }
        } else {
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
          
          if (selectedDate) {
            const dateKey = selectedDate.toISOString().split('T')[0];
            const appointmentsForDate = combinedAppointments[dateKey] || [];
            const occupiedTimes = appointmentsForDate.map((appointment: any) => appointment.selectedTime);
            setOccupiedSlots(occupiedTimes);
          }
        }
      } catch (error) {
        console.log('Using fallback storage system');
        // Fallback to localStorage
        const allAppointments = localStorage.getItem('allAppointments');
        const sessionAppointments = sessionStorage.getItem('allAppointments');
        
        let combinedAppointments: { [key: string]: any[] } = {};
        
        if (allAppointments) {
          combinedAppointments = { ...combinedAppointments, ...JSON.parse(allAppointments) };
        }
        if (sessionAppointments) {
          combinedAppointments = { ...combinedAppointments, ...JSON.parse(sessionAppointments) };
        }
        
        if (selectedDate) {
          const dateKey = selectedDate.toISOString().split('T')[0];
          const appointmentsForDate = combinedAppointments[dateKey] || [];
          const occupiedTimes = appointmentsForDate.map((appointment: any) => appointment.selectedTime);
          setOccupiedSlots(occupiedTimes);
        }
      }
    };

    loadAllAppointments();
    
    // Check for updates every 5 seconds
    const interval = setInterval(loadAllAppointments, 5000);
    
    return () => clearInterval(interval);
  }, [selectedDate]);

  // Check for existing appointments when date is selected
  useEffect(() => {
    if (selectedDate) {
      const allAppointments = localStorage.getItem('allAppointments');
      const sessionAppointments = sessionStorage.getItem('allAppointments');
      
      let combinedAppointments: { [key: string]: any[] } = {};
      
      if (allAppointments) {
        combinedAppointments = { ...combinedAppointments, ...JSON.parse(allAppointments) };
      }
      if (sessionAppointments) {
        combinedAppointments = { ...combinedAppointments, ...JSON.parse(sessionAppointments) };
      }
      
      const dateKey = selectedDate.toISOString().split('T')[0];
      const appointmentsForDate = combinedAppointments[dateKey] || [];
      const occupiedTimes = appointmentsForDate.map((appointment: any) => appointment.selectedTime);
      setOccupiedSlots(occupiedTimes);
    }
  }, [selectedDate]);

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

  // Generate calendar data for current month
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const calendarDays = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    calendarDays.push(date);
  }

  const timeSlots = [
    { time: "9:00", occupied: false },
    { time: "9:30", occupied: false },
    { time: "10:00", occupied: false },
    { time: "10:30", occupied: false },
    { time: "11:00", occupied: false },
    { time: "11:30", occupied: false },
    { time: "12:00", occupied: false },
    { time: "12:30", occupied: false },
    { time: "13:00", occupied: false },
    { time: "13:30", occupied: false },
    { time: "14:00", occupied: false },
    { time: "14:30", occupied: false },
    { time: "15:00", occupied: false },
    { time: "15:30", occupied: false },
    { time: "16:00", occupied: false },
    { time: "16:30", occupied: false },
    { time: "17:00", occupied: false },
    { time: "17:30", occupied: false }
  ];

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const formatDate = (date: Date) => {
    const days = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
    const months = [
      "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
      "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    return `${dayName}, ${day} ${month}`;
  };

  // Check if date is in the past
  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateTooFarInFuture = (date: Date) => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30); // 30 days from today
    maxDate.setHours(23, 59, 59, 999);
    return date > maxDate;
  };

  // Check if time is in the past for selected date
  const isTimeInPast = (time: string) => {
    if (!selectedDate) return false;

    const today = new Date();
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);

    // If selected date is today, check if time has passed
    if (selectedDateOnly.getTime() === todayOnly.getTime()) {
      const [hours, minutes] = time.split(':').map(Number);
      const currentTime = new Date();
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();

      return (hours < currentHours) || (hours === currentHours && minutes <= currentMinutes);
    }

    // If selected date is in the past, all times are past
    return selectedDateOnly < todayOnly;
  };

  // Check if time slot is occupied (booked by someone else)
  const isTimeSlotOccupied = (time: string) => {
    return occupiedSlots.includes(time);
  };

  // Check if time slot is unavailable (past time or occupied)
  const isTimeSlotUnavailable = (time: string) => {
    return isTimeInPast(time) || isTimeSlotOccupied(time);
  };

  const canProceed = selectedDate && selectedTime &&
    !isTimeSlotUnavailable(selectedTime);

  const formatMonthYear = (date: Date) => {
    const months = [
      "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
      "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 10,
        marginTop: isMobile ? 'max(60px, 8vh)' : 'max(80px, 10vh)',
        gap: '20px'
      }}>
        {/* Main container */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          width: isMobile ? '90vw' : '500px',
          maxWidth: '500px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          border: '2px solid #000000'
        }}>
          {/* Title - Outside date container but inside main container */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'black'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              margin: 0,
              color: 'black',
              textAlign: 'center'
            }}>
              בחר תאריך ושעה
            </h2>
            <span style={{ fontSize: '20px' }}>🕐</span>
          </div>

          {/* Date Selection Section */}
          <div style={{
            border: '2px solid #000000',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            {/* Calendar */}
            <div style={{ color: 'black' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <button style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'black',
                  fontWeight: 'bold'
                }} onClick={goToPreviousMonth}>
                  &lt;
                </button>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {formatMonthYear(currentMonth)}
                </span>
                <button style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'black',
                  fontWeight: 'bold'
                }} onClick={goToNextMonth}>
                  &gt;
                </button>
              </div>

              {/* Days of week */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                marginBottom: '12px'
              }}>
                {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
                  <div key={day} style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'black'
                  }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px'
              }}>
                {calendarDays.filter(date => date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear()).map((date, index) => {
                  const isPast = isDateInPast(date);
                  const isTooFar = isDateTooFarInFuture(date);
                  const isSelected = selectedDate &&
                    selectedDate.getDate() === date.getDate() &&
                    selectedDate.getMonth() === date.getMonth() &&
                    selectedDate.getFullYear() === date.getFullYear();

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!isPast && !isTooFar) {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }
                      }}
                      disabled={isPast || isTooFar}
                      style={{
                        background: isSelected ? '#000000' : 'transparent',
                        color: isSelected ? 'white' :
                          isDateInCurrentMonth(date) ?
                            (isPast || isTooFar ? '#ccc' : 'black') : '#ccc',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: (isPast || isTooFar) ? 'not-allowed' : 'pointer',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: (isPast || isTooFar) ? 0.5 : 1
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Selection Section */}
          <div style={{
            border: '2px solid #000000',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'black',
              textAlign: 'center'
            }}>
              שעות פנויות
            </h3>

            {/* Time slots grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {timeSlots.map(slot => {
                const isUnavailable = isTimeSlotUnavailable(slot.time);
                const isPastTime = isTimeInPast(slot.time);
                const isOccupied = isTimeSlotOccupied(slot.time);

                return (
                  <button
                    key={slot.time}
                    onClick={() => {
                      if (selectedDate && !isUnavailable) {
                        // Double-check if slot is still available before selecting
                        const allAppointments = localStorage.getItem('allAppointments');
                        const sessionAppointments = sessionStorage.getItem('allAppointments');
                        
                        let combinedAppointments: { [key: string]: any[] } = {};
                        
                        if (allAppointments) {
                          combinedAppointments = { ...combinedAppointments, ...JSON.parse(allAppointments) };
                        }
                        if (sessionAppointments) {
                          combinedAppointments = { ...combinedAppointments, ...JSON.parse(sessionAppointments) };
                        }
                        
                        const dateKey = selectedDate.toISOString().split('T')[0];
                        const appointmentsForDate = combinedAppointments[dateKey] || [];
                        const isStillAvailable = !appointmentsForDate.some((appointment: any) => 
                          appointment.selectedTime === slot.time
                        );
                        
                        if (isStillAvailable) {
                          setSelectedTime(slot.time);
                        } else {
                          alert('תור זה כבר תפוס. אנא בחר זמן אחר.');
                          // Refresh the occupied slots
                          const occupiedTimes = appointmentsForDate.map((appointment: any) => appointment.selectedTime);
                          setOccupiedSlots(occupiedTimes);
                        }
                      }
                    }}
                    disabled={!selectedDate || isUnavailable}
                    style={{
                      background: selectedTime === slot.time ? '#000000' : isUnavailable ? '#f0f0f0' : 'white',
                      color: selectedTime === slot.time ? 'white' : isUnavailable ? '#999' : selectedDate ? 'black' : '#ccc',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '18px 0',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: (selectedDate && !isUnavailable) ? 'pointer' : 'not-allowed',
                      opacity: selectedDate ? 1 : 0.5,
                      width: '100%',
                      minWidth: '80px',
                      minHeight: '48px',
                      maxHeight: '48px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {slot.time}
                    </div>
                    {isUnavailable && (
                      <div style={{ fontSize: '12px', marginTop: '4px', color: '#999', fontWeight: 'bold' }}>
                        תפוס
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Waiting List Button - Show when all slots are occupied */}
            {selectedDate && timeSlots.every(slot => isTimeSlotUnavailable(slot.time)) && (
              <div style={{
                marginTop: '16px',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => {
                    // Handle waiting list functionality
                    alert('תיהנה לרשימת המתנה. נציג יצור איתך קשר כאשר יהיה תור פנוי.');
                  }}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  רשימת המתנה
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '20px'
        }}>
          <button
            onClick={() => router.push('/services')}
            style={{
              background: 'white',
              color: 'black',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            חזור
          </button>
          <button
            onClick={() => {
              if (canProceed) {
                // Save selected date and time to localStorage
                const bookingData = {
                  selectedDate: selectedDate?.toISOString(),
                  selectedTime: selectedTime
                };
                localStorage.setItem('bookingData', JSON.stringify(bookingData));
                router.push('/details');
              }
            }}
            disabled={!canProceed}
            style={{
              background: canProceed ? 'black' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: canProceed ? 'pointer' : 'not-allowed',
              opacity: canProceed ? 1 : 0.6
            }}
          >
            הבא
          </button>
        </div>
      </main>
    </div>
  );
} 