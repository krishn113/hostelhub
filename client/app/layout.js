import "./globals.css";
import AuthProvider from "@/context/AuthContext";

export const metadata = {
  title: "...",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}