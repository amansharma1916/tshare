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
              <li>Premium account credentials (username and hashed password) when you purchase a premium code</li>
              <li>Payment information processed securely through Razorpay (we do not store complete payment details)</li>
              <li>Premium code ownership and display preferences</li>
              <li>Basic usage analytics to improve our service</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>3. How We Use Your Information</h2>
            <p>
              We use the collected information solely to provide and improve our file sharing service. 
              We do not use your data for marketing purposes or share it with third parties.
            </p>
            <ul>
              <li>To provide instant file sharing services with unique codes</li>
              <li>To manage premium code ownership and dashboard access</li>
              <li>To process payments securely through Razorpay</li>
              <li>To enable password-protected content sharing for premium users</li>
              <li>To improve our platform based on usage patterns</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>4. Data Retention</h2>
            <p>
              Shared content is temporarily stored and automatically deleted after a short period. 
              Premium code content remains active for the duration of your premium membership (30 days from purchase).
            </p>
            <ul>
              <li>Regular shared content: Automatically deleted after a short period</li>
              <li>Premium code content: Retained for 30 days from purchase, renewable upon request</li>
              <li>Premium account credentials: Retained until you request deletion</li>
              <li>Payment records: Retained for accounting and legal compliance purposes</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>5. Security</h2>
            <p>
              We implement appropriate security measures to protect your data. Premium account passwords are hashed using bcrypt. 
              Payment processing is handled securely through Razorpay. However, no method of transmission 
              over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
            <ul>
              <li>Passwords are hashed using bcrypt (10 rounds) before storage</li>
              <li>Payment processing is handled by secure third-party payment processors</li>
              <li>SSL/TLS encryption for all data transmissions</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>6. Your Rights</h2>
            <p>
              You have the right to access, correct, or request deletion of your personal data. 
              Since we don't require account creation for basic sharing, most data is automatically deleted after use.
            </p>
            <ul>
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your premium account and associated data</li>
              <li>Opt-out of premium services at any time</li>
              <li>Request information about how your data is processed</li>
            </ul>
            <p>
              For premium users, you can request account deletion by contacting us at founder.tshare.in@gmail.com.
            </p>
          </section>

          <section className="page__section">
            <h2>7. Premium Services</h2>
            <p>
              Our premium service includes additional features such as custom codes, password protection, 
              and content management. Information collected for premium services includes:
            </p>
            <ul>
              <li>Account credentials for premium dashboard access</li>
              <li>Payment information processed through Razorpay</li>
              <li>Premium code ownership records</li>
              <li>Display name preferences and public visibility settings</li>
              <li>Password protection settings (password hashes, not plain text)</li>
            </ul>
            <p>
              Premium users can manage their data through the premium dashboard or by contacting us.
            </p>
          </section>

          <section className="page__section">
            <h2>8. Contact Us</h2>
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