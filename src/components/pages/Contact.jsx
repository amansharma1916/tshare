import React, { useState } from 'react'
import './pages.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real application, you would send this data to a backend
    alert('Thank you for your message! This is a demo - in production, this would send your message.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="page">
      <div className="page__container">
        <h1 className="page__title">Contact Us</h1>
        <div className="page__content">
          <section className="page__section">
            <h2>Get in Touch</h2>
            <p>
              Have a question, suggestion, or feedback? We'd love to hear from you! 
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </section>

          <section className="page__section">
            <h2>Contact Information</h2>
            <div className="contact__info">
              <div className="contact__info-item">
                <strong>Email:</strong>
                <p>amansharmayt19@gmail.com</p>
              </div>
              <div className="contact__info-item">
                <strong>Response Time:</strong>
                <p>We typically respond within 24-48 hours</p>
              </div>
            </div>
          </section>

          {/* <section className="page__section">
            <h2>Send Us a Message</h2>
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="form__group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="form__group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form__group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this about?"
                />
              </div>

              <div className="form__group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Your message..."
                ></textarea>
              </div>

              <button type="submit" className="contact__submit-btn">
                Send Message
              </button>
            </form>
          </section> */}

          <section className="page__section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq__item">
              <h3>How long are shared files stored?</h3>
              <p>
                Shared content is temporarily stored and automatically deleted after a short period. 
                We do not permanently store your files.
              </p>
            </div>
            <div className="faq__item">
              <h3>Do I need to create an account?</h3>
              <p>
                No! TShare is designed to be account-free. Just generate a code and share it with your recipient.
              </p>
            </div>
            <div className="faq__item">
              <h3>Is my data secure?</h3>
              <p>
                Yes, we implement appropriate security measures. All shared content is temporary and automatically deleted.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Contact