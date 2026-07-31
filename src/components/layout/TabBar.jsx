import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const tabConfig = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
  { id: 'share', label: 'Share Text', icon: 'message-square', path: '/share' },
  { id: 'share-image', label: 'Share Image', icon: 'image', path: '/share-image' },
  { id: 'share-file', label: 'Share File', icon: 'file', path: '/share-file' },
  { id: 'receive', label: 'Receive Text', icon: 'download', path: '/receive-text' },
  { id: 'receive-image', label: 'Receive Image', icon: 'image', path: '/receive-image' },
  { id: 'receive-file', label: 'Receive File', icon: 'file', path: '/receive-file' },
  { id: 'public-room', label: 'Public Rooms', icon: 'users', path: '/public-room' },
  { id: 'admin', label: 'Admin Panel', icon: 'shield', path: '/admin/panel' },
  { id: 'about', label: 'About', icon: 'info', path: '/about' },
  { id: 'contact', label: 'Contact', icon: 'mail', path: '/contact' },
  { id: 'privacy', label: 'Privacy Policy', icon: 'file-text', path: '/privacy-policy' },
  { id: 'terms', label: 'Terms of Service', icon: 'file-text', path: '/terms-of-service' },
]

const TabBar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const currentPath = location.pathname

  const getTabForPath = (path) => {
    if (path === '/dashboard') return tabConfig[0]
    if (path.startsWith('/share-image')) return tabConfig[2]
    if (path.startsWith('/share-file')) return tabConfig[3]
    if (path.startsWith('/share')) return tabConfig[1]
    if (path === '/receive-text') return tabConfig[4]
    if (path === '/receive-image') return tabConfig[5]
    if (path === '/receive-file') return tabConfig[6]
    if (path.startsWith('/receive')) return tabConfig[4]
    if (path.startsWith('/public-room')) return tabConfig[7]
    if (path.startsWith('/admin')) return tabConfig[8]
    if (path.startsWith('/about')) return tabConfig[9]
    if (path.startsWith('/contact')) return tabConfig[10]
    if (path.startsWith('/privacy')) return tabConfig[11]
    if (path.startsWith('/terms')) return tabConfig[12]
    return null
  }

  const activeTab = getTabForPath(currentPath)

  if (!activeTab) return null

  return (
    <div className="tab-bar">
      <button
        className="chrome-tab active"
        onClick={() => navigate(activeTab.path)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {activeTab.icon === 'layout-dashboard' && (
            <>
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </>
          )}
          {activeTab.icon === 'message-square' && (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
          {activeTab.icon === 'image' && (
            <>
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </>
          )}
          {activeTab.icon === 'file-text' && (
            <>
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
            </>
          )}
          {activeTab.icon === 'file' && (
            <>
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </>
          )}
          {activeTab.icon === 'download' && (
            <>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </>
          )}
          {activeTab.icon === 'users' && (
            <>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
          )}
          {activeTab.icon === 'shield' && (
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          )}
          {activeTab.icon === 'info' && (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </>
          )}
          {activeTab.icon === 'mail' && (
            <>
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </>
          )}
        </svg>
        <span>{activeTab.label}</span>
      </button>
      <div className="tab-spacer" />
      <div className="tab-actions">
        <button className="btn btn-ghost btn-xs" onClick={() => navigate('/share')} title="New tab">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TabBar