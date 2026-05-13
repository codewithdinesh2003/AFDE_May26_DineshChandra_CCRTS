import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: <CheckCircle className="w-4 h-4 text-green-400" />,
  error:   <XCircle    className="w-4 h-4 text-red-400" />,
  info:    <AlertCircle className="w-4 h-4 text-blue-400" />,
}

const BORDERS = {
  success: 'border-l-green-400',
  error:   'border-l-red-400',
  info:    'border-l-blue-400',
}

function ToastItem({ id, type, message, onRemove }) {
  return (
    <div className={`flex items-start gap-3 bg-[#1e293b] border border-slate-700 border-l-4 ${BORDERS[type]} rounded-lg shadow-xl p-4 min-w-[280px] max-w-xs toast-enter`}>
      {ICONS[type]}
      <p className="text-sm text-slate-200 flex-1">{message}</p>
      <button onClick={() => onRemove(id)} className="text-slate-500 hover:text-white">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration)
  }, [])

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => <ToastItem key={t.id} {...t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
