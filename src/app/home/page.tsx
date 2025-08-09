"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Home() {
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
      {/* Main content - Center circle */}
      <main style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 10,
        marginTop: isMobile ? 'max(80px, 10vh)' : '0'
      }}>
        <div
          style={{
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'transparent', // Transparent background
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid black', // Black border
            marginBottom: '20px',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer'
          }}
          onClick={() => router.push('/services')}
        >
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
              e.currentTarget.style.display = 'none';
              const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextSibling) {
                nextSibling.style.display = 'flex';
              }
            }}
          />
          {/* Fallback content */}
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}>
            <div>
              <div style={{
                color: '#d1d5db',
                fontSize: '1.25rem',
                marginBottom: '1rem'
              }}>
                תמונה תוצג כאן
              </div>
              <div style={{
                color: '#9ca3af',
                fontSize: '1rem'
              }}>
                Image will appear here
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 