import { useEffect, useState } from 'react'
import './EventPosterModal.css'

const AFFILIATE_URL = 'https://influencers.inkhubtattoos.in/r/AMANSHARMAPJH'
const POSTER_IMAGE = '/events/inkhub-tattoos-promo.webp'

function EventPosterModal() {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (!isOpen) return undefined

    const originalOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!isOpen) return null

  const closeOnBackdrop = (event) => {
    if (event.target === event.currentTarget) setIsOpen(false)
  }

  return (
    <div
      className="event-poster-overlay"
      onClick={closeOnBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="InkHub Tattoos promotion"
    >
      <div className="event-poster-modal">
        <button
          type="button"
          className="event-poster-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close promotion"
        >
          <span aria-hidden="true">&#10005;</span>
        </button>

        <a
          href={AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Shop InkHub Tattoos promotion"
        >
          <img
            src={POSTER_IMAGE}
            alt="InkHub Tattoos: Buy one, get two free semi-permanent tattoos"
            className="event-poster-image"
            width="920"
            height="920"
            decoding="async"
          />
        </a>

        <a
          href={AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="event-poster-cta"
        >
          Shop the offer <span aria-hidden="true">&#8599;</span>
        </a>
      </div>
    </div>
  )
}

export default EventPosterModal