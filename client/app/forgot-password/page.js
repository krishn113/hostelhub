"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handle = async () => {
        if (!email.endsWith("@iitrpr.ac.in")) {
            alert("Use IITRPR email");
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API}/auth/forgot-password`, { email });
            // Pass email to verify step via query param or local storage if needed. 
            // For simplicity, passing via query param is easy, or just ask user to re-enter.
            // Let's pass via URL query param
            router.push(`/reset-password?email=${email}`);
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
            <div className="bg-white p-6 rounded-xl shadow w-80">
                <h2 className="text-xl font-bold mb-3">Forgot Password</h2>
                <p className="text-sm text-gray-600 mb-4">Enter your email to receive an OTP.</p>

                <input
                    className="w-full p-3 border rounded mb-4"
                    placeholder="Email (@iitrpr.ac.in)"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    onClick={handle}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-50"
                >
                    {loading ? "Sending OTP..." : "Send OTP"}
                </button>
            </div>
        </div>
    );
}
