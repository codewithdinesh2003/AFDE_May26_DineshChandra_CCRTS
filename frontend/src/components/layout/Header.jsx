import { useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import { useAuth } from '../../context/AuthContext'

const TITLES = {
  '/dashboard':      'Dashboard',
  '/complaints':     'Complaints',
  '/complaints/new': 'New Complaint',
  '/users':          'User Management',
  '/feedback':       'Feedback',
  '/reports':        'Reports',
}

export default function Header() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const title = Object.entries(TITLES).find(([k]) => pathname === k || pathname.startsWith(k + '/'))?.[1]
    ?? 'CCRTS'

  return (
    <header className="h-14 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-6 fixed top-0 right-0 left-60 z-30">
      <h1 className="text-white font-semibold text-base">{title}</h1>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  )
}
