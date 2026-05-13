import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, PlusCircle, Users,
  BarChart2, MessageSquare, LogOut, Shield,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/roleGuard'

const ICON_CLASS = 'w-4 h-4 flex-shrink-0'

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-900/40'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`
      }
    >
      <Icon className={ICON_CLASS} />
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const role = user?.role

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0f172a] border-r border-slate-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">CCRTS</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Complaint Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <NavItem to="/dashboard"      icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/complaints"     icon={FileText}        label="Complaints" />

        {role !== ROLES.CUSTOMER && (
          <NavItem to="/complaints/new" icon={PlusCircle} label="New Complaint" />
        )}
        {role === ROLES.CUSTOMER && (
          <NavItem to="/complaints/new" icon={PlusCircle} label="Submit Complaint" />
        )}

        {[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.QA].includes(role) && (
          <NavItem to="/feedback"     icon={MessageSquare}   label="Feedback" />
        )}
        {[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.QA].includes(role) && (
          <NavItem to="/reports"      icon={BarChart2}       label="Reports" />
        )}
        {role === ROLES.ADMIN && (
          <NavItem to="/users"        icon={Users}           label="Users" />
        )}
      </nav>

      {/* User block */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <p className="text-slate-500 text-[10px] truncate">{role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
