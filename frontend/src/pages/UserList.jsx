import { useState, useEffect } from 'react'
import { Plus, Edit2, UserX } from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../components/common/Toast'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/formatters'

export default function UserList() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deactivateUser, setDeactivateUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role_id: '' })
  const [editForm, setEditForm] = useState({ name: '', email: '', role_id: '', is_active: true })

  async function load() {
    try {
      const [u, r] = await Promise.all([api.get('/users/'), api.get('/users/roles')])
      setUsers(u.data)
      setRoles(r.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/users/', { ...form, role_id: Number(form.role_id) })
      toast('User created', 'success')
      setShowCreate(false)
      setForm({ name: '', email: '', password: '', role_id: '' })
      load()
    } catch (err) {
      toast(err.response?.data?.detail ?? 'Failed', 'error')
    } finally { setSubmitting(false) }
  }

  async function handleEdit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.put(`/users/${editUser.user_id}`, { ...editForm, role_id: Number(editForm.role_id) })
      toast('User updated', 'success')
      setEditUser(null)
      load()
    } catch (err) {
      toast(err.response?.data?.detail ?? 'Failed', 'error')
    } finally { setSubmitting(false) }
  }

  async function handleDeactivate() {
    setSubmitting(true)
    try {
      await api.delete(`/users/${deactivateUser.user_id}`)
      toast('User deactivated', 'success')
      setDeactivateUser(null)
      load()
    } catch (err) {
      toast(err.response?.data?.detail ?? 'Failed', 'error')
    } finally { setSubmitting(false) }
  }

  function openEdit(u) {
    setEditForm({ name: u.name, email: u.email, role_id: u.role?.role_id ?? '', is_active: u.is_active })
    setEditUser(u)
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><LoadingSpinner size={32} className="mx-auto" /></td></tr>
              ) : users.map((u) => (
                <tr key={u.user_id} className="border-b border-slate-700/40 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-400">
                      {u.role?.role_name ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {u.is_active && (
                        <button onClick={() => setDeactivateUser(u)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Add User" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password']].map(([k, l, t]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1.5">{l}</label>
                <input
                  type={t}
                  required
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Role</label>
              <select
                required
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select role…</option>
                {roles.map((r) => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50">
                {submitting ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            {[['name', 'Full Name', 'text'], ['email', 'Email', 'email']].map(([k, l, t]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1.5">{l}</label>
                <input
                  type={t}
                  required
                  value={editForm[k]}
                  onChange={(e) => setEditForm({ ...editForm, [k]: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Role</label>
              <select
                value={editForm.role_id}
                onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {roles.map((r) => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50">
                {submitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Deactivate Confirm */}
      {deactivateUser && (
        <ConfirmDialog
          message={`Deactivate ${deactivateUser.name}? They will no longer be able to log in.`}
          onConfirm={handleDeactivate}
          onCancel={() => setDeactivateUser(null)}
          loading={submitting}
        />
      )}
    </div>
  )
}
