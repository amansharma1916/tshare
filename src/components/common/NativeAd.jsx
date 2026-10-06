import { useEffect, useRef } from 'react'
import './Ads.css'

const NATIVE_SRC = 'https://pl31067654.profitableratecpmnetwork.com/798e2ad51ed0e4acc4feeaf9ab04726c/invoke.js'
const NATIVE_CONTAINER_ID = 'container-798e2ad51ed0e4acc4feeaf9ab04726c'

/* Adsterra Native Banner 4:1 widget. Can sit in page body anywhere. */
function NativeAd({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return undefined
    container.innerHTML = ''

    const labelEl = document.createElement('span')
    labelEl.className = 'adslot__label'
    labelEl.textContent = 'Advertisement'
    container.appendChild(labelEl)

    const holder = document.createElement('div')
    holder.className = 'adslot__body adslot__body--native'
    const target = document.createElement('div')
    target.id = `${NATIVE_CONTAINER_ID}-${Math.random().toString(36).slice(2, 8)}`
    // Adsterra native looks for exact container id, so also keep canonical id on first mount
    target.setAttribute('data-native-container', NATIVE_CONTAINER_ID)
    holder.appendChild(target)
    container.appendChild(holder)

    // Canonical container expected by invoke.js
    const canonical = document.createElement('div')
    canonical.id = NATIVE_CONTAINER_ID
    holder.appendChild(canonical)

    const s = document.createElement('script')
    s.async = true
    s.setAttribute('data-cfasync', 'false')
    s.src = NATIVE_SRC
    holder.appendChild(s)

    return () => {
      container.innerHTML = ''
      const leaked = document.getElementById(NATIVE_CONTAINER_ID)
      if (leaked && holder.contains(leaked) === false) {
        // leave global container alone if reused elsewhere
      }
    }
  }, [])

  return <div ref={ref} className={`adslot adslot--native ${className}`} role="complementary" aria-label="Advertisement" />
}

export default NativeAd
