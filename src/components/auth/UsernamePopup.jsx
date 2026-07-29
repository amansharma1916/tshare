import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './UsernamePopup.css'

const UsernamePopup = ({ isOpen, onClose, onUsernameSubmit }) => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Please enter a username')
      return
    }
    onUsernameSubmit(trimmed)
  }

  if (!isOpen) return null

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup__header">
          <h2 className="popup__title">Enter your username</h2>
          <p className="popup__desc">Share or receive content with a username. No password needed.</p>
        </div>

        <form onSubmit={handleSubmit} className="popup__form">
          <div className="popup__field">
            <input
              type="text"
              className="popup__input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              autoFocus
              required
            />
          </div>

          {error && <div className="popup__error">{error}</div>}

          <button type="submit" className="popup__btn popup__btn--primary">
            Continue
          </button>
          <button type="button" className="popup__btn popup__btn--secondary" onClick={onClose}>
            Continue as anonymous
          </button>
        </form>

        <div className="popup__footer">
          <p className="popup__footer-text">
            Already have an account?{' '}
            <Link to="/login" className="popup__link" onClick={onClose}>Login</Link>
          </p>
          <p className="popup__footer-text">
            Need an account?{' '}
            <Link to="/register" className="popup__link" onClick={onClose}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default UsernamePopup
