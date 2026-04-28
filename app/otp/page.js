"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import API from "@/lib/api";
import toast from "react-hot-toast";
import OtpInput from "@/components/OtpInput";

export default function OTP() {

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const { tempUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!tempUser?.email) {
      router.replace("/signup");
    }
  }, [tempUser, router]);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handle = async () => {

    if (!otp || otp.length !== 6) {
      toast.error("Enter valid 6 digit OTP");
      return;
    }

    try {

      setLoading(true);

      await API.post("/auth/verify-otp", {
        email: tempUser.email,
        otp
      });

      await API.post("/auth/signup", tempUser);

      toast.success("Signup successful!");

      router.push("/login");

    } catch (err) {
      toast.error(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await API.post("/auth/send-otp", { email: tempUser.email });
      toast.success("OTP resent");
      setTimer(30);
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/iitrpr-logo.png" className="h-14" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Verify OTP
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          OTP sent to
          <br />
          <span className="font-medium text-gray-700">
            {tempUser?.email}
          </span>
        </p>

        {/* OTP Input */}
        <OtpInput
          length={6}
          value={otp}
          onChange={setOtp}
        />

        {/* Verify Button */}
        <button
          onClick={handle}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-2 mt-4 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Resend */}
        <div className="mt-4 text-sm">

          {timer > 0 ? (
            <p className="text-gray-500">
              Resend OTP in <span className="font-semibold">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={resendOtp}
              className="text-indigo-600 hover:underline font-medium"
            >
              Resend OTP
            </button>
          )}

        </div>

      </div>
    </div>
  );
}