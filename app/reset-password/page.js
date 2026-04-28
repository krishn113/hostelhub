"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/lib/api";
import toast from "react-hot-toast";
import OtpInput from "@/components/OtpInput";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handle = async () => {
    if (!otp || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      toast.success("Password reset successful 🎉");
      router.push("/login");

    } catch (err) {
      toast.error(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src="/iitrpr-logo.png" alt="IIT Ropar" className="h-14" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
          Reset Password
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your new password and OTP
        </p>

        <div className="flex flex-col items-center gap-4">

          {/* Email */}
          <input
            type="email"
            value={email}
            disabled
            className="w-full max-w-xs p-3 border rounded-lg bg-gray-50"
          />

          {/* New Password */}
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full max-w-xs p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          {/* OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Enter 6-digit OTP
            </p>

            <OtpInput
              length={6}
              value={otp}
              onChange={setOtp}
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={handle}
            disabled={loading}
            className="w-full max-w-xs bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </div>

        <p
          onClick={() => router.push("/login")}
          className="text-center text-sm text-indigo-600 hover:underline mt-6 cursor-pointer"
        >
          Back to Login
        </p>

      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}