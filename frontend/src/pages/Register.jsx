import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../components/common/Toast'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Register() {
  const toast = useToast()
  const navigate = useNavigate()
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', role_id: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/users/roles').then(({ data }) => {
      const customerRole = data.find((r) => r.role_name === 'Customer')
      setRoles(data.filter((r) => r.role_name === 'Customer'))
      if (customerRole) setForm((f) => ({ ...f, role_id: customerRole.role_id }))
    }).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast('Account created! Please sign in.', 'success')
      navigate('/login')
    } catch (err) {
      toast(err.response?.data?.detail ?? 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#2563eb] flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-slate-400 text-sm mt-1">Join CCRTS as a customer</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-slate-700 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Email address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Min 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <LoadingSpinner size={18} /> : null}
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
