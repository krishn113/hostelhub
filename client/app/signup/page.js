"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Signup() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    year: "",
    entryNumber: "",
    degreeType: "",
    phone: "",
    gender: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { sendOtp, setTempUser } = useAuth();
  const router = useRouter();

  const update = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  

  const validate = () => {

    const {
      name,
      email,
      password,
      year,
      entryNumber,
      degreeType,
      phone,
      gender
    } = form;

    if (!name.trim()) {
      toast.error("Name required");
      return false;
    }

    if (!email.endsWith("@iitrpr.ac.in")) {
      toast.error("Use IIT Ropar email");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error("Enter valid 10 digit phone number");
      return false;
    }

    if (!entryNumber.trim()) {
      toast.error("Entry number required");
      return false;
    }

    if (!/^\d{4}$/.test(year)) {
      toast.error("Enter valid admission year (e.g. 2023)");
      return false;
    }

    if (year < 2000 || year > new Date().getFullYear()) {
      toast.error("Invalid admission year");
      return false;
    }

    if (!year) {
      toast.error("Select year");
      return false;
    }

    if (!degreeType) {
      toast.error("Select degree");
      return false;
    }

    if (!gender) {
      toast.error("Select gender");
      return false;
    }

    return true;
  };

  const handle = async () => {

    if (!validate()) return;

    setLoading(true);

    setTempUser(form);

    const res = await sendOtp(form.email);

    setLoading(false);

    if (res?.success) router.push("/otp");
    else toast.error("Failed to send OTP");

  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10 px-4 relative"
      style={{ backgroundImage: "url('/sab.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
    >
      <div className="absolute inset-0 bg-slate-900/50"></div>

      <div className="w-full max-w-lg bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-2xl shadow-xl relative z-10">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src="/iitrpr-logo.png" className="h-14" />
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Student Signup
        </h2>

        <div className="space-y-3">

          {/* Name */}
          <input
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />

          {/* Email */}
          <input
            placeholder="IITRPR Email"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-600 font-semibold"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Two Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              placeholder="Phone"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />

            <input
              placeholder="Entry Number"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.entryNumber}
              onChange={(e) => update("entryNumber", e.target.value)}
            />

            <input
              type="number"
              placeholder="Admission Year (e.g. 2023)"
              min="2000"
              max={new Date().getFullYear()}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
            />

            <select
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.degreeType}
              onChange={(e) => update("degreeType", e.target.value)}
            >
              <option value="">Degree</option>
              <option>B.Tech</option>
              <option>M.Tech</option>
              <option>MSc</option>
              <option>PhD</option>
            </select>

            <select
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none md:col-span-2"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>

          </div>

          {/* Submit */}
          <button
            onClick={handle}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

        </div>

        <p className="text-center text-sm text-white mt-6">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-white font-bold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}