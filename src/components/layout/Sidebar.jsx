import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import JoinOrgForm from './JoinOrgForm'
import sidebarSections from './sidebarData'

const Sidebar = ({ collapsed, onToggleCollapse, username, onNavigate }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = sessionStorage.getItem('adminAuthenticated') === 'true'

  const handleNav = (path) => {
    if (onNavigate) onNavigate(path)
    navigate(path)
  }

  const isActive = (path) => {
    // Exact matches for specific routes
    if (path === '/share') return location.pathname === '/share'
    if (path === '/share-image') return location.pathname === '/share-image'
    if (path === '/share-file') return location.pathname === '/share-file'
    if (path === '/receive') return location.pathname === '/receive'
    if (path === '/dashboard') return location.pathname === '/dashboard'
    if (path === '/admin/panel') return location.pathname === '/admin/panel' && !location.search
    if (path.startsWith('/admin/panel?tab=')) {
      const tab = path.split('tab=')[1]
      return location.pathname === '/admin/panel' && location.search === `?tab=${tab}`
    }
    return location.pathname === path
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <button className="sidebar-header-brand" onClick={() => navigate('/')} title="Go to Home">
          <div className="sidebar-header-logo">
            <img src="/s2.svg" alt="TShare" width="20" height="20" />
          </div>
          <span className="sidebar-header-title">TShare</span>
        </button>
        <button className="btn btn-ghost" onClick={onToggleCollapse} style={{ padding: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      </div>

      <div className="sidebar-scroll">
        {sidebarSections.map((section) => {
          // Only show Admin section when admin is authenticated
          if (section.label === 'Admin' && !isAdmin) return null
          return (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => {
                return (
                  <button
                    key={item.path}
                    className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => handleNav(item.path)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {item.icon === 'layout-dashboard' && (
                        <>
                          <rect width="7" height="9" x="3" y="3" rx="1" />
                          <rect width="7" height="5" x="14" y="3" rx="1" />
                          <rect width="7" height="9" x="14" y="12" rx="1" />
                          <rect width="7" height="5" x="3" y="16" rx="1" />
                        </>
                      )}
                      {item.icon === 'credit-card' && (
                        <>
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </>
                      )}
                      {item.icon === 'message-square' && (
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      )}
                      {item.icon === 'image' && (
                        <>
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </>
                      )}
                      {item.icon === 'file' && (
                        <>
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </>
                      )}
                      {item.icon === 'user-check' && (
                        <>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <polyline points="16 11 18 13 22 9" />
                        </>
                      )}
                      {item.icon === 'download' && (
                        <>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </>
                      )}
                      {item.icon === 'users' && (
                        <>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </>
                      )}
                      {item.icon === 'shield' && (
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      )}
                      {item.icon === 'info' && (
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </>
                      )}
                      {item.icon === 'mail' && (
                        <>
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </>
                      )}
                      {item.icon === 'file-text' && (
                        <>
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" x2="8" y1="13" y2="13" />
                          <line x1="16" x2="8" y1="17" y2="17" />
                        </>
                      )}
                      {item.icon === 'user' && (
                        <>
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </>
                      )}
                      {item.icon === 'settings' && (
                        <>
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                    <span>{item.label}</span>
                  </button>
                )
              })}
              {section.label === 'Organization' && (
                <JoinOrgForm onNavigate={handleNav} />
              )}
            </div>
          )
        })}
      </div>

      <div className="sidebar-footer">
        <div className="dropdown" style={{ width: '100%' }}>
          <button className="sidebar-user" onClick={(e) => {
            e.stopPropagation()
            const menu = document.getElementById('sidebar-user-menu')
            menu.classList.toggle('open')
          }}>
            <div className="sidebar-user-avatar">{getInitial(username)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{username || 'Guest'}</div>
              <div className="sidebar-user-role">{username ? 'User' : 'Not logged in'}</div>
            </div>
            <svg width="12" height="12" className="sidebar-user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div className="dropdown-menu dropdown-up" id="sidebar-user-menu">
            {username ? (
              <>
                <button className="dropdown-item" onClick={() => {
                  document.getElementById('sidebar-user-menu').classList.remove('open')
                  navigate('/dashboard')
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Dashboard
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item danger" onClick={() => {
                  document.getElementById('sidebar-user-menu').classList.remove('open')
                  localStorage.removeItem('tshare_username')
                  navigate('/')
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="dropdown-item" onClick={() => {
                  document.getElementById('sidebar-user-menu').classList.remove('open')
                  navigate('/login')
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Login
                </button>
                <button className="dropdown-item" onClick={() => {
                  document.getElementById('sidebar-user-menu').classList.remove('open')
                  navigate('/register')
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" x2="19" y1="8" y2="14" />
                    <line x1="22" x2="16" y1="11" y2="11" />
                  </svg>
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
