import './MobileBanner.css'

/* ============================================================
   Mobile banner — InkHub Dragon Tattoo (affiliate ad)
   Shown ONLY on mobile view (max-width: 800px) where the desktop
   side ads (.share-page-ad) are hidden. Replaces the header icon
   on all share pages and the receive page. Tap opens the
   affiliate link in a new tab.
   ============================================================ */
const AFFILIATE_URL = 'https://influencers.inkhubtattoos.in/r/AMANSHARMAPJH'
const BANNER_IMAGE = '/events/inkhub-dragon-tattoo-banner.png'

function MobileBanner() {
  return (
    <a
      className="share__header-mobile-banner"
      href={AFFILIATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Shop InkHub Tattoos — Dragon Tattoo banner"
    >
      <img
        src={BANNER_IMAGE}
        alt="InkHub Tattoos Dragon Tattoo banner"
      />
    </a>
  )
}

export default MobileBanner