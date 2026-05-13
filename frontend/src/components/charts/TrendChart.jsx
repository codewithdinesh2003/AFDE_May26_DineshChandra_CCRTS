import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

export default function TrendChart({ data }) {
  return (
    <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4">Complaint Trends (Last 6 Months)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#60a5fa' }}
          />
          <Area type="monotone" dataKey="count" stroke="#2563eb" fill="url(#cGrad)" strokeWidth={2} dot={{ fill: '#2563eb', r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
