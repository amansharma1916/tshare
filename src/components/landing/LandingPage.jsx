import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import './LandingPage.css'

/* ---------------------------------- helpers ---------------------------------- */

// Animated counter that counts up when scrolled into view
const Counter = ({ value, duration = 1.6 }) => {
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

  return <span ref={ref}>{display.toLocaleString()}</span>
}

// Small SVG icon set (stroke-based, Lucide-style) — no emojis
const Icon = ({ name, size = 20 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (name) {
    case 'text':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h10M4 18h7" />
        </svg>
      )
    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      )
    case 'file':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      )
    case 'flame':
      return (
        <svg {...common}>
          <path d="M12 22c4.4 0 7-2.4 7-6 0-3-2-4.5-3.5-6C14 8 13 6.5 13 4a10 10 0 0 0-5 8c0 .5 0 1 .2 1.5C6 12 5 13 5 15c0 3 2.6 6 7 7z" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'send':
      return (
        <svg {...common}>
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22l-4-9-9-4z" />
        </svg>
      )
    case 'scan':
      return (
        <svg {...common}>
          <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" />
        </svg>
      )
    case 'copy':
      return (
        <svg {...common}>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )
    default:
      return null
  }
}

/* --------------------------- hero code-lock visual --------------------------- */

// The centrepiece: a 4-digit "vault" tile with a scan line + live demo copy
const CodeLock = () => {
  const [copied, setCopied] = useState(false)
  const DEMO_CODE = '4826'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_CODE)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = DEMO_CODE
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="lock" role="img" aria-label="Example share code 4-8-2-6">
      <div className="lock__shine" />
      <div className="lock__head">
        <span className="lock__dot" />
        <span className="lock__label">tshare / vault</span>
        <span className="lock__live">
          <span className="lock__pulse" /> live demo
        </span>
      </div>

      <div className="lock__digits" aria-hidden="true">
        {DEMO_CODE.split('').map((d, i) => (
          <motion.span
            key={i}
            className="lock__digit"
            initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.35 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {d}
          </motion.span>
        ))}
        <motion.span
          className="lock__scan"
          animate={{ top: ['8%', '88%', '8%'] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="lock__foot">
        <span>
          <Icon name="scan" size={15} /> unlocks on any device
        </span>
        <button className="lock__copy" onClick={handleCopy} type="button">
          <Icon name={copied ? 'scan' : 'copy'} size={14} />
          {copied ? 'Copied!' : 'Copy 4826'}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------ hero + showcase ------------------------------ */

const ease = [0.16, 1, 0.3, 1]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -60px 0px' },
  transition: { duration: 0.6, delay, ease },
})


const LandingPage = ({
  stats = { visitors: 0, files_shared: 0, received: 0, premium_users: 0 },
  todayStats = { visitors: 0, files_shared: 0, received: 0, premium_users: 0, date: '' },
  statsLoading = false,
}) => {
  const navigate = useNavigate()

  const statItems = [
    { label: 'Keys shared', value: stats.files_shared },
    { label: 'Codes opened', value: stats.received },
    { label: 'Visitors', value: stats.visitors },
    { label: 'Premium Users', value: stats.premium_users },
  ]

  const todayStatItems = [
    { label: 'Shared today', value: todayStats.files_shared },
    { label: 'Opened today', value: todayStats.received },
    { label: 'Visitors today', value: todayStats.visitors },
    { label: 'Upgraded today', value: todayStats.premium_users },
  ]

  const shareTypes = [
    {
      icon: 'text',
      title: 'Text',
      desc: 'A note, a link, a password — dropped behind a key in one tap.',
      to: '/share',
    },
    {
      icon: 'image',
      title: 'Images',
      desc: 'Photos and screenshots anyone can open on any device, no app.',
      to: '/share-image',
    },
    {
      icon: 'file',
      title: 'Files & PDFs',
      desc: 'Documents up to 50MB, previewed inline or downloaded on demand.',
      to: '/share-file',
    },
  ]

  return (
    <div className="landing">
      {/* ============ SLIDE 1 — HERO ============ */}
      <section className="landing__hero">
        <div className="landing__grid" aria-hidden="true" />
        <div className="landing__hero-bg" aria-hidden="true">
          <motion.div
            className="landing__orb landing__orb--1"
            animate={{ y: [0, -34, 0], x: [0, 26, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="landing__orb landing__orb--2"
            animate={{ y: [0, 30, 0], x: [0, -24, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="landing__hero-inner">
          <div className="landing__hero-copy">
            <motion.div
              className="landing__hero-badge"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <span className="landing__hero-badge-dot" />
              No sign-up · No app · No limits
            </motion.div>

            <motion.h1
              className="landing__hero-title"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease }}
            >
              One 4-digit key.
              <br />
              <span className="landing__hero-gradient">Anything inside.</span>
            </motion.h1>

            <motion.p
              className="landing__hero-subtitle"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.18, ease }}
            >
              Drop text, an image, or any file behind a short code. Share the key anywhere.
              Anyone who opens it gets the content on any device — no account, ever.
            </motion.p>

            <motion.div
              className="landing__hero-actions"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28, ease }}
            >
              <button className="landing__btn landing__btn--primary" onClick={() => navigate('/share')} type="button">
                <Icon name="send" size={18} /> Share something
              </button>
              <button className="landing__btn landing__btn--ghost" onClick={() => navigate('/receive')} type="button">
                <Icon name="scan" size={18} /> Receive from code
              </button>
              <Link className="landing__btn landing__btn--text" to="/public-room">
                <Icon name="users" size={18} /> Join a room
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="landing__hero-visual"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease }}
          >
            <CodeLock />
          </motion.div>
        </div>

        <div className="landing__today-head">
          <motion.span
            className="landing__today-tag"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42, ease }}
          >
            <span className="landing__today-tag-dot" aria-hidden="true" />
            Today
          </motion.span>
        </div>

        <motion.div
          className={`landing__hero-stats landing__hero-stats--today${statsLoading ? ' landing__hero-stats--loading' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease }}
        >
          {todayStatItems.map((s) => (
            <div className="landing__stat" key={s.label}>
              <div className="landing__stat-value">
                {statsLoading ? (
                  <span className="landing__stat-skeleton" aria-hidden="true" />
                ) : (
                  <Counter value={s.value} />
                )}
              </div>
              <div className="landing__stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="landing__alltime-head">
          <motion.span
            className="landing__alltime-tag"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.47, ease }}
          >
            All-time
          </motion.span>
        </div>

        <motion.div
          className={`landing__hero-stats landing__hero-stats--alltime${statsLoading ? ' landing__hero-stats--loading' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease }}
        >
          {statItems.map((s) => (
            <div className="landing__stat" key={s.label}>
              <div className="landing__stat-value">
                {statsLoading ? (
                  <span className="landing__stat-skeleton" aria-hidden="true" />
                ) : (
                  <Counter value={s.value} />
                )}
              </div>
              <div className="landing__stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>


      {/* ============ SLIDE 2 — SHOWCASE ============ */}
      <section className="landing__show">
        <motion.div className="landing__show-head" {...fadeUp(0)}>
          <span className="landing__eyebrow">What goes behind the key</span>
          <h2 className="landing__show-title">
            Built for one thing: <span className="landing__hero-gradient">moving things fast</span>
          </h2>
        </motion.div>

        <div className="landing__share-grid">
          {shareTypes.map((t, i) => (
            <motion.button
              key={t.title}
              className="landing__share-card"
              onClick={() => navigate(t.to)}
              type="button"
              {...fadeUp(0.08 + i * 0.09)}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="landing__share-icon" aria-hidden="true">
                <Icon name={t.icon} size={24} />
              </span>
              <span className="landing__share-title">{t.title}</span>
              <span className="landing__share-desc">{t.desc}</span>
              <span className="landing__share-cta">
                Start sharing <span aria-hidden="true">→</span>
              </span>
            </motion.button>
          ))}
        </div>

        <div className="landing__feature-grid">
          <motion.div className="landing__feature landing__feature--premium" {...fadeUp(0.1)}>
            <div className="landing__feature-head">
              <span className="landing__feature-icon"><Icon name="lock" size={20} /></span>
              <span className="landing__feature-tag">Premium</span>
            </div>
            <h3>Own a key that always stays yours.</h3>
            <p>
              Claim a memorable code like 0000, lock it with a password, swap the content
              anytime from your dashboard, and show your verified name on it.
            </p>
            <button className="landing__feature-link" onClick={() => navigate('/buy')} type="button">
              Unlock premium <span aria-hidden="true">→</span>
            </button>
          </motion.div>

          <motion.div className="landing__feature landing__feature--rooms" {...fadeUp(0.18)}>
            <div className="landing__feature-head">
              <span className="landing__feature-icon"><Icon name="users" size={20} /></span>
              <span className="landing__feature-tag">Public rooms</span>
            </div>
            <h3>Share together, in realtime.</h3>
            <p>
              Join an open room and exchange text live with other people — no accounts,
              no friction. Type, send, done.
            </p>
            <button className="landing__feature-link" onClick={() => navigate('/public-room')} type="button">
              Enter a room <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        </div>

        <motion.div className="landing__use" {...fadeUp(0.12)}>
          <span className="landing__use-lead">Great for…</span>
          <div className="landing__use-chips">
            <span className="landing__chip"><Icon name="text" size={15} /> Storing a note for later</span>
            <span className="landing__chip"><Icon name="send" size={15} /> Sending between your own devices</span>
            <span className="landing__chip"><Icon name="users" size={15} /> Sharing without asking for an account</span>
            <span className="landing__chip"><Icon name="scan" size={15} /> One-time handoff, accessed anytime</span>
          </div>
        </motion.div>

        <motion.div className="landing__cta" {...fadeUp(0.1)}>
          <div className="landing__cta-card">
            <h2>It takes about 3 seconds.</h2>
            <p>Drop it, get a key, share the key. Nothing else to install, verify, or remember.</p>
            <div className="landing__cta-actions">
              <button className="landing__btn landing__btn--primary" onClick={() => navigate('/share')} type="button">
                <Icon name="send" size={18} /> Start sharing free
              </button>
              <button className="landing__btn landing__btn--ghost" onClick={() => navigate('/buy')} type="button">
                <Icon name="flame" size={18} /> Go premium
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms-of-service">Terms</Link>
          <Link to="/org/register">For Businesses</Link>
          <Link to="/admin/panel">Admin</Link>
        </div>
        <p>© {new Date().getFullYear()} TShare · One key, anything inside.</p>
      </footer>
    </div>
  )
}

export default LandingPage

