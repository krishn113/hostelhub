"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const router = useRouter();

const handle = async () => {
  if (!email.endsWith("@iitrpr.ac.in")) {
    toast.error("Please use your IIT Ropar email");
    return;
  }

  try {
    setLoading(true);

    // 1. Initial Login to get the token
    const res = await API.post("/auth/login", { email, password });
    
    // 2. Save token immediately so the interceptor can use it for the next call
    localStorage.setItem("token", res.data.token);

    // 3. Fetch the full profile (year, gender, hostelName, etc.)
    try {
      const profileRes = await API.get("/auth/me");
      
      // 4. Set the FULL user data into context
      setUser(profileRes.data);

      // 5. Navigate using the role from the complete profile
      const role = profileRes.data.role;
      if (role === "admin") router.push("/dashboard/admin");
      else if (role === "warden") router.push("/dashboard/warden");
      else if (role === "caretaker") router.push("/dashboard/caretaker/students");
      else router.push("/dashboard/student");

    } catch (profileErr) {
      console.error("Profile hydration failed:", profileErr);
      // Fallback: If profile fetch fails, set basic data so the app doesn't crash
      setUser({
        email: res.data.email,
        role: res.data.role,
      });
      router.push("/dashboard/student");
    }

  } catch (err) {
    toast.error(err.response?.data?.msg || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ backgroundImage: "url('/sab.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
    >
      <div className="absolute inset-0 bg-slate-900/50"></div>
      
      <div className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-2xl shadow-xl relative z-10">

        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img
            src="/iitrpr-logo.png"
            alt="IIT Ropar"
            className="h-14"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Hostel Management Portal
        </h2>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="IITRPR Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex justify-end">

            <a
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-white hover:underline cursor-pointer"
            >
              Forgot Password?
            </a>
          </div>

          <button
            onClick={handle}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>



    {/* SIGNUP LINK */}
    <p className="text-center text-sm text-white">
      Don't have an account?{" "}
      <span
        onClick={() => router.push("/signup")}
        className="text-white font-bold cursor-pointer hover:underline"
      >
        Sign up
      </span>
    </p>

        </div>

        <p className="text-center text-xs text-white mt-6 font-medium">
          Only IIT Ropar email accounts are allowed
        </p>

      </div>

    </div>
  );
}