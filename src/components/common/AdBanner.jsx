import { useEffect, useRef } from 'react'
import './Ads.css'

/* Generic Adsterra iframe banner.
   Uses atOptions + invoke.js pattern, injected dynamically for SPA safety. */
function AdBanner({ adKey, width, height, className = '', label = 'Advertisement' }) {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container || !adKey) return undefined

    container.innerHTML = ''

    const labelEl = document.createElement('span')
    labelEl.className = 'adslot__label'
    labelEl.textContent = label
    container.appendChild(labelEl)

    const holder = document.createElement('div')
    holder.className = 'adslot__body'
    holder.style.minWidth = `${width}px`
    holder.style.minHeight = `${height}px`
    container.appendChild(holder)

    try {
      const configScript = document.createElement('script')
      configScript.type = 'text/javascript'
      configScript.text = `atOptions = {'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};`
      holder.appendChild(configScript)

      const invokeScript = document.createElement('script')
      invokeScript.type = 'text/javascript'
      invokeScript.src = `https://www.highrevenueformat.com/${adKey}/invoke.js`
      holder.appendChild(invokeScript)
    } catch {
      // adblock or CSP — leave reserved space collapsed
    }

    return () => {
      container.innerHTML = ''
    }
  }, [adKey, width, height, label])

  return <div ref={ref} className={`adslot ${className}`} aria-label={label} role="complementary" />
}

export default AdBanner
