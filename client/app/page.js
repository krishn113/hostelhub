"use client";
import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">HostelM</h1>
        <div className="space-x-4">
          <Link href="/login" className="px-5 py-2 text-indigo-600 font-medium hover:bg-slate-50 rounded-lg transition">Login</Link>
          <Link href="/signup" className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col lg:flex-row items-center justify-between px-8 py-20 lg:py-32 max-w-7xl mx-auto">
        <div className="lg:w-1/2 space-y-6">
          <h2 className="text-5xl lg:text-7xl font-extrabold leading-tight text-slate-800">
            Smart Living, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
              Better Campus.
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
            Streamline your hostel experience at IIT Ropar. Manage room allocations, submit complaints, and stay updated with ease.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/signup" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200">
              Get Started
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-lg hover:bg-slate-50 transition">
              Log In
            </Link>
          </div>
        </div>

        {/* Hero Image / Visual */}
        <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

          <div className="relative bg-white/40 backdrop-blur-lg border border-white/50 rounded-2xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
            <div className="space-y-4">
              <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
              <div className="h-32 bg-slate-100 rounded-xl"></div>
              <div className="flex gap-4">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">🏠</div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h3 className="text-3xl font-bold text-center mb-16 text-slate-800">Everything you need</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Room Management", desc: "View and manage room allocations seamlessly.", icon: "🛏️" },
              { title: "Complaints Portal", desc: "Raise issues and track their resolution status in real-time.", icon: "📢" },
              { title: "Digital Noticeboard", desc: "Never miss an important announcement from the warden.", icon: "📌" }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 hover:bg-slate-100 transition border border-slate-100">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold mb-2 text-slate-800">{feature.title}</h4>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t">
        © {new Date().getFullYear()} IIT Ropar Hostel Management. All rights reserved.
      </footer>
    </div>
  );
}
