import React from 'react'
import './pages.css'

const Contact = () => {
  return (
    <div className="page">
      <div className="page__orb page__orb--1" />
      <div className="page__orb page__orb--2" />
      <div className="page__container">
        <div className="page__header">
          <div className="page__header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <span className="page__badge">
            <span className="page__badge-dot" />
            Contact · We reply within 24h
          </span>
          <h1 className="page__title">
            <span className="page__title-gradient">Contact</span> Us
          </h1>
          <p className="page__subtitle">
            Have a question, suggestion, or feedback? We would love to hear from you.
          </p>
        </div>
        <div className="page__content">
          <section className="page__section">
            <h2>Get in Touch</h2>
            <p>
              Have a question, suggestion, or feedback? We'd love to hear from you!
              Reach out below and we'll get back to you as soon as possible.
            </p>
          </section>

          <section className="page__section">
            <h2>Contact Information</h2>
            <div className="contact__info">
              <div className="contact__info-item">
                <strong>Email:</strong>
                <p>founder.tshare.in@gmail.com</p>
              </div>
              <div className="contact__info-item">
                <strong>Response Time:</strong>
                <p>We typically respond within 24-48 hours</p>
              </div>
              <div className="contact__info-item">
                <strong>Topics We Can Help With:</strong>
                <p>Premium codes &amp; renewal, lost passwords, expired or consumed shares, organization accounts, payment issues, and general feedback</p>
              </div>
            </div>
          </section>

          <section className="page__section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq__item">
              <h3>How long are shared files stored?</h3>
              <p>
                It depends on the validity you chose when sharing: <strong>No limit</strong> shares stay until an
                admin removes them, <strong>1-time</strong> shares are deleted after being opened once, and
                <strong> 6-hour</strong> shares are deleted 6 hours after creation. Expired or consumed shares
                are removed from our servers automatically.
              </p>
            </div>
            <div className="faq__item">
              <h3>Do I need to create an account?</h3>
              <p>
                No! TShare is designed to be account-free. Just generate a code and share it with your recipient.
                An optional username only personalizes your sharing history.
              </p>
            </div>
            <div className="faq__item">
              <h3>Is my data secure?</h3>
              <p>
                Yes. Files are stored in private object storage and served through short-lived signed URLs,
                passwords are hashed with bcrypt, and connections are encrypted with SSL/TLS.
              </p>
            </div>
            <div className="faq__item">
              <h3>My premium code expired. Can I get it back?</h3>
              <p>
                Yes — an expired code can be renewed for another 30 days through the premium dashboard,
                or repurchased by anyone once it returns to the marketplace.
              </p>
            </div>
            <div className="faq__item">
              <h3>My 1-time share says it was already opened. What happened?</h3>
              <p>
                1-time shares are deleted after the first open by design. If someone opened it before you,
                it is gone — create a new share if you need to send the content again.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Contact
