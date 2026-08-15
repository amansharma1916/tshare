import { useEffect } from 'react'
import { getSeoForPath, SITE_URL, SITE_IMAGE, BRAND } from './seoConfig'

// Set or create a <meta> tag by name/property.
const setMeta = (attr, key, content) => {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Set or create a canonical <link>.
const setCanonical = (href) => {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', SITE_URL + href)
}

// Keep a single JSON-LD script, replaced on route change.
const setJsonLd = (jsonLd) => {
  let el = document.getElementById('seo-jsonld')
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = 'seo-jsonld'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(jsonLd)
}

const buildJsonLd = (entry) => {
  const base = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    url: SITE_URL,
    slogan: 'One 4-digit key. Anything inside.',
    description: entry.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/receive?code={code}`,
      'query-input': 'required name=code',
    },
  }
  return base
}

// Applies title + meta + canonical + JSON-LD for the current route.
export const useSeo = (pathname) => {
  useEffect(() => {
    const entry = getSeoForPath(pathname)

    document.title = entry.title

    setMeta('name', 'description', entry.description)
    setMeta('name', 'keywords', entry.keywords)
    setMeta('name', 'robots', entry.noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('name', 'googlebot', entry.noindex ? 'noindex, nofollow' : 'index, follow')

    setMeta('property', 'og:title', entry.title)
    setMeta('property', 'og:description', entry.description)
    setMeta('property', 'og:url', SITE_URL + (entry.canonical || pathname))
    setMeta('property', 'og:image', SITE_IMAGE)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', BRAND)

    setMeta('name', 'twitter:card', 'summary')
    setMeta('name', 'twitter:title', entry.title)
    setMeta('name', 'twitter:description', entry.description)
    setMeta('name', 'twitter:image', SITE_IMAGE)

    setCanonical(entry.canonical || pathname)
    setJsonLd(buildJsonLd(entry))
  }, [pathname])
}

// Component wrapper for use in the router.
export const SeoManager = ({ pathname }) => {
  useSeo(pathname)
  return null
}
