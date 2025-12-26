import { useState } from 'react'
import './navbar.css'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const username = user?.displayName || user?.email || 'User'

  const handleLogout = async () => {
    await logout()
    setOpen(false)
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo-dot"/>
        <span className="navbar-title">QuickTasks</span>
      </div>
      <div className="navbar-right">
        <button
          className="navbar-theme-toggle"
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          className="navbar-user"
          type="button"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="navbar-avatar">{username.charAt(0)}</span>
          <span className="navbar-username">{username}</span>
        </button>
        {open && (
          <div className="navbar-menu">
            <button
              type="button"
              className="navbar-menu-item"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar



