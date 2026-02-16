"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    year: "",
    entryNumber: "",
    degreeType: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);
  const { sendOtp, setTempUser } = useAuth();
  const router = useRouter();

  const handle = async () => {
    const { name, email, password, year, entryNumber, degreeType, phone } = form;

    if (!email.endsWith("@iitrpr.ac.in"))
      return alert("Use IITRPR email");

    if (!password)
      return alert("Password required");

    setLoading(true);

    // store full signup data temporarily
    setTempUser({
      name,
      email,
      password,
      year,
      entryNumber,
      degreeType,
      phone
    });

    const res = await sendOtp(email);
    setLoading(false);

    if (res?.success) router.push("/otp");
    else alert("Failed to send OTP");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb] px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-indigo-700">
          Student Signup
        </h2>

        {[
          ["name", "Name"],
          ["email", "Email"],
          ["password", "Password"],
          ["phone", "Phone"],
          ["year", "Year"],
          ["entryNumber", "Entry Number"],
          ["degreeType", "Degree"]
        ].map(([key, label]) => (
          <input
            key={key}
            type={key === "password" ? "password" : "text"}
            placeholder={label}
            className="w-full p-3 border rounded mb-2"
            onChange={(e) =>
              setForm({ ...form, [key]: e.target.value })
            }
          />
        ))}

        <button
          onClick={handle}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl mt-3 disabled:opacity-50"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
}
