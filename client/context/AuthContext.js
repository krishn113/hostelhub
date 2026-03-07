"use client";
import { createContext, useContext, useState } from "react";
import API from "@/lib/api";   // ✅ import your axios instance

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const [loading, setLoading] = useState(false);

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