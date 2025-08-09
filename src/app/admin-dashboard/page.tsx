"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatHebrewDate } from "@/lib/date";
import { getAppointmentBroadcast } from "@/lib/broadcast";

interface Appointment {
  appointmentId: string;
  selectedDate: string;
  selectedTime: string;
  fullName: string;
  phoneNumber: string;
  serviceType: string;
  confirmed: boolean;
  timestamp: string;
  status?: 'completed' | 'cancelled' | 'waiting' | 'pending';
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<{ [key: string]: any[] }>({});
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [currentFilter, setCurrentFilter] = useState<'all' | 'today' | 'tomorrow' | 'maximum'>('all');
  const [pendingChanges, setPendingChanges] = useState<{ [appointmentId: string]: string }>({});
  const { data: session, status } = useSession();

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/appointments');
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded appointments data:', data);
          setAppointments(data);
        } else {
          console.error('Failed to load appointments');
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
    
    // Refresh appointments every 30 seconds
    const interval = setInterval(loadAppointments, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, currentFilter]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

  const filterAppointments = () => {
    if (!appointments) return;

    // Flatten all appointments from all dates into one array
    const allAppointments: Appointment[] = [];
    Object.keys(appointments).forEach(dateKey => {
      if (Array.isArray(appointments[dateKey])) {
        appointments[dateKey].forEach((appointment: any) => {
          allAppointments.push({
            ...appointment,
            selectedDate: appointment.selectedDate || dateKey,
            status: appointment.status || 'waiting'
          });
        });
      }
    });

    // Sort by date and time (newest first)
    allAppointments.sort((a, b) => {
      const dateA = new Date(a.selectedDate + ' ' + a.selectedTime);
      const dateB = new Date(b.selectedDate + ' ' + b.selectedTime);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply filters
    let filtered = allAppointments;

    if (currentFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = allAppointments.filter(appointment => appointment.selectedDate === today);
    } else if (currentFilter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      filtered = allAppointments.filter(appointment => appointment.selectedDate === tomorrowStr);
    } else if (currentFilter === 'maximum' || currentFilter === 'all') {
      // Show all future appointments (no filtering needed as past appointments are already cleaned up)
      filtered = allAppointments;
    }

    setFilteredAppointments(filtered);
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      // Save all pending status changes
      const promises = Object.entries(pendingChanges).map(async ([appointmentId, status]) => {
        const response = await fetch('/api/appointments/status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointmentId,
            status,
            action: 'admin_update'
          })
        });
        
        // Update localStorage for client appointments
        if (status === 'completed') {
          // Update client's appointment status to approved
          const appointment = filteredAppointments.find(apt => apt.appointmentId === appointmentId);
          if (appointment) {
            const clientAppointment = {
              ...appointment,
              status: 'completed'
            };
            // This will be handled by the API to update client localStorage
          }
        } else if (status === 'cancelled') {
          // Cancel and remove appointment completely
          await fetch('/api/appointments/status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'cancel',
              appointmentId: appointmentId,
              selectedDate: filteredAppointments.find(apt => apt.appointmentId === appointmentId)?.selectedDate,
              selectedTime: filteredAppointments.find(apt => apt.appointmentId === appointmentId)?.selectedTime
            })
          });
        } else if (status === 'waiting') {
          // Set back to waiting status
          const appointment = filteredAppointments.find(apt => apt.appointmentId === appointmentId);
          if (appointment) {
            const clientAppointment = {
              ...appointment,
              status: 'waiting'
            };
            // This will be handled by the API to update client localStorage
          }
        }
        
        return response;
      });
      
      await Promise.all(promises);
      
      // Remove cancelled appointments from the system
      const response = await fetch('/api/appointments', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Reload appointments to get updated data
        const reloadResponse = await fetch('/api/appointments');
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          setAppointments(data);
        }
        
        // Clear pending changes
        setPendingChanges({});
        
        // Broadcast the changes to other tabs
        const broadcast = getAppointmentBroadcast();
        Object.entries(pendingChanges).forEach(([appointmentId, status]) => {
          const appointment = filteredAppointments.find(apt => apt.appointmentId === appointmentId);
          if (appointment) {
            broadcast.sendAppointmentUpdate(
              status === 'cancelled' ? 'cancelled' : 'updated',
              { ...appointment, status }
            );
          }
        });
        
        setSaveMessage("השינויים נשמרו בהצלחה!");
      } else {
        setSaveMessage("שגיאה בשמירת השינויים");
      }
      
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      setSaveMessage("שגיאה בשמירת השינויים");
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'completed' | 'cancelled' | 'waiting') => {
    // Only update local state, don't save to API yet
    setPendingChanges(prev => ({
      ...prev,
      [appointmentId]: status
    }));
  };

  const getRowBackgroundColor = (appointment: any) => {
    const status = pendingChanges[appointment.appointmentId] || appointment.status;
    switch (status) {
      case 'completed':
        return '#28a745'; // Darker green
      case 'cancelled':
        return '#dc3545'; // Darker red
      case 'waiting':
        return '#ffffff'; // White
      default:
        return '#ffffff'; // White for pending
    }
  };

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

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (status === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "18px"
      }}>
        טוען...
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "18px"
      }}>
        טוען...
      </div>
    );
  }

  if (!appointments || Object.keys(appointments).length === 0) {
    return (
      <div style={{
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        color: "white"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "2rem"
          }}>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "black",
              margin: "0 0 1rem 0",
              textAlign: "center",
              background: "white",
              border: "2px solid black",
              borderRadius: "12px",
              padding: "12px 24px",
              display: "inline-block"
            }}>
              טבלת ניהול
            </h1>
            
            <div style={{
              textAlign: "center",
              color: "black",
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              border: "2px solid black"
            }}>
              <h2 style={{ margin: "0 0 1rem 0" }}>אין תורים להצגה</h2>
              <p>טרם נקבעו תורים במערכת</p>
            </div>
            
            <button
              onClick={() => window.location.href = "/"}
              style={{
                marginTop: "1rem",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "16px",
                cursor: "pointer"
              }}
            >
              חזור לדף הבית
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "2rem",
      fontFamily: "Arial, sans-serif",
      color: "white"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "2rem"
        }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "black",
            margin: "0 0 1rem 0",
            textAlign: "center",
            background: "white",
            border: "2px solid black",
            borderRadius: "12px",
            padding: "12px 24px",
            display: "inline-block"
          }}>
            טבלת ניהול
          </h1>
          
          <div style={{
            display: "flex",
            gap: "10px",
            alignItems: "center"
          }}>
            <button
              onClick={() => setCurrentFilter('today')}
              style={{
                background: currentFilter === 'today' ? "#007bff" : "#e0e0e0",
                color: currentFilter === 'today' ? "white" : "black",
                border: "none",
                borderRadius: "12px",
                padding: "8px 16px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              היום
            </button>
            <button
              onClick={() => setCurrentFilter('tomorrow')}
              style={{
                background: currentFilter === 'tomorrow' ? "#007bff" : "#e0e0e0",
                color: currentFilter === 'tomorrow' ? "white" : "black",
                border: "none",
                borderRadius: "12px",
                padding: "8px 16px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              מחר
            </button>
            <button
              onClick={() => setCurrentFilter('maximum')}
              style={{
                background: currentFilter === 'maximum' ? "#007bff" : "#e0e0e0",
                color: currentFilter === 'maximum' ? "white" : "black",
                border: "none",
                borderRadius: "12px",
                padding: "8px 16px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              מקסימום
            </button>
            
            <div style={{ width: '20px' }} /> {/* Spacer */}

            <button
              onClick={saveAllChanges}
              disabled={isSaving}
              style={{
                background: isSaving ? "#6c757d" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: isSaving ? "not-allowed" : "pointer"
              }}
            >
              {isSaving ? "שומר..." : "שמור"}
            </button>
            <button
              onClick={() => window.location.href = "/"}
              style={{
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              חזור לדף הבית
            </button>
          </div>
          {saveMessage && (
            <div style={{
              marginTop: "1rem",
              color: saveMessage.includes("בהצלחה") ? "#28a745" : "#dc3545",
              fontWeight: "bold",
              textAlign: "center"
            }}>
              {saveMessage}
            </div>
          )}
        </div>

        <div style={{
          overflowX: "auto",
          width: "100%",
          background: "white",
          borderRadius: "12px",
          border: "2px solid black",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "black"
          }}>
            <thead>
              <tr style={{
                background: "#f8f9fa",
                borderBottom: "2px solid black"
              }}>
                <th style={{ padding: "12px", textAlign: "right", fontSize: "14px" }}>שם מלא</th>
                <th style={{ padding: "12px", textAlign: "right", fontSize: "14px" }}>מספר טלפון</th>
                <th style={{ padding: "12px", textAlign: "right", fontSize: "14px" }}>סוג שירות</th>
                <th style={{ padding: "12px", textAlign: "right", fontSize: "14px" }}>תאריך</th>
                <th style={{ padding: "12px", textAlign: "right", fontSize: "14px" }}>שעה</th>
                <th style={{ padding: "12px", textAlign: "right", fontSize: "14px" }}>תאריך הזמנה</th>
                <th style={{ padding: "12px", textAlign: "right", fontSize: "14px" }}>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(appointment => (
                  <tr key={appointment.appointmentId} style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: getRowBackgroundColor(appointment),
                    color: (pendingChanges[appointment.appointmentId] || appointment.status) === 'completed' || (pendingChanges[appointment.appointmentId] || appointment.status) === 'cancelled' ? 'white' : 'black'
                  }}>
                    <td style={{
                      padding: "12px",
                      textAlign: "right",
                      fontSize: "14px",
                      color: (pendingChanges[appointment.appointmentId] || appointment.status) === 'completed' || (pendingChanges[appointment.appointmentId] || appointment.status) === 'cancelled' ? 'white' : 'black'
                    }}>
                      {appointment.fullName}
                    </td>
                    <td style={{
                      padding: "12px",
                      textAlign: "right",
                      fontSize: "14px",
                      color: (pendingChanges[appointment.appointmentId] || appointment.status) === 'completed' || (pendingChanges[appointment.appointmentId] || appointment.status) === 'cancelled' ? 'white' : 'black'
                    }}>
                      {appointment.phoneNumber}
                    </td>
                    <td style={{
                      padding: "12px",
                      textAlign: "right",
                      fontSize: "14px",
                      color: (pendingChanges[appointment.appointmentId] || appointment.status) === 'completed' || (pendingChanges[appointment.appointmentId] || appointment.status) === 'cancelled' ? 'white' : 'black'
                    }}>
                      {appointment.serviceType}
                    </td>
                    <td style={{
                      padding: "12px",
                      textAlign: "right",
                      fontSize: "14px",
                      color: (pendingChanges[appointment.appointmentId] || appointment.status) === 'completed' || (pendingChanges[appointment.appointmentId] || appointment.status) === 'cancelled' ? 'white' : 'black'
                    }}>
                      {formatDate(appointment.selectedDate)}
                    </td>
                    <td style={{
                      padding: "12px",
                      textAlign: "right",
                      fontSize: "14px",
                      color: (pendingChanges[appointment.appointmentId] || appointment.status) === 'completed' || (pendingChanges[appointment.appointmentId] || appointment.status) === 'cancelled' ? 'white' : 'black'
                    }}>
                      {formatTime(appointment.selectedTime)}
                    </td>
                    <td style={{
                      padding: "12px",
                      textAlign: "right",
                      fontSize: "14px",
                      color: (pendingChanges[appointment.appointmentId] || appointment.status) === 'completed' || (pendingChanges[appointment.appointmentId] || appointment.status) === 'cancelled' ? 'white' : 'black'
                    }}>
                      {formatDate(appointment.timestamp)}
                    </td>
                    <td style={{
                      padding: "12px",
                      textAlign: "right",
                      fontSize: "14px",
                      whiteSpace: "nowrap"
                    }}>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.appointmentId, 'completed')}
                        style={{
                          background: (pendingChanges[appointment.appointmentId] || appointment.status) === 'completed' ? '#28a745' : '#e0e0e0',
                          color: (pendingChanges[appointment.appointmentId] || appointment.status) === 'completed' ? 'white' : 'black',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          marginRight: '4px'
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.appointmentId, 'cancelled')}
                        style={{
                          background: (pendingChanges[appointment.appointmentId] || appointment.status) === 'cancelled' ? '#dc3545' : '#e0e0e0',
                          color: (pendingChanges[appointment.appointmentId] || appointment.status) === 'cancelled' ? 'white' : 'black',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          marginRight: '4px'
                        }}
                      >
                        ✗
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.appointmentId, 'waiting')}
                        style={{
                          background: (pendingChanges[appointment.appointmentId] || appointment.status) === 'waiting' ? '#ffffff' : '#e0e0e0',
                          color: (pendingChanges[appointment.appointmentId] || appointment.status) === 'waiting' ? 'black' : 'black',
                          border: (pendingChanges[appointment.appointmentId] || appointment.status) === 'waiting' ? '1px solid #000' : 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ⏳
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "black" }}>
                    אין תורים זמינים עבור הסינון הנוכחי.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 