import React from 'react'
import { motion } from 'framer-motion'

const OfflinePopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="offline-popup-overlay">
      <motion.div
        className="offline-popup"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="offline-popup__content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2>No Internet Connection</h2>
          <p>Please check your connection and try again.</p>
          <button className="btn btn--primary" onClick={onClose}>
            OK
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default OfflinePopup