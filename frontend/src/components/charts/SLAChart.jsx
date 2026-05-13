import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#059669', '#dc2626']

export default function SLAChart({ data }) {
  const chartData = [
    { name: 'On Time', value: data?.on_time ?? 0 },
    { name: 'Breached', value: data?.breached ?? 0 },
  ]

  return (
    <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4">SLA Compliance</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
