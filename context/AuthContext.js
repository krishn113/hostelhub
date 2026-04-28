"use client";
import { createContext, useContext, useState, useEffect } from "react";
import API from "@/lib/api";   // ✅ import your axios instance

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  // true until /auth/me resolves — prevents pages from redirecting to /login
  // during the brief window before the token check completes on page refresh
  const [loading, setLoading] = useState(true);

  const sendOtp = async (email) => {
    try {
      setLoading(true);

      const res = await API.post("/auth/send-otp", { email });

      return {
        success: true,
        message: res.data.msg,
      };
    } catch (err) {
      console.error("Send OTP error:", err);

      return {
        success: false,
        message: err.response?.data?.msg || "Failed to send OTP",
      };
    } finally {
      setLoading(false);
    }
  };

 
useEffect(() => {
  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false); // no token → definitely logged out
      return;
    }

    try {
      setLoading(true);
      const res = await API.get("/auth/me"); 
      setUser(res.data);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  loadUser();
}, []);

useEffect(() => {
  const syncLogout = (event) => {
    if (event.key === "logout" || event.key === "token") {
      if (!localStorage.getItem("token")) {
        setUser(null);
        window.location.href = "/";
      }
    }
  };

  window.addEventListener("storage", syncLogout);

  return () => {
    window.removeEventListener("storage", syncLogout);
  };
}, []);

  const verifyOtp = async (email, otp) => {
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.msg || "Invalid OTP",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");

    // trigger logout event across tabs
    localStorage.setItem("logout", Date.now());

    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        sendOtp,
        verifyOtp,
        tempUser,
        setTempUser,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}