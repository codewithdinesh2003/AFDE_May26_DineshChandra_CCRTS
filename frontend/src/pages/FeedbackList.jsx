import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import api from '../api/axios'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDateTime } from '../utils/formatters'

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
      ))}
    </div>
  )
}

export default function FeedbackList() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/feedback/').then(({ data }) => setFeedback(data)).finally(() => setLoading(false))
  }, [])

  const avg = feedback.length > 0
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
    : '—'

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Total Feedback</p>
          <p className="text-2xl font-bold text-white">{feedback.length}</p>
        </div>
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Average Rating</p>
          <p className="text-2xl font-bold text-yellow-400">{avg}</p>
        </div>
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">5-Star Reviews</p>
          <p className="text-2xl font-bold text-green-400">{feedback.filter(f => f.rating === 5).length}</p>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h3 className="text-white font-semibold text-sm">All Feedback</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {['Complaint #', 'Customer', 'Rating', 'Comments', 'Submitted'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center"><LoadingSpinner size={32} className="mx-auto" /></td></tr>
              ) : feedback.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-500">No feedback yet</td></tr>
              ) : feedback.map((f) => (
                <tr key={f.feedback_id} className="border-b border-slate-700/40 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/complaints/${f.complaint_id}`} className="text-blue-400 hover:underline font-mono text-xs">
                      #{f.complaint_id}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-300">Customer #{f.customer_id}</td>
                  <td className="px-5 py-3"><Stars rating={f.rating} /></td>
                  <td className="px-5 py-3 text-slate-400 max-w-xs truncate">{f.comments || '—'}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(f.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
