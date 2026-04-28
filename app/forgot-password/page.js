"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handle = async () => {
    if (!email.endsWith("@iitrpr.ac.in")) {
      toast.error("Please use your IIT Ropar email");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/forgot-password", { email });

      toast.success("OTP sent to your email");

      router.push(`/reset-password?email=${encodeURIComponent(email)}`);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/iitrpr-logo.png"
            alt="IIT Ropar"
            className="h-14"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your IIT Ropar email to receive an OTP
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="IITRPR Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handle}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
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