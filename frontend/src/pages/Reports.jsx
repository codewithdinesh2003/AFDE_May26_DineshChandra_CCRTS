import { useState, useEffect } from 'react'
import api from '../api/axios'
import TrendChart from '../components/charts/TrendChart'
import CategoryChart from '../components/charts/CategoryChart'
import SLAChart from '../components/charts/SLAChart'
import AgentChart from '../components/charts/AgentChart'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Reports() {
  const [trends, setTrends] = useState([])
  const [categories, setCategories] = useState([])
  const [sla, setSla] = useState(null)
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/trends'),
      api.get('/dashboard/category-breakdown'),
      api.get('/dashboard/sla-status'),
      api.get('/dashboard/agent-performance'),
    ]).then(([tr, cat, sl, ag]) => {
      setTrends(tr.data)
      setCategories(cat.data.filter((c) => c.count > 0))
      setSla(sl.data)
      setAgents(ag.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size={40} />
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TrendChart data={trends} />
        {categories.length > 0 && <CategoryChart data={categories} />}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SLAChart data={sla} />
        {agents.length > 0 && <AgentChart data={agents} />}
      </div>

      {/* Agent Table */}
      {agents.length > 0 && (
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h3 className="text-white font-semibold text-sm">Agent Performance Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Agent', 'Total Assigned', 'Resolved', 'Resolution Rate', 'Avg Resolution Time'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => {
                  const rate = a.total > 0 ? Math.round((a.resolved / a.total) * 100) : 0
                  return (
                    <tr key={a.agent_id} className="border-b border-slate-700/40 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
                            {a.name[0]}
                          </div>
                          <span className="text-slate-200">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{a.total}</td>
                      <td className="px-5 py-3 text-green-400">{a.resolved}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{rate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-400">{a.avg_resolution_hours}h</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
