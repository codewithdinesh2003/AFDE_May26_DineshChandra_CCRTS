export default function StatCard({ label, value, icon: Icon, color = '#2563eb', sub }) {
  return (
    <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}
