import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ActivityBar from './ActivityBar'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import TabBar from './TabBar'
import { LayoutProvider } from './LayoutContext'
import { endpoints } from '../../api/api'
import JoinOrgForm from './JoinOrgForm'
import sidebarSections from './sidebarData'
import './AppLayout.css'

const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [recentPurchases, setRecentPurchases] = useState([])
  const [stats, setStats] = useState({
    visitors: 0,
    files_shared: 0,
    received: 0,
    premium_users: 0,
  })
  const [todayStats, setTodayStats] = useState({
    visitors: 0,
    files_shared: 0,
    received: 0,
    premium_users: 0,
    date: '',
  })
  const location = useLocation()
  const navigate = useNavigate()

  const username = localStorage.getItem('tshare_username') || ''
  const isAdmin = sessionStorage.getItem('adminAuthenticated') === 'true'
  // Stats/recent-purchases + premium marquee are only relevant on the shared
  // app pages. Exclude /admin (existing) and /org (org module keeps its own
  // data) so org-page navigation doesn't fire the stats API.
  const isNotAdminPage =
    !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/org')

  useEffect(() => {
    if (isNotAdminPage) {
      fetchRecentPurchases();
      const interval = setInterval(fetchRecentPurchases, 25000);
      return () => clearInterval(interval);
    }
  }, [location.pathname]);

  const fetchRecentPurchases = async () => {
    try {
      const res = await fetch(endpoints.stats);
      const data = await res.json();
      if (data.success) {
        setRecentPurchases(data.purchases || []);
        if (data.stats) {
          setStats({
            visitors: data.stats.visitors || 0,
            files_shared: data.stats.files_shared || 0,
            received: data.stats.received || 0,
            premium_users: data.stats.premium_users || 0,
          });
        }
        if (data.todayStats) {
          setTodayStats({
            visitors: data.todayStats.visitors || 0,
            files_shared: data.todayStats.files_shared || 0,
            received: data.todayStats.received || 0,
            premium_users: data.todayStats.premium_users || 0,
            date: data.todayStats.date || '',
          });
        }
      }
    } catch (err) {
      console.error('Error fetching recent purchases:', err);
    }
  };

  const isActive = (path) => {
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

  const handleNav = (path) => {
    navigate(path)
  }

  // Close sidebar dropdowns on route change
  useEffect(() => {
    const closeDropdowns = () => {
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'))
    }
    closeDropdowns()
  }, [location.pathname])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'))
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev)
    setSidebarVisible(prev => !prev)
  }

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prev => !prev)
  }

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(prev => !prev)
  }

  const handleMobileNav = (path) => {
    setMobileMenuOpen(false)
  }

  const handleSearch = (query) => {
    console.log('Search:', query)
  }

  return (
    <div className="app-layout">
      <ActivityBar
        onToggleSidebar={handleToggleSidebar}
        sidebarVisible={sidebarVisible}
      />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        username={username}
        onNavigate={handleMobileNav}
      />
      <div className="main-area">
        <TopBar onSearch={handleSearch} onToggleMobileMenu={handleMobileMenuToggle} />
        <div className="content-area">
          {isNotAdminPage && recentPurchases.length > 0 && (
            <div className="premium-marquee-container">
              <div className="premium-marquee-text">
                {[...recentPurchases, ...recentPurchases].map((purchase, index) => (
                  <span key={index}>
                    👑 <strong>{purchase.displayName || 'Anonymous'}</strong> purchased Premium Code {purchase.code ? <strong>{purchase.code.toUpperCase()}</strong> : <strong>🔒</strong>}!
                  </span>
                ))}
              </div>
            </div>
          )}
          <LayoutProvider>
            {React.cloneElement(children, { stats, todayStats })}
          </LayoutProvider>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-sidebar">
            <div className="mobile-sidebar-header">
              <button className="sidebar-header-brand" onClick={() => { navigate('/'); setMobileMenuOpen(false) }}>
                <div className="sidebar-header-logo">
                  <img src="/s2.svg" alt="TShare" width="20" height="20" />
                </div>
                <span className="sidebar-header-title">TShare</span>
              </button>
              <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="mobile-sidebar-content">
              {sidebarSections.map((section) => (
                <div key={section.label} className="mobile-section">
                  {section.label === 'Admin' && !isAdmin ? null : (
                    <>
                      <div className="mobile-section-label">{section.label}</div>
                      {section.items.map((item) => (
                        <button
                          key={item.path}
                          className={`mobile-sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                          onClick={() => {
                            handleNav(item.path)
                            setMobileMenuOpen(false)
                          }}
                        >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        {item.icon === 'file-text' && (
                          <>
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" x2="8" y1="13" y2="13" />
                            <line x1="16" x2="8" y1="17" y2="17" />
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
                        {item.icon === 'user-check' && (
                          <>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                            <polyline points="16 11 18 13 22 9" />
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
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0-.73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                      <span>{item.label}</span>
                    </button>
                  ))}
                  {section.label === 'Organization' && (
                    <JoinOrgForm onNavigate={handleNav} />
                  )}
                </>
              )}
            </div>
          ))}
              
              {/* Logout Section */}
              {username && (
                <div className="mobile-section" style={{ marginTop: 'auto', borderTop: '1px solid var(--sidebar-border)', paddingTop: '16px' }}>
                  <button
                    className="mobile-sidebar-item"
                    style={{ color: 'var(--theme-danger)' }}
                    onClick={() => {
                      localStorage.removeItem('tshare_username')
                      navigate('/')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AppLayout