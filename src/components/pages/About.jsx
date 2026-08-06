import React from 'react'
import { Link } from 'react-router-dom'
import './pages.css'

const About = () => {
  // JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "About TShare - Instant File Sharing Platform",
    "description": "Learn about TShare, a fast and secure file sharing platform created by Aman Sharma. Share text, images, and files instantly using 4-digit codes.",
    "mainEntity": {
      "@type": "Person",
      "name": "Aman Sharma",
      "description": "Creator and developer of TShare"
    }
  };

  return (
    <div className="page">
      <div className="page__container">
        <header>
          <h1 className="page__title">About TShare - Instant File Sharing Platform</h1>
          <p className="page__subtitle">
            Fast, secure, and user-friendly content sharing without registration
          </p>
        </header>
        <div className="page__content">
          <section className="page__section">
            <h2>About the Owner</h2>
            <p>
              TShare was created by <strong>Aman Sharma</strong>, a passionate full-stack developer who believes in making technology accessible to everyone. 
              With a vision to simplify file sharing and remove barriers like complex registrations and lengthy processes, 
              Aman built TShare to provide instant, secure, and user-friendly content sharing for everyone.
            </p>
            <p>
              The platform reflects a commitment to simplicity, privacy, and exceptional user experience. 
              Every feature is designed with the user in mind, ensuring that sharing content is as easy as possible.
            </p>
          </section>

          <section className="page__section">
            <h2>Our Mission</h2>
            <p>
              TShare was created with a simple mission: to make file sharing as effortless as possible. 
              We believe that sharing files shouldn't require accounts, complex setups, or lengthy processes. 
              Our goal is to provide a fast, secure, and user-friendly platform for instant content sharing.
            </p>
          </section>

          <section className="page__section">
            <h2>What We Offer</h2>
            <p>
              TShare enables you to share text, images, and files instantly using a unique 4-digit code. 
              No sign-up required, no accounts to manage, and no complicated interfaces. Just generate a code, 
              share it with your recipient, and they can access your content immediately.
            </p>
          </section>

          <section className="page__section">
            <h2>Complete Feature List</h2>
            <p>
              TShare offers a comprehensive set of features designed to make content sharing fast, secure, and convenient. 
              Here's everything you can do with TShare:
            </p>
            <ul>
              <li><strong>Instant Text Sharing:</strong> Share text content instantly with a unique 4-digit code. Perfect for quick notes, messages, or any text-based content.</li>
              
              <li><strong>Image Sharing:</strong> Upload and share images securely. Recipients can view images immediately using the share code.</li>
              
              <li><strong>File Sharing:</strong> Support for multiple file formats including documents, PDFs, videos, audio files, and more. Share any file type with ease.</li>
              
              <li><strong>4-Digit Code System:</strong> Simple and memorable 4-digit codes for easy sharing. No complex URLs or long links to remember.</li>
              
              <li><strong>Public Chat Rooms:</strong> Create or join public chat rooms using room codes. Perfect for group discussions, team collaboration, or casual conversations.</li>
              
              <li><strong>Real-time Messaging:</strong> Instant message delivery with WebSocket technology. See messages appear in real-time without refreshing.</li>
              
              <li><strong>Emoji Support:</strong> Express yourself with a built-in emoji picker. Add fun and personality to your messages.</li>
              
              <li><strong>Copy Message:</strong> One-click copy button on every message for quick copying of text content.</li>
              
              <li><strong>User Presence:</strong> See who's online in chat rooms with real-time user count and presence indicators.</li>
              
              <li><strong>Typing Indicators:</strong> Know when someone is typing a message with animated typing indicators.</li>
              
              <li><strong>Secure and Private:</strong> Temporary storage with automatic deletion. Your data is not stored permanently for privacy.</li>
              
              <li><strong>No Registration Required:</strong> Start sharing immediately without creating accounts. Optional username for personalization.</li>
              
              <li><strong>Fully Responsive:</strong> Works seamlessly on desktop, tablet, and mobile devices. Share on the go.</li>
              
              <li><strong>Modern UI/UX:</strong> Beautiful, intuitive interface with smooth animations and glassmorphism design.</li>
              
              <li><strong>Real-time Notifications:</strong> Get notified when users join or leave rooms with system messages.</li>
              
              <li><strong>Premium Codes:</strong> Purchase exclusive premium codes with golden branding, custom display names, and advanced features.</li>
              
              <li><strong>Password Protection:</strong> Secure your premium content with optional password protection. Recipients must enter the password to access protected content.</li>
              
              <li><strong>Content Management Dashboard:</strong> Premium users get a dedicated dashboard to manage their codes, update content, and track activity.</li>
              
              <li><strong>Public Marquee:</strong> Premium users can choose to display their codes and display names in a public showcase.</li>
              
              <li><strong>6-Digit Codes:</strong> Extended code length option for even more unique and memorable codes.</li>
              
              <li><strong>Admin Panel:</strong> Comprehensive admin dashboard to manage all shared content, users, and public rooms.</li>
              
              <li><strong>Auto-reconnection:</strong> Smart socket reconnection handling ensures you stay connected even with network issues.</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>How It Works</h2>
            <p>
              Using TShare is simple and straightforward. Follow these three easy steps to start sharing:
            </p>
            <div className="how-it-works">
              <div className="step">
                <div className="step__number">1</div>
                <h3>Create</h3>
                <p>Choose what you want to share - text, image, or file. Upload or type your content.</p>
              </div>
              <div className="step">
                <div className="step__number">2</div>
                <h3>Share</h3>
                <p>Get a unique 4-digit code. Share it with your recipient via any messaging platform.</p>
              </div>
              <div className="step">
                <div className="step__number">3</div>
                <h3>Access</h3>
                <p>Recipient enters the code on TShare and instantly accesses your shared content.</p>
              </div>
            </div>
          </section>

          <section className="page__section">
            <h2>Our Values</h2>
            <p>
              We prioritize simplicity, privacy, and user experience. We believe technology should make life easier, 
              not more complicated. That's why we've designed TShare to be intuitive, fast, and respectful of your privacy.
            </p>
          </section>

          <section className="page__section">
            <h2>Technology Stack</h2>
            <p>
              TShare is built using modern web technologies including React, Node.js, Express, and Socket.io for real-time communication. 
              We focus on performance, reliability, and scalability to ensure the best possible experience for our users.
            </p>
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
