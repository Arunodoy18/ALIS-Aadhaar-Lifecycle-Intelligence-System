import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALIS - Aadhaar Lifecycle Intelligence System",
  description: "National Aadhaar Lifecycle Monitoring Platform by UIDAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <footer className="bg-gray-800 text-white py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-sm text-gray-400">
                  ALIS - Aadhaar Lifecycle Intelligence System | UIDAI
                </p>
              </div>
            </footer>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
