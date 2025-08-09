"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("User is signed in, redirecting to home:", session);
      router.push("/home");
    }
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    console.log("handleGoogleSignIn function called!"); // Debug log
    try {
      setIsGoogleLoading(true);
      setErrorMessage(""); // Clear any previous errors
      
      console.log("Starting Google sign in...");
      console.log("signIn function:", signIn); // Debug log
      
      // Check if we're in the right environment
      console.log("Current URL:", window.location.href);
      console.log("User Agent:", navigator.userAgent);
      console.log("Is Mobile:", /Mobile|Android|iPhone|iPad/.test(navigator.userAgent));
      
      // Try to get the base URL dynamically
      const baseUrl = window.location.origin;
      console.log("Base URL:", baseUrl);
      console.log("Current host:", window.location.host);
      console.log("Is localhost:", window.location.hostname === 'localhost');
      
      // Try different approach for mobile
      if (/Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
        console.log("Mobile detected, using direct redirect");
        try {
          await signIn("google", { 
            callbackUrl: `${baseUrl}/home`,
            redirect: true 
          });
          return;
        } catch (mobileError) {
          console.error("Mobile sign in error:", mobileError);
          setErrorMessage("שגיאה במובייל - נסה לרענן את הדף");
          setIsGoogleLoading(false);
          return;
        }
      }
      
      // Use redirect: false to see what happens for desktop
      const result = await signIn("google", { 
        callbackUrl: `${baseUrl}/home`,
        redirect: false 
      });
      
      console.log("Sign in result:", result);
      
      if (result?.error) {
        console.error("Google sign in error:", result.error);
        setErrorMessage(`שגיאה: ${result.error}`);
        setIsGoogleLoading(false);
      } else if (result?.url) {
        console.log("Redirecting to:", result.url);
        // Try using window.location.replace instead of href for mobile
        if (/Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
          window.location.replace(result.url);
        } else {
          window.location.href = result.url;
        }
      } else {
        console.log("Unknown result:", result);
        // If no URL returned, try manual redirect
        setTimeout(() => {
          window.location.href = `${baseUrl}/home`;
        }, 1000);
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      setErrorMessage("שגיאה בהתחברות עם גוגל, נסה שוב");
      setIsGoogleLoading(false);
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

  if (status === "authenticated" && session) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        מפנה לדף הבית...
      </div>
    );
  }

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
          backgroundImage: 'url(/grey.png.jpg)', // Background image
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
          width: '200px', // Enlarged
          height: '200px', // Enlarged
          borderRadius: '50%',
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px solid #e0e0e0', // Thicker border
          marginBottom: '20px', // More margin
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Daniel Logo */}
          <img 
            src="/logodaniel.png.png" // Custom logo
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
              e.currentTarget.nextElementSibling.style.display = 'flex';
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
              src="/waze.png.png" 
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
              src="/telephone.png.png" 
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
              src="/whatsapp.png.png" 
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



        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          style={{
            width: '100%',
            background: isGoogleLoading ? '#ccc' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(66, 133, 244, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!isGoogleLoading) {
              e.currentTarget.style.background = '#3367d6';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(66, 133, 244, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isGoogleLoading) {
              e.currentTarget.style.background = '#4285f4';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(66, 133, 244, 0.3)';
            }
          }}
        >
          {isGoogleLoading ? (
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ffffff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'rotate 1s linear infinite'
            }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {isGoogleLoading ? 'מתחבר...' : 'התחבר עם Google'}
        </button>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            color: errorMessage.includes('בהצלחה') ? '#28a745' : '#dc3545',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '8px'
          }}>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}