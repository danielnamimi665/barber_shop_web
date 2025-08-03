"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const menuItems = [
    { label: "דף הבית", href: "/home" },
    { label: "התורים שלי", href: "/appointments" },
    { label: "יצירת קשר", href: "/contact" },
  ];

  useEffect(() => {
    if (menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: window.innerWidth - 210 // Adjusted for right-side positioning
      });
    }
  }, [menuOpen]);

  const handleLogoClick = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLogin = () => {
    if (adminPassword === "barber") {
      setShowAdminLogin(false);
      setAdminPassword("");
      setLoginError("");
      router.push("/admin-dashboard");
    } else {
      setLoginError("סיסמה שגויה");
    }
  };

  const handleBackToHome = () => {
    setShowAdminLogin(false);
    setAdminPassword("");
    setLoginError("");
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Header */}
      <header style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 2rem 0 2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          {/* Hamburger menu - Left side */}
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              width: '40px',
              height: '40px',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              border: '2px solid white',
              borderRadius: '8px',
              cursor: 'pointer',
              zIndex: 1000,
              transition: 'all 0.2s ease'
            }}
            aria-label="menu"
          >
            <span style={{
              display: 'block',
              height: '3px',
              width: '20px',
              backgroundColor: 'white',
              borderRadius: '2px',
              transition: 'transform 0.3s ease'
            }}></span>
            <span style={{
              display: 'block',
              height: '3px',
              width: '20px',
              backgroundColor: 'white',
              borderRadius: '2px',
              transition: 'transform 0.3s ease'
            }}></span>
            <span style={{
              display: 'block',
              height: '3px',
              width: '20px',
              backgroundColor: 'white',
              borderRadius: '2px',
              transition: 'transform 0.3s ease'
            }}></span>
          </button>

          {/* Logo - Right side */}
          <div
            onClick={handleLogoClick}
            style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: 'black',
              textShadow: '0 0 12px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5)',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
              position: 'relative',
              zIndex: 10,
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLDivElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLDivElement).style.transform = 'scale(1)';
            }}
          >
            Amir Hair Design
          </div>
        </div>
        {/* Black line under header */}
        <div style={{
          width: '100vw',
          height: '6px',
          background: 'black',
          opacity: 1,
          marginLeft: '-2rem',
          marginRight: '-2rem'
        }} />
      </header>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 24px',
            minWidth: '350px',
            maxWidth: '500px',
            color: 'black',
            textAlign: 'center',
            boxShadow: '0 8px 32px (0,0,0,0.3)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: 'black'
            }}>
              התחברות אדמין
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="הכנס סיסמה"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  color: 'black',
                  outline: 'none',
                  textAlign: 'center'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminLogin();
                  }
                }}
              />
            </div>

            {loginError && (
              <div style={{
                color: '#dc3545',
                fontSize: '14px',
                marginBottom: '16px',
                fontWeight: 'bold'
              }}>
                {loginError}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleAdminLogin}
                style={{
                  background: '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                התחבר
              </button>

              <button
                onClick={handleBackToHome}
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
          </div>
        </div>
      )}

      {/* Dropdown Menu - Rendered at root level */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: menuPosition.top,
          left: menuPosition.left,
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          border: '1px solid #374151',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          minWidth: '200px',
          padding: '0.5rem 0',
          maxHeight: '300px',
          overflow: 'visible',
          backdropFilter: 'blur(10px)'
        }}>
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                color: 'white',
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = 'rgba(55, 65, 81, 0.8)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </a>
          ))}
          
          {/* Sign In/Out Button */}
          {session ? (
            <button
              onClick={handleSignOut}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                color: 'white',
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'background-color 0.2s ease',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'right'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(55, 65, 81, 0.8)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              התנתקות ({session.user?.name || session.user?.email})
            </button>
          ) : (
            <a
              href="/login"
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                color: 'white',
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = 'rgba(55, 65, 81, 0.8)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = 'transparent';
              }}
            >
              התחברות
            </a>
          )}
        </div>
      )}
    </>
  );
} 