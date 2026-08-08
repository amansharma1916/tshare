import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import './LandingPage.css'// Animated counter component
const Counter = ({ value, duration = 2 }) => {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })

  useEffect(() => {
    if (!inView) return
    let start = null
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, value, duration])

  return <span ref={ref}>{format(display)}</span>
}

// Animated line graph component
const UsageGraph = () => {
  const [data, setData] = useState([20, 35, 28, 45, 38, 55, 48, 65, 58, 75, 68, 85, 78, 95, 88, 100])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % data.length
        return next
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [data.length])

  const maxVal = 100
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (val / maxVal) * 100
    return `${x},${y}`
  }).join(' ')

  const currentPoint = data[currentIndex]
  const currentX = (currentIndex / (data.length - 1)) * 100
  const currentY = 100 - (currentPoint / maxVal) * 100

  return (
    <div className="landing-graph">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="landing-graph__svg">
        {/* Grid lines */}
        {[25, 50, 75].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" strokeDasharray="2,2" />
        ))}
        {/* Area fill */}
        <motion.polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#graphGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        />
        {/* Line */}
        <motion.polyline
          points={points}
          fill="none"
          stroke="var(--theme-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        {/* Animated dot */}
        <motion.circle
          cx={currentX}
          cy={currentY}
          r="2"
          fill="var(--theme-primary-light)"
          animate={{ cx: currentX, cy: currentY }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="landing-graph__labels">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  )
}

// Share flow animation
const ShareFlow = () => {
  const [step, setStep] = useState(0)
  const steps = [
    { icon: 'text', label: 'Type Text' },
    { icon: 'code', label: 'Get 4-Digit Code' },
    { icon: 'send', label: 'Share Code' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className="landing-flow landing-flow--share">
      <div className="landing-flow__header">
        <span className="landing-flow__badge">Share Flow</span>
        <h3>Share in 3 Simple Steps</h3>
      </div>
      <div className="landing-flow__steps">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <motion.div
              className={`landing-flow__step ${step === i ? 'landing-flow__step--active' : ''} ${step > i ? 'landing-flow__step--done' : ''}`}
              animate={{
                scale: step === i ? 1.1 : 1,
                opacity: step === i ? 1 : step > i ? 0.7 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="landing-flow__step-icon">
                {s.icon === 'text' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                )}
                {s.icon === 'code' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9l-3 3 3 3" />
                    <path d="M15 9l3 3-3 3" />
                  </svg>
                )}
                {s.icon === 'send' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                )}
              </div>
              <span className="landing-flow__step-label">{s.label}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                className="landing-flow__arrow"
                animate={{ opacity: step >= i ? 1 : 0.3 }}
                transition={{ duration: 0.3 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="landing-flow__code">
        <motion.div
          className="landing-flow__code-digits"
          animate={{ opacity: step === 1 ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
        >
          {['4', '8', '2', '6'].map((d, i) => (
            <motion.span
              key={i}
              className="landing-flow__code-digit"
              animate={{ y: step === 1 ? [0, -4, 0] : 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {d}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// Receive flow animation
const ReceiveFlow = () => {
  const [step, setStep] = useState(0)
  const steps = [
    { icon: 'code', label: 'Enter Code' },
    { icon: 'download', label: 'Fetch Content' },
    { icon: 'check', label: 'View & Download' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className="landing-flow landing-flow--receive">
      <div className="landing-flow__header">
        <span className="landing-flow__badge landing-flow__badge--green">Receive Flow</span>
        <h3>Receive in 3 Simple Steps</h3>
      </div>
      <div className="landing-flow__steps">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <motion.div
              className={`landing-flow__step ${step === i ? 'landing-flow__step--active' : ''} ${step > i ? 'landing-flow__step--done' : ''}`}
              animate={{
                scale: step === i ? 1.1 : 1,
                opacity: step === i ? 1 : step > i ? 0.7 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="landing-flow__step-icon landing-flow__step-icon--green">
                {s.icon === 'code' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9l-3 3 3 3" />
                    <path d="M15 9l3 3-3 3" />
                  </svg>
                )}
                {s.icon === 'download' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                {s.icon === 'check' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="landing-flow__step-label">{s.label}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                className="landing-flow__arrow"
                animate={{ opacity: step >= i ? 1 : 0.3 }}
                transition={{ duration: 0.3 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="landing-flow__receive-result">
        <motion.div
          className="landing-flow__receive-box"
          animate={{ opacity: step === 2 ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Content received successfully!</span>
        </motion.div>
      </div>
    </div>
  )
}

// Public room flow
const PublicRoomFlow = () => {
  const [activeUser, setActiveUser] = useState(0)
  const users = [
    { name: 'Alice', color: 'var(--theme-primary)' },
    { name: 'Bob', color: 'var(--theme-success)' },
    { name: 'Charlie', color: 'var(--theme-warning)' },
    { name: 'Diana', color: 'var(--theme-info)' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUser(prev => (prev + 1) % users.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [users.length])

  return (
    <div className="landing-flow landing-flow--room">
      <div className="landing-flow__header">
        <span className="landing-flow__badge landing-flow__badge--blue">Public Rooms</span>
        <h3>Join Community Rooms</h3>
      </div>
      <div className="landing-flow__room">
        <div className="landing-flow__room-users">
          {users.map((u, i) => (
            <motion.div
              key={i}
              className="landing-flow__room-user"
              animate={{
                scale: activeUser === i ? 1.15 : 1,
                opacity: activeUser === i ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="landing-flow__room-avatar" style={{ background: u.color }}>
                {u.name.charAt(0)}
              </div>
              <span>{u.name}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="landing-flow__room-message"
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            key={activeUser}
            className="landing-flow__room-bubble"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{ color: users[activeUser].color }}>{users[activeUser].name}:</span> Hey everyone! 👋
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// What can be shared
const ShareTypes = () => {
  const types = [
    {
      icon: 'text',
      title: 'Text',
      desc: 'Share notes, messages, code snippets, and any text instantly.',
      color: 'var(--theme-primary)',
    },
    {
      icon: 'image',
      title: 'Images',
      desc: 'Share photos, screenshots, and graphics with a simple code.',
      color: 'var(--theme-success)',
    },
    {
      icon: 'file',
      title: 'Files',
      desc: 'Share documents, PDFs, and any file type securely.',
      color: 'var(--theme-warning)',
    },
  ]

  return (
    <div className="landing-types">
      {types.map((t, i) => (
        <motion.div
          key={i}
          className="landing-types__card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: i * 0.15 }}
          whileHover={{ y: -5 }}
        >
          <div className="landing-types__icon" style={{ background: `${t.color}20`, color: t.color }}>
            {t.icon === 'text' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            )}
            {t.icon === 'image' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
            {t.icon === 'file' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            )}
          </div>
          <h3>{t.title}</h3>
          <p>{t.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}

const LandingPage = ({ stats = { visitors: 0, files_shared: 0, received: 0, premium_users: 0 } }) => {
  const navigate = useNavigate()

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="landing__hero">
        <div className="landing__hero-bg">
          <motion.div
            className="landing__orb landing__orb--1"
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="landing__orb landing__orb--2"
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="landing__orb landing__orb--3"
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="landing__hero-content">
          <motion.div
            className="landing__hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="landing__hero-badge-dot" />
            Free · No Login Required
          </motion.div>

          <motion.h1
            className="landing__hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Share Anything.
            <br />
            <span className="landing__hero-gradient">In Seconds.</span>
          </motion.h1>

          <motion.p
            className="landing__hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            No sign-up. No accounts. Just a 4-digit code.
            <br />
            Share text, images, and files instantly with anyone.
          </motion.p>

          <motion.div
            className="landing__hero-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button className="btn btn-primary landing__hero-btn" onClick={() => navigate('/share')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              Start Sharing
            </button>
            <button className="btn btn-secondary landing__hero-btn" onClick={() => navigate('/receive')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 3v12" />
              </svg>
              Receive Content
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="landing__hero-stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="landing__stat">
              <div className="landing__stat-value">
                <Counter value={stats.files_shared} />
              </div>
              <div className="landing__stat-label">Total Shares</div>
            </div>
            <div className="landing__stat-divider" />
            <div className="landing__stat">
              <div className="landing__stat-value">
                <Counter value={stats.received} />
              </div>
              <div className="landing__stat-label">Total Received</div>
            </div>
            <div className="landing__stat-divider" />
            <div className="landing__stat">
              <div className="landing__stat-value">
                <Counter value={stats.visitors} />
              </div>
              <div className="landing__stat-label">Visitors</div>
            </div>
            <div className="landing__stat-divider" />
            <div className="landing__stat">
              <div className="landing__stat-value">
                <Counter value={stats.premium_users} />
              </div>
              <div className="landing__stat-label">Premium Users</div>
            </div>
          </motion.div>
        </div>

        {/* Usage Graph */}
        <motion.div
          className="landing__graph-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="landing__graph-header">
            <div>
              <h3>Platform Usage</h3>
              <p>Daily active shares & receives</p>
            </div>
            <span className="landing__graph-live">
              <span className="landing__graph-live-dot" />
              Live
            </span>
          </div>
          <UsageGraph />
        </motion.div>
      </section>

      {/* Share Flow Section */}
      <section className="landing__section">
        <motion.div
          className="landing__section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <h2>How Sharing Works</h2>
          <p>Simple, fast, and secure - share anything with a 4-digit code</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ShareFlow />
        </motion.div>
      </section>

      {/* What Can Be Shared */}
      <section className="landing__section">
        <motion.div
          className="landing__section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <h2>What Can You Share?</h2>
          <p>Everything you need for instant communication</p>
        </motion.div>
        <ShareTypes />
      </section>

      {/* Receive Flow Section */}
      <section className="landing__section">
        <motion.div
          className="landing__section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <h2>Receiving Made Easy</h2>
          <p>Enter a code and get your content instantly</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ReceiveFlow />
        </motion.div>
      </section>

      {/* Public Rooms Section */}
      <section className="landing__section">
        <motion.div
          className="landing__section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <h2>Join Public Rooms</h2>
          <p>Connect with the community in real-time</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <PublicRoomFlow />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="landing__cta">
        <motion.div
          className="landing__cta-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <h2>Ready to Start Sharing?</h2>
          <p>It's free, it's fast, and no login is required</p>
          <div className="landing__cta-actions">
            <button className="btn btn-primary landing__cta-btn" onClick={() => navigate('/share')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              Share Now
            </button>
            <button className="btn btn-secondary landing__cta-btn" onClick={() => navigate('/public-room')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              Join Public Room
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms-of-service">Terms</Link>
          <Link to="/admin/panel">Admin</Link>
        </div>
        <p>© {new Date().getFullYear()} TShare. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LandingPage

