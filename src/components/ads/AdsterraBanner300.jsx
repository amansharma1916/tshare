import './AdsterraBanner300.css';

// Adsterra 300x250 iframe banner.
//
// The provider's snippet relies on a global `atOptions` + document.write-style
// insertion that must run during page parse — injecting it dynamically from
// React risks wiping the document. So the snippet lives verbatim in
// /ads/banner-300x250.html (public/) and this component embeds it through a
// fixed-size iframe: fully isolated from React, no global conflicts, reloads
// naturally on every mount, and safe to place multiple times on a page.
const AdsterraBanner300 = ({ className = '' }) => (
  <aside className={`adsterra-300 ${className}`.trim()}>
    <span className="adsterra-300__label">Advertisement</span>
    <iframe
      className="adsterra-300__frame"
      src="/ads/banner-300x250.html"
      title="Advertisement"
      width="300"
      height="250"
      scrolling="no"
      loading="lazy"
    />
  </aside>
);

export default AdsterraBanner300;