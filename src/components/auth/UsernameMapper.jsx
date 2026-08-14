import React, { useState, useRef, useEffect } from 'react'
import './UsernameMapper.css'

const STORAGE_KEY = 'tshare_username'

const UsernameMapper = () => {
  const [username, setUsername] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const handleOpen = () => {
    setValue(username)
    setError('')
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Enter a username to map')
      inputRef.current?.focus()
      return
    }
    localStorage.setItem(STORAGE_KEY, trimmed)
    setUsername(trimmed)
    setOpen(false)
    setError('')
  }

  const handleUnmap = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUsername('')
    setOpen(false)
    setError('')
  }

  const UserIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
    </svg>
  )

  return (
    <div className={`umapper ${open ? 'umapper--open' : ''}`}>
      {open ? (
        <form
          className="umapper__form"
          onSubmit={handleSubmit}
          onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }}
        >
          <label className="umapper__sr-only" htmlFor="umapper-input">Map a username to this code</label>
          <input
            id="umapper-input"
            ref={inputRef}
            type="text"
            className="umapper__input"
            placeholder="Username"
            value={value}
            maxLength={20}
            autoComplete="off"
            onChange={(e) => { setValue(e.target.value); setError('') }}
            aria-label="Username to map with this code"
            aria-invalid={Boolean(error)}
          />
          <button
            type="submit"
            className="umapper__icon-btn umapper__submit"
            aria-label="Confirm username"
            disabled={!value.trim()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
          <button
            type="button"
            className="umapper__icon-btn umapper__cancel"
            onClick={handleClose}
            aria-label="Cancel"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {error && <span className="umapper__error" role="alert">{error}</span>}
        </form>
      ) : username ? (
        <span className="umapper__pill" title={`Codes are mapped to ${username}`}>
          {UserIcon}
          <span className="umapper__pill-name">{username}</span>
          <button
            type="button"
            className="umapper__icon-btn"
            onClick={handleOpen}
            aria-label={`Change mapped username (${username})`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>
          <button
            type="button"
            className="umapper__icon-btn"
            onClick={handleUnmap}
            aria-label="Stop mapping username"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      ) : (
        <button
          type="button"
          className="umapper__btn"
          onClick={handleOpen}
          title="Map a username to this code"
        >
          {UserIcon}
          <span className="umapper__btn-label">Map</span>
        </button>
      )}
    </div>
  )
}

export default UsernameMapper
