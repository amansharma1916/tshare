import React from 'react'
import './pages.css'

const TermsOfService = () => {
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
            Terms · Fair usage policy
          </span>
          <h1 className="page__title">
            <span className="page__title-gradient">Terms</span> of Service
          </h1>
          <p className="page__subtitle">
            Please read these terms carefully before using TShare.
          </p>
        </div>
        <div className="page__content">
          <p className="page__last-updated">Last updated: August 2026</p>

          <section className="page__section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using TShare, you accept and agree to be bound by the terms and provisions of this agreement.
              If you do not agree to these Terms of Service, please do not use our service.
            </p>
          </section>

          <section className="page__section">
            <h2>2. Service Description</h2>
            <p>
              TShare is a sharing service that lets you share text, images and files using unique 4-digit codes.
              Every share has a validity you choose at share time: <strong>No limit</strong> (stays until removed),
              <strong> 1-time</strong> (deleted after the first open), or <strong>6 hours</strong> (deleted after 6 hours).
              The service also includes public chat rooms, a premium tier (custom codes, password protection,
              content dashboard, renewal) and an organization module for receiving files and messages from customers.
              The service is provided "as is" without warranties of any kind.
            </p>
          </section>

          <section className="page__section">
            <h2>3. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Use the service only for lawful purposes</li>
              <li>Not share content that violates intellectual property rights</li>
              <li>Not share malicious, harmful, or illegal content</li>
              <li>Not attempt to abuse or exploit the service</li>
              <li>Understand that 1-time shares are deleted after the first open and cannot be recovered</li>
              <li>Maintain the confidentiality of your premium account credentials</li>
              <li>Not share password-protected content without authorization</li>
              <li>Make timely payments for premium code purchases</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>4. Content Ownership</h2>
            <p>
              You retain full ownership of any content you share through our service. We do not claim any rights
              to your content. However, by using our service, you grant us permission to temporarily store and
              transmit your content for the purpose of providing the sharing service, and to delete it according
              to the validity you chose (1-time or 6-hour shares are removed automatically).
            </p>
          </section>

          <section className="page__section">
            <h2>5. Limitation of Liability</h2>
            <p>
              TShare shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
              or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data,
              use, goodwill, or other intangible losses resulting from your use of our service. This includes the
              automatic deletion of 1-time and 6-hour shares once their validity ends.
            </p>
          </section>

          <section className="page__section">
            <h2>6. Service Availability</h2>
            <p>
              We strive to maintain service availability but do not guarantee uninterrupted access.
              We may modify, suspend, or discontinue the service at any time without notice.
            </p>
            <p>
              Premium code purchases are final. Refunds may be issued at our discretion for service issues or
              technical problems. Premium codes are valid for 30 days from purchase and can be renewed.
            </p>
          </section>

          <section className="page__section">
            <h2>7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes
              by posting the new Terms of Service on this page. Your continued use of the service after such
              modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="page__section">
            <h2>8. Premium Services Terms</h2>
            <p>
              Premium code purchases are subject to additional terms:
            </p>
            <ul>
              <li>Premium codes are valid for 30 days from the date of purchase</li>
              <li>Renewing a code extends its validity by another 30 days from the current expiry date</li>
              <li>When a code expires, it returns to the marketplace pool and can be repurchased by anyone, including the previous owner</li>
              <li>Code ownership is non-transferable while active and tied to the purchaser's account</li>
              <li>Password protection is optional, and you are responsible for remembering your password — lost passwords on protected codes cannot be recovered by us</li>
              <li>Premium features are provided on a best-effort basis</li>
              <li>Payment processing is handled by third-party payment processors (Razorpay)</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>9. Organization Accounts</h2>
            <p>
              Organizations registered on TShare receive a public code and QR for collecting files and messages
              from customers. The organization is responsible for reviewing received submissions, and can delete
              them from its dashboard. Submitted content follows the retention rules described in our Privacy Policy.
            </p>
          </section>

          <section className="page__section">
            <h2>10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through our Contact page
              or email us at founder.tshare.in@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService
