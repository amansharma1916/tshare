import React from 'react'

// SEO Component for adding structured data
export const SEO = ({ 
  title, 
  description, 
  canonical, 
  type = 'website',
  image,
  publishedTime,
  modifiedTime
}) => {
  const siteName = 'TShare'
  const siteUrl = 'https://tshare.in'
  const defaultImage = `${siteUrl}/s2.svg`

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TShare",
    "url": siteUrl,
    "logo": `${siteUrl}/s2.svg`,
    "description": "Fast, secure, and user-friendly file sharing platform. Share text, images, and files instantly using 4-digit codes.",
    "founder": {
      "@type": "Person",
      "name": "Aman Sharma"
    },
    "sameAs": [
      "https://tshare.in"
    ]
  }

  // WebSite Schema with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      }
    ]
  }

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </>
  )
}

export default SEO