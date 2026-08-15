import React from 'react'
import './pages.css'

const PrivacyPolicy = () => {
  return (
    <div className="page">
      <div className="page__orb page__orb--1" />
      <div className="page__orb page__orb--2" />
      <div className="page__container">
        <div className="page__header">
          <div className="page__header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="page__badge">
            <span className="page__badge-dot" />
            Privacy · You control what stays
          </span>
          <h1 className="page__title">
            <span className="page__title-gradient">Privacy</span> Policy
          </h1>
          <p className="page__subtitle">
            We respect your privacy and are committed to protecting your personal data.
          </p>
        </div>
        <div className="page__content">
          <p className="page__last-updated">Last updated: August 2026</p>

          <section className="page__section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to TShare. We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains what information we collect, why we collect it, and how long it stays
              on our servers.
            </p>
          </section>

          <section className="page__section">
            <h2>2. Information We Collect</h2>
            <p>
              We collect the minimum information necessary to provide our services:
            </p>
            <ul>
              <li>Content you choose to share (text, images, files)</li>
              <li>An optional username you set for personalizing your sharing history</li>
              <li>Premium account credentials (username and hashed password) when you purchase a premium code</li>
              <li>Payment information processed securely through Razorpay (we do not store complete payment details)</li>
              <li>Premium code ownership, display preferences and password-protection settings</li>
              <li>Organization details (name, email, password) when you register an organization account</li>
              <li>Basic usage statistics to improve our service</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>3. How We Use Your Information</h2>
            <p>
              We use the collected information solely to provide and improve our sharing service.
              We do not sell your data and do not share it with third parties for marketing.
            </p>
            <ul>
              <li>To provide instant sharing with unique 4-digit codes</li>
              <li>To enforce the validity you chose (no limit, 1-time, or 6 hours)</li>
              <li>To manage premium code ownership, renewal and dashboard access</li>
              <li>To process payments securely through Razorpay</li>
              <li>To enable password-protected content for premium users</li>
              <li>To run organization accounts (public code, QR and received submissions)</li>
              <li>To improve our platform based on usage patterns</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>4. Data Retention</h2>
            <p>
              How long your shared content stays on our servers depends on the validity you choose at share time:
            </p>
            <ul>
              <li><strong>No limit (default):</strong> Shared content stays until an admin removes it. Anyone with the code can keep opening it.</li>
              <li><strong>1-time share:</strong> The content is automatically deleted from our database and storage after it has been opened once.</li>
              <li><strong>6-hour share:</strong> The content is automatically deleted 6 hours after it was created, and stops being accessible immediately.</li>
              <li><strong>Premium code content:</strong> Retained for 30 days from purchase. Renewing extends it by another 30 days; an expired code is deleted from the marketplace pool and can be repurchased.</li>
              <li><strong>Premium account credentials:</strong> Retained until you request deletion.</li>
              <li><strong>Payment records:</strong> Retained for accounting and legal compliance purposes.</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>5. Security</h2>
            <p>
              We implement appropriate security measures to protect your data. Passwords are hashed using bcrypt.
              Payment processing is handled securely through Razorpay. However, no method of transmission
              over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
            <ul>
              <li>Passwords are hashed using bcrypt (10 rounds) before storage</li>
              <li>Payment processing is handled by a secure third-party processor (Razorpay)</li>
              <li>SSL/TLS encryption for all data transmissions</li>
              <li>Files are stored in private object storage and only served through short-lived signed URLs</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>6. Your Rights</h2>
            <p>
              You have the right to access, correct, or request deletion of your personal data.
              Since no account is required for basic sharing, most content is only present because you chose to share it.
            </p>
            <ul>
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your premium account and associated data</li>
              <li>Opt out of premium services at any time</li>
              <li>Request information about how your data is processed</li>
            </ul>
            <p>
              For premium users, you can request account deletion by contacting us at founder.tshare.in@gmail.com.
            </p>
          </section>

          <section className="page__section">
            <h2>7. Premium Services</h2>
            <p>
              Our premium service includes custom codes, password protection, a content dashboard and renewal.
              Information collected for premium services includes:
            </p>
            <ul>
              <li>Account credentials for premium dashboard access</li>
              <li>Payment information processed through Razorpay</li>
              <li>Premium code ownership and expiry records</li>
              <li>Display name preferences and public visibility settings</li>
              <li>Password protection settings (password hashes, not plain text)</li>
            </ul>
            <p>
              Premium users can manage their data through the premium dashboard or by contacting us.
            </p>
          </section>

          <section className="page__section">
            <h2>8. Organizations</h2>
            <p>
              When you register an organization, we store your organization name, contact email, hashed password,
              public code and QR. Content submitted by customers to your organization is stored under the same
              retention rules described in section 4, and can be deleted by you from the organization dashboard.
            </p>
          </section>

          <section className="page__section">
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our Contact page
              or email us at founder.tshare.in@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
