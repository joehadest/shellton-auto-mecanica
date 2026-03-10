import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../types/navigation'
import './Sidebar.css'

interface SidebarProps {
  aberto?: boolean
  onFechar?: () => void
}

export function Sidebar({ aberto, onFechar }: SidebarProps) {
  return (
    <aside className={`sidebar ${aberto ? 'sidebar--open' : ''}`}>
      <nav className="sidebar-nav" onClick={onFechar}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
            {item.hasSubmenu && <span className="sidebar-arrow">›</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
