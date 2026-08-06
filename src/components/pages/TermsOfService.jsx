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
              The service includes free basic sharing and premium features including custom codes, password protection, and content management.
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
            <p>
              Premium code purchases are final. Refunds may be issued at our discretion for service issues or technical problems.
              Premium codes are valid for 30 days from purchase and can be renewed.
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
              <li>Code ownership is non-transferable and tied to the purchaser's account</li>
              <li>Password protection is optional and the user is responsible for remembering their password</li>
              <li>We are not liable if a password-protected code's password is lost or forgotten</li>
              <li>Premium features are provided on a best-effort basis</li>
              <li>Payment processing is handled by third-party payment processors (Razorpay)</li>
            </ul>
          </section>

          <section className="page__section">
            <h2>9. Contact Information</h2>
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