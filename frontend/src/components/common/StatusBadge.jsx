import { STATUS_COLORS } from '../../utils/formatters'

export default function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] ?? 'bg-slate-500/20 text-slate-400'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}
