import React from 'react'
import './pages.css'

const PrivacyPolicy = () => {
  return (
    <div className="page">
      <div className="page__container">
        <h1 className="page__title">Privacy Policy</h1>
        <div className="page__content">
          <p className="page__last-updated">Last updated: June 2025</p>

          <section className="page__section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to TShare. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website 
              and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section className="page__section">
            <h2>2. Information We Collect</h2>
            <p>
              We collect minimal information necessary to provide our services:
            </p>
            <ul>
              <li>Content you choose to share (text, images, files)</li>
              <li>Temporary session data for sharing purposes</li>
              <li>Basic usage analytics to improve our service</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>3. How We Use Your Information</h2>
            <p>
              We use the collected information solely to provide and improve our file sharing service. 
              We do not use your data for marketing purposes or share it with third parties.
            </p>
          </section>

          <section className="page__section">
            <h2>4. Data Retention</h2>
            <p>
              Shared content is temporarily stored and automatically deleted after a short period. 
              We do not permanently store your shared files or personal information.
            </p>
          </section>

          <section className="page__section">
            <h2>5. Security</h2>
            <p>
              We implement appropriate security measures to protect your data. However, no method of transmission 
              over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="page__section">
            <h2>6. Your Rights</h2>
            <p>
              You have the right to access, correct, or request deletion of your personal data. 
              Since we don't require account creation, most data is automatically deleted after use.
            </p>
          </section>

          <section className="page__section">
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our Contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy