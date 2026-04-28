import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { X } from 'lucide-react';

const CalendarModal = ({ isOpen, onClose, complaints, onSelectDate }) => {
  if (!isOpen) return null;

  // Function to get the status color for the calendar dot
  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      // Find complaints on this specific date
      const dayComplaints = complaints.filter(c => 
        new Date(c.createdAt).toDateString() === date.toDateString()
      );

      return (
        <div className="flex justify-center gap-0.5 mt-1">
          {dayComplaints.map((c, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full ${
                c.status === 'Resolved' ? 'bg-emerald-500' : 
                c.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-400'
              }`}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Maintenance Calendar</h2>
        
        <div className="custom-calendar-container">
          <Calendar 
            tileContent={getTileContent}
            onClickDay={(date) => {
              onSelectDate(date);
              onClose();
            }}
            className="border-none font-sans w-full"
          />
        </div>

        <div className="mt-6 flex gap-4 justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"/> Pending</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Fixed</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"/> Rejected</div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;