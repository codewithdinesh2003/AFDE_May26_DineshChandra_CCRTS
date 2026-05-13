import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Paperclip, Clock, User, Tag } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
import StatusBadge from '../components/common/StatusBadge'
import PriorityBadge from '../components/common/PriorityBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { formatDateTime } from '../utils/formatters'
import { ROLES, canAssign, canEscalate, canClose } from '../utils/roleGuard'

export default function ComplaintDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const role = user?.role

  const [complaint, setComplaint] = useState(null)
  const [history, setHistory]     = useState([])
  const [agents, setAgents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [showAssign, setShowAssign]   = useState(false)
  const [showStatus, setShowStatus]   = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [assignData, setAssignData]   = useState({ agent_id: '', comment: '' })
  const [statusData, setStatusData]   = useState({ status: '', comment: '' })
  const [fbData, setFbData]           = useState({ rating: 5, comments: '' })
  const [submitting, setSubmitting]   = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)

  async function load() {
    try {
      const [c, h] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get(`/complaints/${id}/history`),
      ])
      setComplaint(c.data)
      setHistory(h.data)
      try {
        await api.get(`/feedback/${id}`)
        setFeedbackDone(true)
      } catch { setFeedbackDone(false) }
    } catch {
      navigate('/complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    if (canAssign(role)) {
      api.get('/users/').then(({ data }) => {
        setAgents(data.filter((u) => u.role?.role_name === 'Agent' && u.is_active))
      }).catch(() => {})
    }
  }, [role])

  async function handleAssign() {
    setSubmitting(true)
    try {
      await api.post(`/complaints/${id}/assign`, assignData)
      toast('Complaint assigned', 'success')
      setShowAssign(false)
      load()
    } catch (err) {
      toast(err.response?.data?.detail ?? 'Failed', 'error')
    } finally { setSubmitting(false) }
  }

  async function handleStatusChange() {
    setSubmitting(true)
    try {
      if (statusData.status === 'Escalated') {
        await api.post(`/complaints/${id}/escalate`, { status: 'Escalated', comment: statusData.comment })
      } else if (statusData.status === 'Resolved') {
        await api.post(`/complaints/${id}/resolve`, { status: 'Resolved', comment: statusData.comment })
      } else if (statusData.status === 'Closed') {
        await api.post(`/complaints/${id}/close`, { status: 'Closed', comment: statusData.comment })
      } else if (statusData.status === 'Open') {
        await api.post(`/complaints/${id}/reopen`, { status: 'Open', comment: statusData.comment })
      } else {
        await api.put(`/complaints/${id}`, statusData)
      }
      toast('Status updated', 'success')
      setShowStatus(false)
      load()
    } catch (err) {
      toast(err.response?.data?.detail ?? 'Failed', 'error')
    } finally { setSubmitting(false) }
  }

  async function handleFeedback() {
    setSubmitting(true)
    try {
      await api.post(`/feedback/${id}`, fbData)
      toast('Feedback submitted!', 'success')
      setShowFeedback(false)
      setFeedbackDone(true)
    } catch (err) {
      toast(err.response?.data?.detail ?? 'Failed', 'error')
    } finally { setSubmitting(false) }
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      await api.post(`/complaints/${id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast('File uploaded', 'success')
      load()
    } catch { toast('Upload failed', 'error') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size={40} /></div>
  if (!complaint) return null

  const isCustomer = role === ROLES.CUSTOMER
  const isResolved = ['Resolved', 'Closed'].includes(complaint.status)

  const availableStatuses = () => {
    const all = ['Open', 'In Progress', 'Resolved', 'Closed', 'Escalated']
    if (role === ROLES.CUSTOMER) return ['Open']
    if (!canClose(role)) return all.filter((s) => s !== 'Closed')
    return all
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/complaints" className="hover:text-white transition-colors">Complaints</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-300 font-mono">{complaint.complaint_number}</span>
      </nav>

      {/* Header card */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-white text-xl font-semibold">{complaint.subject}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              {complaint.category && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Tag className="w-3 h-3" />{complaint.category.category_name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {canAssign(role) && (
              <button onClick={() => setShowAssign(true)}
                className="px-3 py-1.5 text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-colors">
                Assign Agent
              </button>
            )}
            {canEscalate(role) && complaint.status !== 'Escalated' && (
              <button onClick={() => { setStatusData({ status: 'Escalated', comment: '' }); setShowStatus(true) }}
                className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors">
                Escalate
              </button>
            )}
            <button onClick={() => setShowStatus(true)}
              className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
              Update Status
            </button>
            {isCustomer && isResolved && !feedbackDone && (
              <button onClick={() => setShowFeedback(true)}
                className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
                Submit Feedback
              </button>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
          <div>
            <p className="text-xs text-slate-500 mb-1">Customer</p>
            <p className="text-sm text-slate-200 flex items-center gap-1">
              <User className="w-3 h-3" />{complaint.customer?.name ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Assigned Agent</p>
            <p className="text-sm text-slate-200">{complaint.assigned_agent?.name ?? 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Created</p>
            <p className="text-sm text-slate-200 flex items-center gap-1">
              <Clock className="w-3 h-3" />{formatDateTime(complaint.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">SLA Deadline</p>
            <p className="text-sm text-slate-200">{formatDateTime(complaint.sla_deadline)}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <p className="text-xs text-slate-500 mb-2">Description</p>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Paperclip className="w-4 h-4" /> Attachments ({complaint.attachments?.length ?? 0})
          </h3>
          <label className="cursor-pointer px-3 py-1.5 text-xs bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
            Upload file
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
        {complaint.attachments?.length > 0 ? (
          <div className="space-y-2">
            {complaint.attachments.map((a) => (
              <a key={a.attachment_id} href={`http://localhost:8000/${a.file_path}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                <Paperclip className="w-3 h-3" />{a.file_name}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No attachments</p>
        )}
      </div>

      {/* History */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Activity History</h3>
        {history.length === 0 ? (
          <p className="text-xs text-slate-500">No history yet</p>
        ) : (
          <div className="space-y-4">
            {history.map((h) => (
              <div key={h.history_id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-300 font-medium">{h.updated_by?.name}</span>
                    {h.old_status !== h.new_status && (
                      <>
                        <StatusBadge status={h.old_status} />
                        <span className="text-slate-600 text-xs">→</span>
                        <StatusBadge status={h.new_status} />
                      </>
                    )}
                    <span className="text-[10px] text-slate-500">{formatDateTime(h.updated_at)}</span>
                  </div>
                  {h.comment && <p className="text-xs text-slate-400 mt-1">{h.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssign && (
        <Modal title="Assign Agent" onClose={() => setShowAssign(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Agent</label>
              <select
                value={assignData.agent_id}
                onChange={(e) => setAssignData({ ...assignData, agent_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select agent…</option>
                {agents.map((a) => <option key={a.user_id} value={a.user_id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Comment (optional)</label>
              <textarea
                value={assignData.comment}
                onChange={(e) => setAssignData({ ...assignData, comment: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAssign(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleAssign} disabled={!assignData.agent_id || submitting}
                className="px-4 py-2 text-sm bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50">
                {submitting ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Modal */}
      {showStatus && (
        <Modal title="Update Status" onClose={() => setShowStatus(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">New Status</label>
              <select
                value={statusData.status}
                onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select status…</option>
                {availableStatuses().map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Comment (optional)</label>
              <textarea
                value={statusData.comment}
                onChange={(e) => setStatusData({ ...statusData, comment: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowStatus(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleStatusChange} disabled={!statusData.status || submitting}
                className="px-4 py-2 text-sm bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50">
                {submitting ? 'Updating…' : 'Update'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <Modal title="Submit Feedback" onClose={() => setShowFeedback(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Rating (1–5)</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setFbData({ ...fbData, rating: n })}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${fbData.rating >= n ? 'bg-yellow-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Comments</label>
              <textarea
                value={fbData.comments}
                onChange={(e) => setFbData({ ...fbData, comments: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Share your experience…"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowFeedback(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleFeedback} disabled={submitting}
                className="px-4 py-2 text-sm bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
