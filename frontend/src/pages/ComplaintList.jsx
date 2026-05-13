import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Filter, X } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/common/StatusBadge'
import PriorityBadge from '../components/common/PriorityBadge'
import SearchBar from '../components/common/SearchBar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/formatters'

const STATUSES   = ['Open', 'In Progress', 'Resolved', 'Closed', 'Escalated']
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

export default function ComplaintList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '', priority: '', category_id: '' })
  const debounceRef = useRef(null)

  const load = useCallback(async (q, f) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q)            params.set('keyword', q)
    if (f.status)     params.set('status', f.status)
    if (f.priority)   params.set('priority', f.priority)
    if (f.category_id) params.set('category_id', f.category_id)
    try {
      const { data } = await api.get(`/complaints/?${params}`)
      setComplaints(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    api.get('/dashboard/category-breakdown').then(({ data }) => setCategories(data)).catch(() => {})
    load('', { status: '', priority: '', category_id: '' })
  }, [load])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(search, filters), 400)
    return () => clearTimeout(debounceRef.current)
  }, [search, filters, load])

  function resetFilters() {
    setSearch('')
    setFilters({ status: '', priority: '', category_id: '' })
  }

  const hasFilters = search || filters.status || filters.priority || filters.category_id

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={setSearch} placeholder="Search complaints…" />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Priority</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select
          value={filters.category_id}
          onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
          className="px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.category} value={c.category}>{c.category}</option>)}
        </select>
        {hasFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" /> Reset
          </button>
        )}
        <Link
          to="/complaints/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm rounded-lg transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" /> New
        </Link>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {['Complaint #', 'Subject', 'Category', 'Priority', 'Status', 'Assigned To', 'Created'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-slate-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><LoadingSpinner size={32} className="mx-auto" /></td></tr>
              ) : complaints.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-500">No complaints found</td></tr>
              ) : complaints.map((c) => (
                <tr
                  key={c.complaint_id}
                  onClick={() => navigate(`/complaints/${c.complaint_id}`)}
                  className="border-b border-slate-700/40 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 font-mono text-xs text-blue-400">{c.complaint_number}</td>
                  <td className="px-5 py-3 text-slate-200 max-w-[220px] truncate">{c.subject}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{c.category?.category_name ?? '—'}</td>
                  <td className="px-5 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{c.assigned_agent?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-5 py-3 border-t border-slate-700 text-xs text-slate-500">
            {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
