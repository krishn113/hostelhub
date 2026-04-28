export default function StatCard({ title, value, color }) {
  return (
    <div className={`${color} p-5 rounded-xl shadow-md`}>
      <h3 className="text-sm">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
