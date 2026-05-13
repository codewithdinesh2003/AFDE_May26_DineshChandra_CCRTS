import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../components/common/Toast'
import LoadingSpinner from '../components/common/LoadingSpinner'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export default function ComplaintForm() {
  const toast = useToast()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    subject: '', description: '', priority: 'Medium', category_id: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/dashboard/categories').then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.subject.trim() || !form.description.trim()) {
      toast('Subject and description are required', 'error')
      return
    }
    setLoading(true)
    try {
      const payload = {
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        ...(form.category_id ? { category_id: Number(form.category_id) } : {}),
      }
      const { data } = await api.post('/complaints/', payload)
      toast('Complaint submitted successfully!', 'success')
      navigate(`/complaints/${data.complaint_id}`)
    } catch (err) {
      toast(err.response?.data?.detail ?? 'Failed to submit', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Submit a Complaint</h2>
            <p className="text-slate-500 text-xs mt-0.5">Fill in the details and we'll get back to you</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              maxLength={200}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Brief summary of your complaint"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Describe your complaint in detail…"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => navigate('/complaints')}
              className="px-5 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <LoadingSpinner size={16} />}
              {loading ? 'Submitting…' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>

      {/* SLA info */}
      <div className="mt-4 bg-[#1e293b]/60 border border-slate-700/30 rounded-xl p-4">
        <p className="text-xs text-slate-500 font-medium mb-2">SLA Response Times</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            ['Critical', '4h',  'text-red-400'],
            ['High',     '24h', 'text-orange-400'],
            ['Medium',   '48h', 'text-yellow-400'],
            ['Low',      '72h', 'text-green-400'],
          ].map(([p, t, cls]) => (
            <div key={p} className="text-center">
              <p className={`text-sm font-bold ${cls}`}>{t}</p>
              <p className="text-[10px] text-slate-500">{p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
