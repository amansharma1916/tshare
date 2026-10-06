import { useEffect, useRef, useState } from 'react'
import AdBanner from './AdBanner.jsx'

const LEADERBOARD_KEYS = {
  desktop: { key: '21c06998d5c98c23cac4743419ad8b8b', width: 728, height: 90 },
  tablet: { key: '3f4d0ed7003059aafc68acc9d022532c', width: 468, height: 60 },
  mobile: { key: '7b238e1c90987395bf7c418beb5dc8fd', width: 320, height: 50 },
}

function pickSize() {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 520) return 'mobile'
  if (w < 780) return 'tablet'
  return 'desktop'
}

/* Responsive leaderboard: 728x90 desktop / 468x60 tablet / 320x50 mobile.
   Loads only ONE banner for current viewport — max fill, no hidden impressions. */
function LeaderboardAd({ className = '' }) {
  const [size, setSize] = useState(pickSize)

  useEffect(() => {
    let t = null
    const onResize = () => {
      clearTimeout(t)
      t = setTimeout(() => setSize(pickSize()), 200)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(t)
    }
  }, [])

  const cfg = LEADERBOARD_KEYS[size]

  return (
    <AdBanner
      adKey={cfg.key}
      width={cfg.width}
      height={cfg.height}
      className={`adslot--leaderboard ${className}`}
    />
  )
}

export default LeaderboardAd
