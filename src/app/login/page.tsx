"use client";
import { useState, useEffect } from "react";


export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorTimer, setErrorTimer] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // בדיקה אם המשתמש כבר מחובר
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userPhone = localStorage.getItem('userPhone');
    
    if (isLoggedIn === 'true' && userPhone) {
      console.log("User already logged in, redirecting to home");
      window.location.href = "/home";
      return;
    }
  }, []);

  // Cleanup effect לניקוי טיימרים
  useEffect(() => {
    return () => {
      if (errorTimer) {
        clearTimeout(errorTimer);
      }
    };
  }, [errorTimer]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userPhone');
    setSuccessMessage("");
    setErrorMessage("");
  };

  // פונקציה להצגת הודעת שגיאה עם טיימר
  const showErrorMessage = (message: string) => {
    // ניקוי טיימר קודם אם קיים
    if (errorTimer) {
      clearTimeout(errorTimer);
    }
    
    setErrorMessage(message);
    
    // הגדרת טיימר חדש ל-5 שניות
    const timer = setTimeout(() => {
      setErrorMessage("");
      setErrorTimer(null);
    }, 5000);
    
    setErrorTimer(timer);
  };

  const handleLogin = async () => {
    console.log("handleLogin function called!");
    
    if (!phoneNumber || !password) {
      showErrorMessage("אנא מלא את כל השדות");
      return;
    }

    // בדיקה שמספר הטלפון הוא בדיוק 10 ספרות
    if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      showErrorMessage("מספר טלפון מחייב 10 ספרות");
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage("");
      
      console.log("Starting login with phone and password...");
      
      // קריאה ל-API להתחברות
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // התחברות מוצלחת
        console.log("Login successful:", data.message);
        setErrorMessage(""); // ניקוי שגיאות קודמות
        setSuccessMessage(""); // ניקוי הודעות הצלחה קודמות
        
        // שמירת פרטי המשתמש ב-localStorage
        localStorage.setItem('userPhone', phoneNumber);
        localStorage.setItem('isLoggedIn', 'true');
        
        if (data.message === "משתמש נוצר בהצלחה") {
          // משתמש חדש - הצגת הודעת הצלחה
          setSuccessMessage("משתמש נוצר בהצלחה! הסיסמה שלך נשמרה. כעת תועבר לדף הבית.");
          
          // מעבר לדף הבית אחרי 2 שניות
          setTimeout(() => {
            window.location.href = "/home";
          }, 2000);
        } else {
          // משתמש קיים - מעבר מיידי בלי הודעה
          window.location.href = "/home";
        }
      } else {
        // שגיאה בהתחברות
        showErrorMessage(data.error || "שגיאה בהתחברות");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      showErrorMessage("שגיאה בהתחברות. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div
      className="login-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 10
      }}>

      {/* Main Login Container */}
      <div
        className="login-box"
        style={{
          backgroundImage: 'url(/grey.jpg)', // Background image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: '3px solid black', // Black border
          borderRadius: '32px',
          padding: '32px 24px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          marginTop: isMobile ? '-8rem' : '0' // Mobile positioning
        }}>
        {/* Profile Image Circle */}
        <div style={{
          width: '240px', // Enlarged
          height: '240px', // Enlarged
          borderRadius: '50%',
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none', // No border
          marginBottom: '20px', // More margin
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Daniel Logo */}
          <img 
            src="/daniellogo.png" // Custom logo
            alt="Daniel Hair Design Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%'
            }}
            onError={(e) => {
              // Fallback if image doesn't exist
              e.currentTarget.style.display = 'none';
              const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextSibling) {
                nextSibling.style.display = 'flex';
              }
            }}
          />
          {/* Fallback icon */}
          <div style={{
            fontSize: '64px',
            color: '#999',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}>
            👤
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white', // Changed to white
          margin: '0',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          Namimi-Hair Design {/* New title text */}
        </h1>

        {/* Social Icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '16px'
        }}>
          {/* Waze */}
          <div style={{
            background: 'transparent', // Transparent background
            border: '2px solid black', // Black border
            borderRadius: '50%', // Perfect circle
            padding: '0px', // No padding
            width: '52px', // Fixed size
            height: '52px', // Fixed size
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            overflow: 'hidden'
          }}
          onClick={() => {
            // Open Waze with the address
            const wazeUrl = `https://waze.com/ul?q=טבריה יפה נוף 4&navigate=yes`;
            window.open(wazeUrl, '_blank');
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <img 
              src="/waze.png" 
              alt="Waze"
              style={{
                width: '48px', // Image size
                height: '48px', // Image size
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: '50%' // Perfect circle
              }}
            />
          </div>

          {/* Phone */}
          <div style={{
            background: 'transparent',
            border: '2px solid black',
            borderRadius: '50%',
            padding: '0px',
            width: '52px',
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            overflow: 'hidden'
          }}
          onClick={() => {
            // Open phone dialer with the number
            window.open('tel:0544920882', '_self');
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <img 
              src="/telephone.png" 
              alt="Phone"
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: '50%'
              }}
            />
          </div>

          {/* WhatsApp */}
          <div style={{
            background: 'transparent',
            border: '2px solid black',
            borderRadius: '50%',
            padding: '0px',
            width: '52px',
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            overflow: 'hidden'
          }}
          onClick={() => {
            // Open WhatsApp with the number
            const whatsappUrl = `https://wa.me/972544920882`;
            window.open(whatsappUrl, '_blank');
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <img 
              src="/whatsapp.png" 
              alt="WhatsApp"
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: '50%'
              }}
            />
          </div>
        </div>



        {/* Login Form */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Phone Number Input */}
          <div style={{
            position: 'relative'
          }}>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="מספר טלפון"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '12px',
                backgroundColor: 'white',
                color: 'black',
                outline: 'none',
                textAlign: 'right',
                direction: 'rtl'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{
            position: 'relative'
          }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '12px',
                backgroundColor: 'white',
                color: 'black',
                outline: 'none',
                textAlign: 'right',
                direction: 'rtl'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              background: isLoading ? '#ccc' : '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(66, 133, 244, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = '#3367d6';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(66, 133, 244, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = '#4285f4';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(66, 133, 244, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'rotate 1s linear infinite'
              }} />
            ) : null}
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            color: '#28a745',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '8px',
            padding: '8px',
            background: 'rgba(40, 167, 69, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(40, 167, 69, 0.3)'
          }}>
            {successMessage}
            <button
              onClick={handleLogout}
              style={{
                marginLeft: '8px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              התנתק
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '8px',
            padding: '8px',
            background: '#dc3545',
            borderRadius: '8px',
            border: '1px solid #dc3545'
          }}>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}