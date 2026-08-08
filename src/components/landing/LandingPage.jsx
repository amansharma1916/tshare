import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import './LandingPage.css'

/* ═══════════════════════════════════════════════════════
   Animated Counter
   ═══════════════════════════════════════════════════════ */
const Counter = ({ value, duration = 2, format = (n) => n.toLocaleString() }) => {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

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

const formatCompact = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`
  return `${n}`
}

/* ═══════════════════════════════════════════════════════
   Line Icons (clean, professional)
   ═══════════════════════════════════════════════════════ */
const UploadIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const DownloadIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const ArrowRightIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const CodeIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9l-3 3 3 3" />
    <path d="M15 9l3 3-3 3" />
  </svg>
)

const SendIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
)

const TextIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const ImageIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const PdfIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)

const FileIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ZapIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const LockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const BanIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
)

const LayersIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const MenuIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
)

const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* ═══════════════════════════════════════════════════════
   Navbar
   ═══════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { label: 'Home', type: 'section', id: 'top' },
  { label: 'How it Works', type: 'section', id: 'how-it-works' },
  { label: 'Features', type: 'section', id: 'features' },
  { label: 'Premium', type: 'section', id: 'premium' },
  { label: 'About', type: 'route', to: '/about' },
]

const LandingNavbar = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleSection = (id) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="landing-nav" aria-label="Primary">
      <Link to="/" className="landing-nav__logo" aria-label="TShare home">
        <img src="/s2.svg" alt="" width="22" height="22" />
        <span>TShare</span>
      </Link>

      <div className="landing-nav__links">
        {NAV_LINKS.map((link) =>
          link.type === 'section' ? (
            <button key={link.label} className="landing-nav__link" onClick={() => handleSection(link.id)}>
              {link.label}
            </button>
          ) : (
            <Link key={link.label} to={link.to} className="landing-nav__link">
              {link.label}
            </Link>
          )
        )}
      </div>

      <div className="landing-nav__actions">
        <button className="landing-nav__cta" onClick={() => navigate('/share')}>
          Get Started
          <ArrowRightIcon size={14} />
        </button>
        <button
          className="landing-nav__toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="landing-nav__mobile"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {NAV_LINKS.map((link) =>
              link.type === 'section' ? (
                <button key={link.label} className="landing-nav__mobile-link" onClick={() => handleSection(link.id)}>
                  {link.label}
                </button>
              ) : (
                <Link key={link.label} to={link.to} className="landing-nav__mobile-link" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              )
            )}
            <button
              className="landing-nav__mobile-cta"
              onClick={() => {
                setOpen(false)
                navigate('/share')
              }}
            >
              Get Started
              <ArrowRightIcon size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════
   Hero — Send / Receive cards
   ═══════════════════════════════════════════════════════ */
const SendReceiveCard = ({ type, delay = 0 }) => {
  const navigate = useNavigate()
  const isSend = type === 'send'
  const title = isSend ? 'Send File' : 'Receive File'
  const desc = isSend ? 'Generate a unique code and start sharing instantly.' : 'Enter a sharing code to view and download content.'
  const label = isSend ? 'Start Sharing' : 'Receive Content'
  const route = isSend ? '/share' : '/receive'

  return (
    <motion.div
      className={`landing-card landing-card--${type}`}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
    >
      <div className="landing-card__icon">
        {isSend ? <UploadIcon size={28} /> : <DownloadIcon size={28} />}
      </div>
      <h3 className="landing-card__title">{title}</h3>
      <p className="landing-card__desc">{desc}</p>
      <button className="landing-card__btn" onClick={() => navigate(route)}>
        {label}
        <ArrowRightIcon size={16} />
      </button>
    </motion.div>
  )
}

const trustItems = [
  { icon: ZapIcon, label: 'Instant', desc: 'Share content in seconds.' },
  { icon: LockIcon, label: 'Anonymous', desc: 'No account or identity required.' },
  { icon: BanIcon, label: 'No Login', desc: 'Start sharing immediately.' },
  { icon: LayersIcon, label: 'Multiple Formats', desc: 'Text, images, PDFs and files.' },
]

const TrustFeatures = () => (
  <div className="landing-trust">
    {trustItems.map((item, i) => {
      const Icon = item.icon
      return (
        <motion.div
          className="landing-trust__item"
          key={item.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 + i * 0.08 }}
        >
          <span className="landing-trust__icon">
            <Icon size={15} />
          </span>
          <div className="landing-trust__text">
            <strong>{item.label}</strong>
            <span>{item.desc}</span>
          </div>
        </motion.div>
      )
    })}
  </div>
)

const HeroSection = () => (
  <section className="landing-hero" id="top">
    <motion.div
      className="landing-hero__badge"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="landing-hero__badge-dot" />
      Free · Anonymous · No login required
    </motion.div>

    <motion.h1
      className="landing-hero__title"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      Share anything.
      <span className="landing-hero__accent">Without an account.</span>
    </motion.h1>

    <motion.p
      className="landing-hero__subtitle"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      Send text, images, PDFs and files using a simple sharing code. No signup. No email. No credentials.
    </motion.p>

    <div className="landing-cards">
      <SendReceiveCard type="send" delay={0.3} />
      <SendReceiveCard type="receive" delay={0.42} />
    </div>

    <TrustFeatures />
  </section>
)

/* ═══════════════════════════════════════════════════════
   Stats
   ═══════════════════════════════════════════════════════ */
const Stats = ({ stats }) => {
  const items = [
    { label: 'Total Shares', value: stats.files_shared },
    { label: 'Total Received', value: stats.received },
    { label: 'Visitors', value: stats.visitors },
    { label: 'Premium Users', value: stats.premium_users },
  ]

  return (
    <section className="landing-stats" aria-label="Platform statistics">
      <div className="landing-stats__grid">
        {items.map((s, i) => (
          <motion.div
            className="landing-stat"
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <div className="landing-stat__value">
              <Counter value={s.value} format={formatCompact} />
            </div>
            <div className="landing-stat__label">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   Shared section header
   ═══════════════════════════════════════════════════════ */
const SectionHeader = ({ eyebrow, title, subtitle }) => (
  <motion.div
    className="landing-section__header"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.5 }}
  >
    {eyebrow && <span className="landing-section__eyebrow">{eyebrow}</span>}
    <h2 className="landing-section__title">{title}</h2>
    {subtitle && <p className="landing-section__subtitle">{subtitle}</p>}
  </motion.div>
)

/* ═══════════════════════════════════════════════════════
   How It Works
   ═══════════════════════════════════════════════════════ */
const steps = [
  { num: '01', title: 'Upload', desc: 'Add your text, image, PDF or file.', icon: 'upload' },
  { num: '02', title: 'Get a Code', desc: 'TShare generates a unique sharing code.', icon: 'code' },
  { num: '03', title: 'Share', desc: 'Send the code to anyone.', icon: 'send' },
]

const HowItWorks = () => (
  <section className="landing-section landing-section--how" id="how-it-works">
    <SectionHeader eyebrow="How it works" title="One code. That's it." subtitle="Share anything in three simple steps." />
    <div className="landing-steps">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <motion.div
            className="landing-step"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <div className="landing-step__num">{s.num}</div>
            <div className="landing-step__icon">
              {s.icon === 'upload' && <UploadIcon size={22} />}
              {s.icon === 'code' && <CodeIcon size={22} />}
              {s.icon === 'send' && <SendIcon size={22} />}
            </div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div
              className="landing-step__arrow"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.3 }}
              aria-hidden="true"
            >
              <ArrowRightIcon size={18} />
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  </section>
)

/* ═══════════════════════════════════════════════════════
   Code Showcase
   ═══════════════════════════════════════════════════════ */
const CodeShowcase = () => {
  const digits = ['4', '8', '2', '6']

  return (
    <section className="landing-section landing-section--code">
      <SectionHeader
        eyebrow="The code"
        title="Your content gets a code."
        subtitle="Share the code. The recipient enters it. Your content appears."
      />
      <div className="landing-code">
        <div className="landing-code__digits">
          {digits.map((d, i) => (
            <motion.span
              key={i}
              className="landing-code__digit"
              style={{ animationDelay: `${i * 0.35}s` }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {d}
            </motion.span>
          ))}
        </div>
        <motion.div
          className="landing-code__flow"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <span className="landing-code__flow-step">CONTENT</span>
          <span className="landing-code__flow-arrow">
            <ArrowRightIcon size={16} />
          </span>
          <span className="landing-code__flow-step landing-code__flow-step--accent">4 8 2 6</span>
          <span className="landing-code__flow-arrow">
            <ArrowRightIcon size={16} />
          </span>
          <span className="landing-code__flow-step">RECIPIENT</span>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   What Can You Share
   ═══════════════════════════════════════════════════════ */
const shareTypes = [
  { icon: 'text', title: 'Text', desc: 'Notes, messages, code snippets and more.' },
  { icon: 'image', title: 'Images', desc: 'Photos, screenshots and graphics.' },
  { icon: 'pdf', title: 'PDF', desc: 'Documents, reports and presentations.' },
  { icon: 'file', title: 'Files', desc: 'ZIPs, projects and other files.' },
]

const ShareTypes = () => (
  <section className="landing-section landing-section--types" id="features">
    <SectionHeader
      eyebrow="What can you share"
      title="Share more than files."
      subtitle="Text, images, PDFs and any file — all shareable with a simple code."
    />
    <div className="landing-types">
      {shareTypes.map((t, i) => (
        <motion.div
          className="landing-type-card"
          key={t.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
        >
          <div className="landing-type-card__icon">
            {t.icon === 'text' && <TextIcon />}
            {t.icon === 'image' && <ImageIcon />}
            {t.icon === 'pdf' && <PdfIcon />}
            {t.icon === 'file' && <FileIcon />}
          </div>
          <h3>{t.title}</h3>
          <p>{t.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
)

/* ═══════════════════════════════════════════════════════
   Store Your Data (visual mockup)
   ═══════════════════════════════════════════════════════ */
const vaultItems = [
  { icon: 'pdf', name: 'Resume.pdf', meta: '2.4 MB' },
  { icon: 'image', name: 'Project-Screenshot.png', meta: '1.2 MB' },
  { icon: 'text', name: 'Important Notes', meta: 'Text' },
  { icon: 'file', name: 'Project.zip', meta: '18 MB' },
]

const StorageShowcase = () => (
  <section className="landing-section landing-section--storage">
    <SectionHeader
      eyebrow="Storage"
      title="Keep what matters."
      subtitle="Store your important content and access it whenever you need it."
    />
    <motion.div
      className="landing-vault"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="landing-vault__header">
        <span>Your Stored Content</span>
        <span className="landing-vault__badge">Stored</span>
      </div>
      <div className="landing-vault__rows">
        {vaultItems.map((item, i) => (
          <motion.div
            className="landing-vault__row"
            key={item.name}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <div className="landing-vault__row-icon">
              {item.icon === 'pdf' && <PdfIcon size={18} />}
              {item.icon === 'image' && <ImageIcon size={18} />}
              {item.icon === 'text' && <TextIcon size={18} />}
              {item.icon === 'file' && <FileIcon size={18} />}
            </div>
            <div className="landing-vault__row-info">
              <strong>{item.name}</strong>
              <span>{item.meta}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="landing-vault__footer">
        <span>Total: 21.6 MB</span>
        <span className="landing-vault__footer-dot" />
        <span>Always accessible</span>
      </div>
    </motion.div>
  </section>
)

/* ═══════════════════════════════════════════════════════
   Custom / Memorable Codes
   ═══════════════════════════════════════════════════════ */
const exampleCodes = ['1337', '2026', '8080', '4826']

const CustomCodeSection = () => {
  const navigate = useNavigate()

  return (
    <section className="landing-section landing-section--custom">
      <SectionHeader
        eyebrow="Memorable codes"
        title="Want a code that's yours?"
        subtitle="Choose a memorable code and make sharing easier."
      />
      <motion.div
        className="landing-custom"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="landing-custom__code" aria-hidden="true">
          {['2', '0', '2', '6'].map((d, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              {d}
            </motion.span>
          ))}
        </div>
        <div className="landing-custom__examples">
          <span className="landing-custom__examples-label">Examples:</span>
          {exampleCodes.map((code) => (
            <span className="landing-custom__chip" key={code}>
              {code}
            </span>
          ))}
        </div>
        {/* TODO: Replace with dedicated /choose-code route if one is created later.
            `/buy` currently handles premium/custom code purchase. */}
        <button className="btn btn-primary landing-custom__cta" onClick={() => navigate('/buy')}>
          Get Your Code
          <ArrowRightIcon size={16} />
        </button>
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   Premium Membership
   ═══════════════════════════════════════════════════════ */
const premiumFeatures = [
  'More storage',
  'Longer content availability',
  'Premium sharing features',
  'Custom / memorable codes',
  'Better content management',
]

const PremiumSection = () => {
  const navigate = useNavigate()

  return (
    <section className="landing-section landing-section--premium" id="premium">
      <motion.div
        className="landing-premium"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
      >
        <span className="landing-premium__badge">Premium</span>
        <h2>Upgrade your sharing.</h2>
        <p className="landing-premium__sub">More storage. More control. More possibilities.</p>
        <ul className="landing-premium__list">
          {premiumFeatures.map((feature) => (
            <li key={feature}>
              <span className="landing-premium__check">
                <CheckIcon size={13} />
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <button className="btn btn-primary landing-premium__cta" onClick={() => navigate('/buy')}>
          Go Premium
          <ArrowRightIcon size={16} />
        </button>
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   Anonymous Sharing — strong typographic moment
   ═══════════════════════════════════════════════════════ */
const AnonymousSection = () => (
  <section className="landing-anon" aria-label="Anonymous sharing">
    <motion.div
      className="landing-anon__inner"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7 }}
    >
      <h2>
        <span>No login.</span>
        <span>No email.</span>
        <span>No profile.</span>
        <span className="landing-anon__accent">Just a code.</span>
      </h2>
      <p>TShare lets you share content without creating an account or revealing unnecessary personal information.</p>
    </motion.div>
  </section>
)

/* ═══════════════════════════════════════════════════════
   Final CTA
   ═══════════════════════════════════════════════════════ */
const FinalCTA = () => {
  const navigate = useNavigate()

  return (
    <section className="landing-section landing-section--final">
      <motion.div
        className="landing-final"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
      >
        <h2>
          Your file is <span>one code</span> away.
        </h2>
        <p>Upload something. Get your code. Share it anywhere.</p>
        <div className="landing-final__actions">
          <button className="btn btn-primary" onClick={() => navigate('/share')}>
            Start Sharing
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/receive')}>
            Receive Content
          </button>
        </div>
        <span className="landing-final__note">No account required.</span>
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════════════ */
const Footer = () => (
  <footer className="landing-footer">
    <div className="landing-footer__brand">
      <img src="/s2.svg" alt="" width="18" height="18" />
      <span>TShare</span>
    </div>
    <div className="landing-footer__links">
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/privacy-policy">Privacy</Link>
      <Link to="/terms-of-service">Terms</Link>
      <Link to="/public-room">Public Room</Link>
      <Link to="/admin/panel">Admin</Link>
    </div>
    <p>© {new Date().getFullYear()} TShare. All rights reserved.</p>
  </footer>
)

/* ═══════════════════════════════════════════════════════
   Landing Page
   ═══════════════════════════════════════════════════════ */
const LandingPage = ({ stats = { visitors: 0, files_shared: 0, received: 0, premium_users: 0 } }) => {
  return (
    <div className="landing">
      <div className="landing__glow" aria-hidden="true" />
      <LandingNavbar />
      <main className="landing__main">
        <HeroSection />
        <Stats stats={stats} />
        <HowItWorks />
        <CodeShowcase />
        <ShareTypes />
        <StorageShowcase />
        <CustomCodeSection />
        <PremiumSection />
        <AnonymousSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage