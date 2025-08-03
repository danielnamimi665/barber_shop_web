"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Services() {
  const router = useRouter();
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
      router.push("/login");
    }
  }, [status, router]);

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

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Main content - Service selection */}
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
        <div style={{
          background: 'rgba(31, 41, 55, 0.95)',
          borderRadius: '24px',
          padding: '32px 16px 24px 16px',
          minWidth: '90vw',
          maxWidth: isMobile ? '350px' : '400px',
          width: isMobile ? '90vw' : 'fit-content',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
        }}>
          <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
            בחר שירות לקביעת התור
          </div>
          <button
            onClick={() => {
              localStorage.setItem('serviceType', 'תספורת+עיצוב זקן');
              router.push('/booking');
            }}
            style={{
              width: isMobile ? '90%' : '95%',
              maxWidth: '500px',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '24px',
              padding: '18px 32px',
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              direction: 'rtl',
              gap: 8
            }}>
            <span>תספורת+עיצוב זקן</span>
            <span>70 ש"ח</span>
          </button>
          <button
            onClick={() => {
              localStorage.setItem('serviceType', 'תספורת ללא זקן');
              router.push('/booking');
            }}
            style={{
              width: isMobile ? '90%' : '95%',
              maxWidth: '500px',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '24px',
              padding: '18px 32px',
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              direction: 'rtl',
              gap: 8
            }}>
            <span>תספורת ללא זקן</span>
            <span>60 ש"ח</span>
          </button>
          <button
            onClick={() => {
              localStorage.setItem('serviceType', 'תספורת חיילים');
              router.push('/booking');
            }}
            style={{
              width: isMobile ? '90%' : '95%',
              maxWidth: '500px',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '24px',
              padding: '18px 32px',
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              direction: 'rtl',
              gap: 8
            }}>
            <span>תספורת חיילים</span>
            <span>50 ש"ח</span>
          </button>
          <button
            style={{
              marginTop: 12,
              background: 'white',
              color: 'black',
              border: '1.5px solid black',
              borderRadius: '16px',
              padding: '10px 32px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              alignSelf: 'flex-end',
            }}
            onClick={() => router.push('/home')}
          >
            חזור
          </button>
        </div>
      </main>
    </div>
  );
} 