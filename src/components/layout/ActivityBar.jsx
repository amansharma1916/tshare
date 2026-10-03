import React from 'react'
import { useNavigate } from 'react-router-dom'

const ActivityBar = ({ onToggleSidebar, sidebarVisible }) => {
  const navigate = useNavigate()

  return (
    <div className="activity-bar">
      {/* Play Store shortcut — opens the TShare Android app listing in a new tab */}
      <a
        className="activity-icon"
        href="https://play.google.com/store/apps/details?id=in.tshare.app"
        target="_blank"
        rel="noopener noreferrer"
        title="Get our Android app"
        style={{ marginBottom: '6px' }}
      >
        <svg width="18" height="18" viewBox="0 0 512 512" aria-hidden="true">
          <path fill="#4285F4" d="M99.6 32.6c-6.4 3.3-10.6 9.8-10.6 18.9v409c0 9.1 4.2 15.6 10.6 18.9L314 256 99.6 32.6z" />
          <path fill="#34A853" d="M373.4 215.2 99.6 32.6 314 256l59.4-40.8z" />
          <path fill="#FBBC04" d="M99.6 479.4 373.4 296.8 314 256 99.6 479.4z" />
          <path fill="#EA4335" d="M373.4 296.8l72.9-49.9c17.5-12 17.5-41.8 0-53.8l-72.9-49.9L314 256l59.4 40.8z" />
        </svg>
      </a>
      <button
        className={`activity-icon ${sidebarVisible ? 'active' : ''}`}
        onClick={onToggleSidebar}
        title="Navigation"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
      <button
        className="activity-icon"
        onClick={() => {
          const searchInput = document.querySelector('.search-box input')
          if (searchInput) searchInput.focus()
        }}
        title="Search"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
      <button
        className="activity-icon"
        onClick={() => navigate('/dashboard')}
        title="Dashboard"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      </button>
      <div style={{ flex: 1 }} />
      <button
        className="activity-icon"
        onClick={() => navigate('/about')}
        title="About"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
    </div>
  )
}

export default ActivityBar