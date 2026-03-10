"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const LINES = [
  "Welcome to HostelM",
  "Your smarter hostel experience",
  "Built for IIT Ropar students",
];

function CalligraphyBox() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayed, setDisplayed] = useState([""]);

  useEffect(() => {
    if (lineIndex >= LINES.length) return;
    const currentLine = LINES[lineIndex];
    if (charIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayed(prev => {
          const next = [...prev];
          next[lineIndex] = currentLine.slice(0, charIndex + 1);
          return next;
        });
        setCharIndex(c => c + 1);
      }, 55);
      return () => clearTimeout(timer);
    } else if (lineIndex < LINES.length - 1) {
      const timer = setTimeout(() => {
        setLineIndex(l => l + 1);
        setCharIndex(0);
        setDisplayed(prev => [...prev, ""]);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [lineIndex, charIndex]);

  return (
    <div className="relative bg-white/35 backdrop-blur-md border border-white/40 rounded-2xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
      
      {/* Original template box content */}
      <div className="space-y-4">
        <div className="h-4 w-1/3 bg-slate-300/80 rounded-full"></div>
        <div className="h-32 bg-white rounded-xl shadow-sm"></div>
        <div className="flex gap-4 items-center">
          <div className="h-11 w-11 bg-slate-200 rounded-full flex items-center justify-center text-xl flex-shrink-0"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-3/4 bg-slate-300/80 rounded-full"></div>
            <div className="h-3 w-1/2 bg-slate-300/60 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Calligraphy animation overlay — sits over the large white rectangle */}
      <div className="absolute top-[4.5rem] left-8 right-8 h-32 flex flex-col justify-center gap-2 px-4">
        {LINES.map((_, i) => (
          <p
            key={i}
            style={{ fontFamily: "'Dancing Script', cursive" }}
            className={`leading-snug transition-opacity duration-300 ${
              i === 0 ? "text-slate-800 text-2xl font-bold" :
              i === 1 ? "text-indigo-700 text-xl" :
              "text-slate-500 text-lg"
            } ${i <= lineIndex ? "opacity-100" : "opacity-0"}`}
          >
            {displayed[i] || ""}
            {i === lineIndex && lineIndex < LINES.length && (
              <span className="inline-block w-0.5 h-5 bg-indigo-500 ml-1 animate-pulse align-middle" />
            )}
          </p>
        ))}
      </div>
    </div>
  );
}


export default function Landing() {
  return (
    <div className="min-h-screen text-slate-900">
      {/* Background Image Setup */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/wp.jpg.jpeg')" }}
      >
        <div className="absolute inset-0 bg-slate-900/40"></div>
      </div>

      <div className="relative z-10 font-sans">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-4 bg-black shadow-sm sticky top-0 z-50 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo_black.png" alt="IIT Ropar Logo" className="h-16 w-16 object-contain" />
            <h1 className="text-2xl font-bold text-white tracking-tight">HostelM</h1>
          </div>
          <div className="space-x-4">
            <Link href="/login" className="px-5 py-2 text-white font-bold hover:bg-white/10 rounded-lg transition">Login</Link>
            <Link href="/signup" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Sign Up</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col lg:flex-row items-center justify-between px-8 py-20 lg:py-32 max-w-7xl mx-auto">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-5xl lg:text-7xl font-extrabold leading-tight text-white drop-shadow-lg">
              Smart Living, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Better Campus.
              </span>
            </h2>
            <p className="text-xl text-slate-200 max-w-lg leading-relaxed font-semibold drop-shadow">
              Streamline your hostel experience at IIT Ropar. Manage room allocations, submit complaints, and stay updated with ease.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/signup" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200">
                Get Started
              </Link>
              <Link href="/login" className="px-8 py-4 bg-white/80 backdrop-blur-md text-slate-700 border border-slate-300 rounded-xl font-bold text-lg hover:bg-white transition shadow-sm">
                Log In
              </Link>
            </div>
          </div>

          {/* Hero Image / Visual */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <CalligraphyBox />
          </div>
        </header>

        {/* Features Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-8">
            <h3 className="text-3xl font-bold text-center mb-16 text-white drop-shadow-lg">Everything you need</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Room Management", desc: "View and manage room allocations seamlessly.", icon: "🛏️" },
                { title: "Complaints Portal", desc: "Raise issues and track their resolution status in real-time.", icon: "📢" },
                { title: "Digital Noticeboard", desc: "Never miss an important announcement from the warden.", icon: "📌" }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-2xl bg-white/70 hover:bg-white transition duration-300 border border-white/80 shadow-sm hover:shadow-xl backdrop-blur-sm group">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition duration-300">{feature.icon}</div>
                  <h4 className="text-2xl font-extrabold mb-3 text-slate-800">{feature.title}</h4>
                  <p className="text-slate-700 font-semibold">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-slate-200 font-bold tracking-wide text-sm border-t border-white/20">
          © {new Date().getFullYear()} IIT Ropar Hostel Management. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
