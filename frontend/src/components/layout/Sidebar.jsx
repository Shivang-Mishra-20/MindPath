/**
 * Sidebar navigation component.
 */

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// SVG Icon components (inline for zero dependencies)
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
)
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)
const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/employees', label: 'Employees', icon: UsersIcon },
  { to: '/attrition', label: 'Attrition Risk', icon: TrendingDownIcon },
  { to: '/burnout', label: 'Burnout Monitor', icon: HeartIcon },
  { to: '/reviews', label: 'Performance AI', icon: FileTextIcon },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-64 flex flex-col
      bg-white border-r border-sage-100
      transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 md:flex
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sage-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Leaf mark logo */}
          <div className="w-8 h-8 bg-sage-500 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          <div>
            <span className="text-lg font-display font-semibold text-warm-900">MindPath</span>
            <span className="block text-[10px] text-warm-400 -mt-0.5 tracking-widest uppercase">HR Analytics</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-150 group
               ${isActive
                 ? 'bg-sage-50 text-sage-700 shadow-sm'
                 : 'text-warm-500 hover:bg-warm-50 hover:text-warm-800'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`transition-colors ${isActive ? 'text-sage-600' : 'text-warm-400 group-hover:text-warm-600'}`}>
                  <Icon />
                </span>
                {label}
                {/* Active indicator dot */}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sage-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile section */}
      <div className="flex-shrink-0 border-t border-sage-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center
                          text-sage-700 text-sm font-semibold flex-shrink-0">
            {user?.profile?.avatar_initials || user?.username?.slice(0, 2)?.toUpperCase() || 'HR'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-warm-900 truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </p>
            <p className="text-xs text-warm-400 truncate capitalize">
              {user?.profile?.role?.replace('_', ' ') || 'HR User'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm
                     text-warm-500 hover:bg-red-50 hover:text-red-600
                     transition-all duration-150"
        >
          <LogOutIcon />
          Sign out
        </button>
      </div>
    </aside>
  )
}
