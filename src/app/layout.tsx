import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import AuthProvider from "./components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amir Hair Design",
  description: "תספורות ועיצוב זקן",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="dark bg-background text-primary min-h-screen">
        <AuthProvider>
          {/* Video Background */}
          <video
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: -1
            }}
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/barbersign.mp4.mp4" type="video/mp4" />
          </video>

          <Header /> {/* Header component imported here */}

          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
