import React from 'react'
import './pages.css'

const TermsOfService = () => {
  return (
    <div className="page">
      <div className="page__container">
        <h1 className="page__title">Terms of Service</h1>
        <div className="page__content">
          <p className="page__last-updated">Last updated: June 2025</p>

          <section className="page__section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using TShare, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to these Terms of Service, please do not use our service.
            </p>
          </section>

          <section className="page__section">
            <h2>2. Service Description</h2>
            <p>
              TShare provides a temporary file and text sharing service that allows users to share content using unique codes. 
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
              <li>Respect the temporary nature of shared content</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>4. Content Ownership</h2>
            <p>
              You retain full ownership of any content you share through our service. We do not claim any rights 
              to your content. However, by using our service, you grant us permission to temporarily store and 
              transmit your content for the purpose of providing the sharing service.
            </p>
          </section>

          <section className="page__section">
            <h2>5. Limitation of Liability</h2>
            <p>
              TShare shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
              or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, 
              use, goodwill, or other intangible losses resulting from your use of our service.
            </p>
          </section>

          <section className="page__section">
            <h2>6. Service Availability</h2>
            <p>
              We strive to maintain service availability but do not guarantee uninterrupted access. 
              We may modify, suspend, or discontinue the service at any time without notice.
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
            <h2>8. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through our Contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService