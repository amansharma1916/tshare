import React from 'react'
import { useNavigate } from 'react-router-dom'

const TopBar = ({ onSearch, onToggleMobileMenu }) => {
  const navigate = useNavigate()

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      if (onSearch) onSearch(e.target.value.trim())
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault()
        const input = document.querySelector('.search-box input')
        if (input) input.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="top-bar">
      {onToggleMobileMenu && (
        <button className="mobile-menu-toggle" onClick={onToggleMobileMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      )}
      <div className="search-box">
        <svg width="14" height="14" className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search tasks, orders, products..."
          id="global-search"
          onKeyDown={handleSearchKeyDown}
        />
        <span className="kbd">/</span>
      </div>
      <button className="btn btn-secondary btn-xs" onClick={() => navigate('/share')}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        New Share
      </button>
      <button className="btn btn-ghost btn-xs" onClick={() => navigate('/dashboard')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      </button>
    </div>
  )
}

export default TopBar