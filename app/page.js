"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import PWAButton from "@/components/PWAButton";

const LINES = [
  "Welcome to HostelHub",
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
        setDisplayed((prev) => {
          const next = [...prev];
          next[lineIndex] = currentLine.slice(0, charIndex + 1);
          return next;
        });
        setCharIndex((c) => c + 1);
      }, 55);
      return () => clearTimeout(timer);
    } else if (lineIndex < LINES.length - 1) {
      const timer = setTimeout(() => {
        setLineIndex((l) => l + 1);
        setCharIndex(0);
        setDisplayed((prev) => [...prev, ""]);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [lineIndex, charIndex]);

  return (
    <div className="relative bg-white/35 backdrop-blur-md border border-white/40 rounded-2xl p-5 md:p-8 shadow-2xl transform rotate-0 md:rotate-2 hover:rotate-0 transition duration-500 overflow-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
      
      {/* Visual Template Background */}
      <div className="space-y-4 opacity-50 md:opacity-100">
        <div className="h-4 w-1/3 bg-slate-300/80 rounded-full"></div>
        <div className="h-32 bg-white rounded-xl shadow-sm"></div>
        <div className="flex gap-4 items-center">
          <div className="h-11 w-11 bg-slate-200 rounded-full flex-shrink-0"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-3/4 bg-slate-300/80 rounded-full"></div>
            <div className="h-3 w-1/2 bg-slate-300/60 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Calligraphy Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center gap-1 md:gap-2 px-6 md:px-10">
        {LINES.map((_, i) => (
          <p
            key={i}
            style={{ fontFamily: "'Dancing Script', cursive" }}
            className={`leading-tight transition-opacity duration-300 ${
              i === 0 ? "text-slate-800 text-xl md:text-2xl font-bold" :
              i === 1 ? "text-indigo-700 text-lg md:text-xl" :
              "text-slate-500 text-base md:text-lg"
            } ${i <= lineIndex ? "opacity-100" : "opacity-0"}`}
          >
            {displayed[i] || ""}
            {i === lineIndex && lineIndex < LINES.length && (
              <span className="inline-block w-0.5 h-4 md:h-5 bg-indigo-500 ml-1 animate-pulse align-middle" />
            )}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen text-slate-900 overflow-x-hidden">
      {/* Background Setup */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/wp.jpg.jpeg')" }}
      >
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 font-sans">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-4 md:px-10 py-3 md:py-4 bg-black/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/10">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/logo_black.png" alt="IIT Ropar Logo" className="h-10 w-10 md:h-16 md:w-16 object-contain" />
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">HostelHub</h1>
          </div>
          <div className="flex gap-2 md:gap-4">
            <Link href="/login" className="px-3 md:px-5 py-2 text-white text-sm md:text-base font-bold hover:bg-white/10 rounded-lg transition">
              Login
            </Link>
            <Link href="/signup" className="px-3 md:px-5 py-2 bg-indigo-600 text-white text-sm md:text-base font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 py-12 md:py-20 lg:py-32 max-w-7xl mx-auto gap-12">
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] text-white drop-shadow-xl">
              Smart Living, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Better Campus.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-200 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              Streamline your hostel experience at IIT Ropar. Manage room allocations, submit complaints, and stay updated with ease.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/30 text-center">
                Get Started
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition text-center">
                Log In
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="w-full lg:w-1/2 relative max-w-md lg:max-w-none">
            {/* Background Blobs - Smaller and subtle on mobile */}
            <div className="absolute -top-10 -right-10 w-48 md:w-72 h-48 md:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -top-10 -left-10 w-48 md:w-72 h-48 md:h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            
            <CalligraphyBox />
          </div>
        </header>

        {/* Features Grid */}
        <section className="py-16 md:py-24 bg-slate-900/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-20 text-white">Everything you need</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { title: "Room Management", desc: "View and manage room allocations seamlessly.", icon: "🛏️" },
                { title: "Complaints Portal", desc: "Raise issues and track their resolution status in real-time.", icon: "📢" },
                { title: "Digital Noticeboard", desc: "Never miss an important announcement from the warden.", icon: "📌" }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-all duration-500 border border-white/10 shadow-lg backdrop-blur-md group hover:-translate-y-2">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition duration-300">{feature.icon}</div>
                  <h4 className="text-2xl font-bold mb-3 text-white">{feature.title}</h4>
                  <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 text-center text-slate-400 font-medium text-sm border-t border-white/10 bg-black/20">
          <div className="max-w-7xl mx-auto px-6">
            © {new Date().getFullYear()} IIT Ropar Hostel Management. All rights reserved.
          </div>
        </footer>
        <PWAButton />
      </div>
    </div>
  );
}