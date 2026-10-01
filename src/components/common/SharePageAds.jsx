import './SharePageAds.css'

const AFFILIATE_URL = 'https://influencers.inkhubtattoos.in/r/AMANSHARMAPJH'

const adContent = {
  left: {
    className: 'share-page-ad--left',
    image: '/events/inkhub-tattoos-left-ad.webp',
    alt: 'InkHub Tattoos offer',
    width: 469,
    height: 1149,
  },
  right: {
    className: 'share-page-ad--right',
    image: '/events/inkhub-tattoos-right-ad.webp',
    alt: 'InkHub Tattoos new arrivals',
    width: 471,
    height: 1149,
  },
}

function SharePageAds({ side }) {
  const ad = adContent[side]

  if (!ad) return null

  return (
    <aside className={`share-page-ad ${ad.className}`} aria-label="InkHub Tattoos advertisement">
      <span className="share-page-ad__label">Advertisement</span>
      <a
        className="share-page-ad__link"
        href={AFFILIATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Shop InkHub Tattoos"
      >
        <img
          src={ad.image}
          alt={ad.alt}
          className="share-page-ad__image"
          width={ad.width}
          height={ad.height}
          loading="lazy"
          decoding="async"
        />
      </a>
    </aside>
  )
}

export default SharePageAds