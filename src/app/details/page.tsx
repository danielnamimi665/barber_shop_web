"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";


export default function Details() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // בדיקת מצב התחברות
  useEffect(() => {
    const checkLoginStatus = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userPhone = localStorage.getItem('userPhone');
      
      if (isLoggedIn !== 'true' || !userPhone) {
        router.push("/login");
        return;
      }
      
      setIsLoggedIn(true);
    };

    checkLoginStatus();
  }, [router]);

  const handleSubmit = () => {
    if (fullName.trim() && phoneNumber.trim()) {
      // Save to localStorage or state management
      const appointmentDetails = {
        fullName,
        phoneNumber,
        // Add other details from previous steps
      };
      localStorage.setItem('appointmentDetails', JSON.stringify(appointmentDetails));

      // Navigate to summary page
      router.push('/summary');
    }
  };

  const canSubmit = fullName.trim() && phoneNumber.trim();

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        מעביר לעמוד התחברות...
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
          padding: '32px 24px',
          width: isMobile ? '90vw' : '500px',
          maxWidth: '500px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          border: '2px solid #000000'
        }}>
          {/* Title */}
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            margin: 0,
            color: 'black',
            textAlign: 'center'
          }}>
            השארת פרטים
          </h2>

          {/* Form fields */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Full Name Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: 'black',
                marginBottom: '8px'
              }}>
                שם מלא:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  color: 'black',
                  outline: 'none',
                  textAlign: 'right'
                }}
                placeholder="הכנס את שמך המלא"
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: 'black',
                marginBottom: '8px'
              }}>
                מספר טלפון:
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  color: 'black',
                  outline: 'none',
                  textAlign: 'right'
                }}
                placeholder="הכנס את מספר הטלפון שלך"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: '100%',
              background: '#000000',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: canSubmit ? 'pointer' : 'not-allowed'
            }}
          >
            שלח
          </button>
        </div>

        {/* Back Button - Below the main container on the left side */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          maxWidth: isMobile ? '90vw' : '500px'
        }}>
          <button
            onClick={() => router.push('/booking')}
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
        </div>
      </main>
    </div>
  );
} 