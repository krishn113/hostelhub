import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children, role }) {
  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Dynamic Sidebar based on role */}
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar role={role} />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}