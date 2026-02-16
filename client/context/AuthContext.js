"use client";
import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ REAL OTP SEND
  const sendOtp = async (email) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/auth/send-otp`, { email });
      return { success: true, message: res.data.msg };
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

  // ✅ REAL OTP VERIFY
  const verifyOtp = async (email, otp) => {
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, { email, otp });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.msg || "Invalid OTP",
      };
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
