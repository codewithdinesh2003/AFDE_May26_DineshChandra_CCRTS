import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import { timeAgo } from '../../utils/formatters'

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No notifications</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.notification_id}
                  onClick={() => markRead(n.notification_id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-700/50 hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-blue-500/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                    <div className={!n.is_read ? '' : 'pl-4'}>
                      <p className="text-xs text-slate-200 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
