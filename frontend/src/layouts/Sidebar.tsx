import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Route as RouteIcon, BookOpen, KeyRound,
  Heart, Megaphone, User, LogOut, X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import logo from '../../public/zone.png';

const developerNav = [
  { to: '/developer/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/developer/journey', label: 'My Journey', icon: RouteIcon },
  { to: '/developer/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { to: '/developer/access-requests', label: 'Access Requests', icon: KeyRound },
  { to: '/developer/mentor', label: 'My Mentor', icon: Heart },
  { to: '/developer/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/developer/profile', label: 'Profile', icon: User },
]

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* backdrop, mobile only, shown when the drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 h-screen w-64 bg-surface border-r border-border
          flex flex-col shrink-0 z-50 transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="w-14 h-14 rounded flex items-center justify-center text-white text-xs font-bold">
              <img src={logo} alt="" />
            </div>
            <span className="font-display font-semibold text-ink">Zone</span>
          </div>
          <button onClick={onClose} className="md:hidden text-ink-muted">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {developerNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-ink-muted hover:bg-canvas'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-4">
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user?.full_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink truncate">{user?.full_name}</p>
              <p className="text-xs text-ink-muted capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-ink-muted px-2 py-1.5 w-full hover:text-danger"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
    </>
  )
}