"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkLoginStatus = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userPhone = localStorage.getItem('userPhone');
      
      if (isLoggedIn !== 'true' || !userPhone) {
        window.location.href = "/login";
        return;
      }
      
      setIsLoggedIn(true);
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  const handleDeleteFutureAppointments = async () => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('התורים העתידיים נמחקו בהצלחה');
      } else {
        alert('שגיאה במחיקת התורים');
      }
    } catch (error) {
      alert('שגיאה במחיקת התורים');
    }
  };

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

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "32px 24px",
        color: "black",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
      }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "24px",
          color: "black"
        }}>
          דף ניהול
        </h1>
        
        <button
          onClick={handleDeleteFutureAppointments}
          style={{
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "16px 32px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "16px"
          }}
        >
          מחק תורים עתידיים
        </button>
        
        <div style={{
          fontSize: "14px",
          color: "#666",
          marginTop: "16px"
        }}>
          אזהרה: פעולה זו תמחק את כל התורים העתידיים
        </div>
      </div>
    </div>
  );
} 