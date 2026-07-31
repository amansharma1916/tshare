import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ActivityBar from './ActivityBar'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import TabBar from './TabBar'
import { LayoutProvider } from './LayoutContext'
import './AppLayout.css'

const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const location = useLocation()

  const username = localStorage.getItem('tshare_username') || ''

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

  const handleSearch = (query) => {
    console.log('Search:', query)
    // Future: implement search functionality
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
      />
      <div className="main-area">
        <TabBar />
        <TopBar onSearch={handleSearch} />
        <div className="content-area">
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </div>
      </div>
    </div>
  )
}

export default AppLayout