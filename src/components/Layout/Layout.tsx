import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import './Layout.css'

export function Layout() {
  const [sidebarAberto, setSidebarAberto] = useState(false)

  return (
    <div className="app-layout">
      <Header onMenuClick={() => setSidebarAberto((v) => !v)} />
      <div className="app-body">
        <div
          className={`sidebar-backdrop ${sidebarAberto ? 'sidebar-backdrop--visible' : ''}`}
          onClick={() => setSidebarAberto(false)}
          aria-hidden
        />
        <Sidebar
          aberto={sidebarAberto}
          onFechar={() => setSidebarAberto(false)}
        />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
