import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import PriorityBadge from '../components/common/PriorityBadge'
import TrendChart from '../components/charts/TrendChart'
import CategoryChart from '../components/charts/CategoryChart'
import SLAChart from '../components/charts/SLAChart'
import AgentChart from '../components/charts/AgentChart'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/formatters'
import { ROLES } from '../utils/roleGuard'

export default function Dashboard() {
  const { user } = useAuth()
  const role = user?.role
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState([])
  const [categories, setCategories] = useState([])
  const [sla, setSla] = useState(null)
  const [agents, setAgents] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/trends'),
      api.get('/dashboard/category-breakdown'),
      api.get('/dashboard/sla-status'),
      api.get('/dashboard/agent-performance'),
      api.get('/complaints/?limit=5'),
    ]).then(([s, tr, cat, sl, ag, rc]) => {
      setStats(s.data)
      setTrends(tr.data)
      setCategories(cat.data)
      setSla(sl.data)
      setAgents(ag.data)
      setRecent(rc.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size={40} />
    </div>
  )

  const isPrivileged = [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.QA].includes(role)

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total"       value={stats?.total}       icon={FileText}      color="#2563eb" />
        <StatCard label="Open"        value={stats?.open}        icon={Clock}         color="#f59e0b" />
        <StatCard label="In Progress" value={stats?.in_progress} icon={TrendingUp}    color="#7c3aed" />
        <StatCard label="Resolved"    value={stats?.resolved}    icon={CheckCircle}   color="#059669" />
        <StatCard label="Closed"      value={stats?.closed}      icon={XCircle}       color="#64748b" />
        <StatCard label="Escalated"   value={stats?.escalated}   icon={AlertTriangle} color="#dc2626" />
        <StatCard label="SLA Breached" value={stats?.sla_breached} icon={AlertTriangle} color="#ef4444" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendChart data={trends} />
        <CategoryChart data={categories.filter(c => c.count > 0)} />
      </div>

      {isPrivileged && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SLAChart data={sla} />
          {agents.length > 0 && <AgentChart data={agents} />}
        </div>
      )}

      {/* Recent complaints */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h3 className="text-white font-semibold text-sm">Recent Complaints</h3>
          <Link to="/complaints" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {['#', 'Subject', 'Category', 'Priority', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => (
                <tr key={c.complaint_id} className="border-b border-slate-700/40 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/complaints/${c.complaint_id}`} className="text-blue-400 hover:underline font-mono text-xs">
                      {c.complaint_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-200 max-w-[200px] truncate">{c.subject}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{c.category?.category_name ?? '—'}</td>
                  <td className="px-5 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(c.created_at)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">No complaints yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
