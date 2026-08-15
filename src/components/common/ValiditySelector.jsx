import React, { useState, useRef, useEffect } from 'react'
import './ValiditySelector.css'

// Validity options for a share. 'none' = no limit (default).
const OPTIONS = [
  { value: 'none', label: 'No limit', desc: 'Stays forever' },
  { value: 'once', label: '1-time', desc: 'Viewable once' },
  { value: '6h', label: '6 hours', desc: 'Valid for 6h' },
]

const ValiditySelector = ({ value = 'none', onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const current = OPTIONS.find((o) => o.value === value) || OPTIONS[0]
  const hasLimit = value !== 'none' && value !== ''

  return (
    <div className="validity" ref={ref}>
      <button
        type="button"
        className={`validity__trigger ${open ? 'validity__trigger--open' : ''} ${hasLimit ? 'validity__trigger--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Share validity"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="validity__label">{current.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="validity__chevron" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="validity__menu" role="listbox" aria-label="Validity options">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              className={`validity__option ${opt.value === value ? 'validity__option--active' : ''}`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              <span className="validity__option-label">
                {opt.value === value && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {opt.label}
              </span>
              <span className="validity__option-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ValiditySelector
