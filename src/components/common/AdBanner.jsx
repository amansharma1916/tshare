import { useEffect, useRef } from 'react'
import './Ads.css'

/* Generic Adsterra iframe banner — isolated per-slot via iframe srcdoc.
   Each banner gets its own window.atOptions, so multiple banners on the
   same page never overwrite each other (fixes empty slots). */
function AdBanner({ adKey, width, height, className = '', label = 'Advertisement' }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !adKey) return undefined

    const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent}body{display:flex;justify-content:center;align-items:flex-start}</style></head><body><script type="text/javascript">atOptions={'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};<\/script><script type="text/javascript" src="https://www.highrevenueformat.com/${adKey}/invoke.js"><\/script></body></html>`

    try {
      const doc = iframe.contentDocument
      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
      }
    } catch {
      // adblock or CSP — leave reserved space
    }

    return () => {
      try {
        const doc = iframe.contentDocument
        if (doc) {
          doc.open()
          doc.write('<!doctype html><html><body></body></html>')
          doc.close()
        }
      } catch {
        /* noop */
      }
    }
  }, [adKey, width, height])

  return (
    <div className={`adslot ${className}`} aria-label={label} role="complementary">
      <span className="adslot__label">{label}</span>
      <div className="adslot__body" style={{ minWidth: width, minHeight: height }}>
        <iframe
          ref={iframeRef}
          title={label}
          width={width}
          height={height}
          scrolling="no"
          frameBorder="0"
          style={{ border: 0, maxWidth: '100%' }}
        />
      </div>
    </div>
  )
}

export default AdBanner
