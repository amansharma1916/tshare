import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './p1.css'

const P1 = () => {
  const sharePage = () => {
    window.location.href = '/sharePage'
  }

  const receivePage = () => {
    window.location.href = '/recievePage'
  }

  const publicRoomPage = () => {
    window.location.href = '/public-room'
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

  return (
    <div className="home">
      <div className="home__bg-digits" aria-hidden="true">
        {digits.map((digit, i) => (
          <motion.span
            key={i}
            className="home__bg-digit"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 0.08, 0.03, 0.08, 0],
              y: [20, -20, -60, -100, -140],
            }}
            transition={{
              duration: 6 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'linear',
            }}
            style={{
              left: `${8 + i * 9}%`,
              fontSize: `${2 + Math.random() * 3}rem`,
            }}
          >
            {digit}
          </motion.span>
        ))}
      </div>

      <div className="home__orb home__orb--1" aria-hidden="true" />
      <div className="home__orb home__orb--2" aria-hidden="true" />

      <div className="home__content">
        <motion.div
          className="home__brand"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="home__brand-icon">
            <img src="/s2.svg" alt="TShare" width="32" height="32" />
          </span>
          <span className="home__brand-name">TShare</span>
        </motion.div>

        <motion.div
          className="home__hero"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="home__title">
            Share Anything.
            <br />
            <span className="home__title-accent">In Seconds.</span>
          </h1>
          <p className="home__subtitle">
            No sign-up. No accounts. Just a 4-digit code.
          </p>
        </motion.div>

        <motion.div
          className="home__actions"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            className="action-card action-card--send"
            onClick={sharePage}
            title="Share text, images, or files"
          >
            <div className="action-card__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </div>
            <div className="action-card__info">
              <span className="action-card__label">Send</span>
              <span className="action-card__desc">Share text, images & files</span>
            </div>
            <div className="action-card__arrow" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            className="action-card action-card--receive"
            onClick={receivePage}
            title="Receive shared content"
          >
            <div className="action-card__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 3v12" />
              </svg>
            </div>
            <div className="action-card__info">
              <span className="action-card__label">Receive</span>
              <span className="action-card__desc">Enter a code to get content</span>
            </div>
            <div className="action-card__arrow" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </motion.div>

        <motion.div
          className="home__extra"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <button
            className="home__public-room-btn"
            onClick={publicRoomPage}
            title="Join a public chat room"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            Public Rooms
          </button>
        </motion.div>
      </div>

      <motion.div
        className="home__footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <div className="home__footer-inner">
          <span className="home__footer-text">
            TShare &copy; 2025 &middot; Instant sharing, no setup needed
          </span>
          <div className="home__footer-links">
            <Link to="/privacy-policy" className="home__footer-link">Privacy Policy</Link>
            <Link to="/terms-of-service" className="home__footer-link">Terms of Service</Link>
            <Link to="/about" className="home__footer-link">About</Link>
            <Link to="/contact" className="home__footer-link">Contact</Link>
            <Link to="/admin/login" className="home__admin-link">Admin</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default P1