export default function StatsCard({ title, value, icon, color = '#168FE3', sub }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 flex items-start gap-4">
      <div
        style={{ backgroundColor: color + '14', color, width: 44, height: 44 }}
        className="rounded-md flex items-center justify-center text-xl shrink-0"
      >
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-semibold mb-1">{title}</p>
        <p className="text-3xl font-extrabold leading-tight tracking-tight text-navy">{value}</p>
        {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}
