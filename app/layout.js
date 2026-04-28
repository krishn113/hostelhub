import "./globals.css";
import AuthProvider from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "HostelHub",
  description: "Hostel Management System",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      
      <head>
        {/* PWA Support */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS Support */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Theme */}
        <meta name="theme-color" content="#4f46e5" />
      </head>

      <body>
        <AuthProvider>
          {children}
        </AuthProvider>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}