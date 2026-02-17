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
  const [showPassword, setShowPassword] = useState(false);
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
          key === "degreeType" ? (
            <select
              key={key}
              className="w-full p-3 border rounded mb-2 bg-white"
              value={form.degreeType}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            >
              <option value="">Select Degree</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="PhD">PhD</option>
              <option value="MSc">MSc</option>
            </select>
          ) : (
            <div key={key} className="relative mb-2">
              <input
                type={key === "password" ? (showPassword ? "text" : "password") : "text"}
                placeholder={label}
                className="w-full p-3 border rounded pr-10"
                value={form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
              />
              {key === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-tight"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              )}
            </div>
          )
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
