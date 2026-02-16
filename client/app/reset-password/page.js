"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email");

    const [email, setEmail] = useState(emailParam || "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handle = async () => {
        if (!otp || !newPassword) return alert("Fill all fields");

        try {
            setLoading(true);
            await axios.post(`${API}/auth/reset-password`, {
                email,
                otp,
                newPassword,
            });

            alert("Password reset successful! Please login.");
            router.push("/login");
        } catch (err) {
            alert(err.response?.data?.msg || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
            <div className="bg-white p-6 rounded-xl shadow w-80">
                <h2 className="text-xl font-bold mb-3">Reset Password</h2>

                <input
                    className="w-full p-3 border rounded mb-2"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!emailParam}
                />

                <input
                    className="w-full p-3 border rounded mb-2"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />

                <input
                    type="password"
                    className="w-full p-3 border rounded mb-4"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <button
                    onClick={handle}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-50"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
