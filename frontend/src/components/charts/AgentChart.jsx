import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export default function AgentChart({ data }) {
  const chartData = data.map((a) => ({
    name: a.name.split(' ')[0],
    Total: a.total,
    Resolved: a.resolved,
  }))

  return (
    <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4">Agent Performance</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          <Bar dataKey="Total"    fill="#2563eb" radius={[3,3,0,0]} />
          <Bar dataKey="Resolved" fill="#059669" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
