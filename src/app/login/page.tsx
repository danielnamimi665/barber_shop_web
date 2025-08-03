"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function Login() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already signed in
  useEffect(() => {
    if (session) {
      console.log("User is signed in, redirecting to home:", session);
      router.push("/home");
    }
  }, [session, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(""); // Clear any previous errors
      
      console.log("Starting Google sign in...");
      
      // Use redirect: true to automatically redirect after successful sign in
      await signIn("google", { 
        callbackUrl: "/home",
        redirect: true 
      });
      
      console.log("Google sign in completed");
      // The redirect will happen automatically after successful sign in
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
        color: 'white'
      }}>
        טוען...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      zIndex: 10
    }}>

      {/* Main Login Container */}
      <div style={{
        background: 'white',
        borderRadius: '32px',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Profile Image Circle */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #e0e0e0',
          marginBottom: '8px'
        }}>
          <div style={{
            fontSize: '32px',
            color: '#999'
          }}>
            👤
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'black',
          margin: '0',
          textAlign: 'center'
        }}>
          התחברות
        </h1>

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