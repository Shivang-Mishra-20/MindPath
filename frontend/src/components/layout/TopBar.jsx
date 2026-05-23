/**
 * Top navigation bar.
 */

import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/attrition': 'Attrition Risk',
  '/burnout': 'Burnout Monitor',
  '/reviews': 'Performance AI',
}

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

export default function TopBar({ onMenuClick }) {
  const location = useLocation()
  const { user } = useAuth()

  // Find best matching page title
  const title = Object.entries(PAGE_TITLES)
    .find(([path]) => location.pathname.startsWith(path))?.[1] || 'MindPath'

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <header className="h-16 bg-white border-b border-sage-100 flex items-center
                        px-4 md:px-8 gap-4 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-xl text-warm-500 hover:bg-warm-100 transition-colors"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-base font-semibold text-warm-900">{title}</h1>
        <p className="text-xs text-warm-400 hidden sm:block">{today}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Greeting */}
        <span className="hidden lg:block text-sm text-warm-500">
          Hello, <span className="text-warm-800 font-medium">
            {user?.first_name || user?.username}
          </span>
        </span>

        {/* Avatar chip */}
        <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center
                        text-sage-700 text-xs font-semibold cursor-default select-none">
          {user?.profile?.avatar_initials || user?.username?.slice(0, 2)?.toUpperCase() || '?'}
        </div>
      </div>
    </header>
  )
}
