import "./globals.css";
import AuthProvider from "../context/AuthContext";

export const metadata = {
  title: "...",
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}