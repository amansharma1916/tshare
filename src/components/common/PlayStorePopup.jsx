import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './PlayStorePopup.css'

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=in.tshare.app'

// sessionStorage keeps the dismissal for the current visit only — the popup
// shows once per session so it stays discoverable without becoming annoying.
const DISMISS_KEY = 'tshare_playstore_popup_dismissed'

// Small delay so the popup never fights with the initial page render.
const SHOW_DELAY_MS = 2500

const PlayStoreIcon = () => (
  <svg width="28" height="28" viewBox="0 0 512 512" aria-hidden="true">
    {/* Google Play triangle — the four official brand colors */}
    <path fill="#4285F4" d="M99.6 32.6c-6.4 3.3-10.6 9.8-10.6 18.9v409c0 9.1 4.2 15.6 10.6 18.9L314 256 99.6 32.6z" />
    <path fill="#34A853" d="M373.4 215.2 99.6 32.6 314 256l59.4-40.8z" />
    <path fill="#FBBC04" d="M99.6 479.4 373.4 296.8 314 256 99.6 479.4z" />
    <path fill="#EA4335" d="M373.4 296.8l72.9-49.9c17.5-12 17.5-41.8 0-53.8l-72.9-49.9L314 256l59.4 40.8z" />
  </svg>
)

const PlayStorePopup = () => {
  const [isVisible, setIsVisible] = useState(false)
  // On phones the popup sits at the bottom, so it should slide UP into view
  // (positive y) instead of dropping down from the top.
  const isMobile =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches
  const slideOffset = isMobile ? 24 : -24

  useEffect(() => {
    // Don't nag users who already closed it during this visit.
    if (sessionStorage.getItem(DISMISS_KEY) === 'true') return

    const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem(DISMISS_KEY, 'true')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="playstore-popup"
          role="dialog"
          aria-label="Get the TShare Android app"
          initial={{ opacity: 0, y: slideOffset, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: slideOffset, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        >
          <button
            className="playstore-popup__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="playstore-popup__icon">
            <PlayStoreIcon />
          </div>

          <div className="playstore-popup__body">
            <p className="playstore-popup__title">We&apos;re on Google Play!</p>
            <p className="playstore-popup__subtitle">
              Get the TShare app for faster sharing on the go.
            </p>
            <a
              className="playstore-popup__cta"
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Install App
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PlayStorePopup
