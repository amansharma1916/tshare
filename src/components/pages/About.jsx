import React from 'react'
import { Link } from 'react-router-dom'
import './pages.css'

const About = () => {
  // JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "About TShare - One 4-character key. Anything inside.",
    "description": "Learn about TShare, the sharing platform built on one idea: one 4-character key, anything inside. Share text, images, and files instantly using 4-character codes.",
    "mainEntity": {
      "@type": "Person",
      "name": "Aman Sharma",
      "description": "Creator and developer of TShare"
    }
  };

  return (
    <div className="page">
      <div className="page__orb page__orb--1" />
      <div className="page__orb page__orb--2" />
      <div className="page__container">
        <div className="page__header">
          <div className="page__header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <span className="page__badge">
            <span className="page__badge-dot" />
            About · One 4-character key · Anything inside
          </span>
          <h1 className="page__title">
            About <span className="page__title-gradient">TShare</span>
          </h1>
          <p className="page__subtitle">
            One 4-character key. Anything inside. Sharing without registration, without friction.
          </p>
        </div>
        <div className="page__content">
          <section className="page__section">
            <h2>About the Owner</h2>
            <p>
              TShare was created by <strong>Aman Sharma</strong>, a full-stack developer who believes sharing
              should be instant. No accounts, no setup, no friction — just a 4-character key that opens anything.
              With that idea, Aman built TShare to make sharing text, images and files as easy as sending a message.
            </p>
            <p>
              The platform reflects a commitment to simplicity, privacy, and a clean user experience.
              Every feature exists to answer one question: what is the fastest way to get content from A to B?
            </p>
          </section>

          <section className="page__section">
            <h2>Our Mission</h2>
            <p>
              One 4-character key. Anything inside. That is the whole idea behind TShare — every piece of content,
              from a password to a document, can be locked behind a short key that works on any device,
              with no registration required.
            </p>
          </section>

          <section className="page__section">
            <h2>What We Offer</h2>
            <p>
              TShare lets you share text, images, and files instantly using a 4-character code.
              No sign-up, no accounts to manage, no complicated interfaces — generate a code,
              share it with your recipient, and they can access your content immediately.
            </p>
          </section>

          <section className="page__section">
            <h2>Complete Feature List</h2>
            <p>
              Here's everything you can do with TShare today:
            </p>
            <ul>
              <li><strong>Instant Text Sharing:</strong> Share text content instantly with a unique 4-character code — notes, links, passwords, anything.</li>

              <li><strong>Image Sharing:</strong> Upload and share images (up to 5 MB). Recipients view them immediately with the share code.</li>

              <li><strong>File Sharing:</strong> Share common file formats up to 50 MB — PDFs, documents, spreadsheets, code files and more.</li>

              <li><strong>4-character Code System:</strong> Simple, memorable 4-character codes. No long URLs to remember or retype.</li>

              <li><strong>Validity Controls:</strong> Choose how long a share lives — No limit (default), viewable only once (1-time), or valid for 6 hours. Expired or consumed shares are removed from our servers automatically.</li>

              <li><strong>Public Chat Rooms:</strong> Join public chat rooms with a 4-digit room code. Real-time group conversations, no account needed.</li>

              <li><strong>Real-time Messaging:</strong> Instant message delivery with WebSocket technology — messages appear live without refreshing.</li>

              <li><strong>Emoji Support:</strong> Express yourself with a built-in emoji picker in chat rooms.</li>

              <li><strong>Copy Message:</strong> One-click copy button on every chat message.</li>

              <li><strong>User Presence & Typing Indicators:</strong> See who's online in a room and when someone is typing.</li>

              <li><strong>No Registration Required:</strong> Start sharing immediately. An optional username is only for personalizing your sharing history.</li>

              <li><strong>Premium Codes:</strong> Purchase exclusive premium codes with custom 4 or 6 character keys, display names, password protection and a content dashboard.</li>

              <li><strong>Password Protection:</strong> Protect premium content with a password — recipients must enter it to view.</li>

              <li><strong>Premium Dashboard:</strong> Manage your premium codes — update content, control visibility, protect with passwords, and renew before expiry.</li>

              <li><strong>Renewable Premium:</strong> Premium codes are valid for 30 days and can be renewed — renewing adds another 30 days, and an expired code can be repurchased.</li>

              <li><strong>Public Marquee:</strong> Premium users can show their codes and display names in a public showcase.</li>

              <li><strong>Organization Module:</strong> Businesses can register an organization, get a public code and QR, and let customers hand over files and messages without accounts.</li>

              <li><strong>Admin Panel:</strong> Full admin dashboard to manage shared content, users, public rooms, premium codes and site stats.</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>How It Works</h2>
            <p>
              Using TShare is simple. Follow these three steps:
            </p>
            <div className="how-it-works">
              <div className="step">
                <div className="step__number">1</div>
                <h3>Create</h3>
                <p>Choose what you want to share — text, image, or file. Optionally set a validity (1-time or 6 hours).</p>
              </div>
              <div className="step">
                <div className="step__number">2</div>
                <h3>Share</h3>
                <p>Get a unique 4-character code and share it anywhere — any messaging platform works.</p>
              </div>
              <div className="step">
                <div className="step__number">3</div>
                <h3>Access</h3>
                <p>The recipient enters the code on TShare and instantly sees your shared content.</p>
              </div>
            </div>
          </section>

          <section className="page__section">
            <h2>Our Values</h2>
            <p>
              We prioritize simplicity, privacy, and user experience. We believe technology should make life easier,
              not more complicated — which is why TShare has no sign-up wall and keeps sharing instant.
            </p>
          </section>

          <section className="page__section">
            <h2>Technology Stack</h2>
            <p>
              TShare is built on a modern stack: a React frontend with a Node.js + Express backend,
              Socket.io for real-time chat, MongoDB for data, Cloudflare R2 for file storage,
              Redis/Valkey for caching, and Razorpay for premium payments.
            </p>
            <b>Mobile App</b>
            <p>
              Tshare Android app is built using Flutter, providing a seamless mobile experience for sharing on the go.
              
            </p>
            <b> Developer - Saroj Jha</b>
          </section>

          <section className="page__section">
            <h2>Contact Us</h2>
            <p>
              Have questions, suggestions, or feedback? We'd love to hear from you!
              Please visit our <Link to="/contact" className="page__link">Contact page</Link> to get in touch.
            </p>
          </section>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </div>
  )
}

export default About
