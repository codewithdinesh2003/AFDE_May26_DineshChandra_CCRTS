export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export const STATUS_COLORS = {
  Open:        'bg-blue-500/20 text-blue-400',
  'In Progress':'bg-yellow-500/20 text-yellow-400',
  Resolved:    'bg-green-500/20 text-green-400',
  Closed:      'bg-slate-500/20 text-slate-400',
  Escalated:   'bg-red-500/20 text-red-400',
}

export const PRIORITY_COLORS = {
  Critical: 'bg-red-500/20 text-red-400',
  High:     'bg-orange-500/20 text-orange-400',
  Medium:   'bg-yellow-500/20 text-yellow-400',
  Low:      'bg-green-500/20 text-green-400',
}
