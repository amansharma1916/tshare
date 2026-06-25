import React from 'react'
import './pages.css'

const About = () => {
  return (
    <div className="page">
      <div className="page__container">
        <h1 className="page__title">About TShare</h1>
        <div className="page__content">
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
            <h2>Key Features</h2>
            <ul>
              <li><strong>Instant Sharing:</strong> Share content in seconds with a simple 4-digit code</li>
              <li><strong>No Registration:</strong> No accounts or sign-ups required</li>
              <li><strong>Multiple Formats:</strong> Support for text, images, and various file types</li>
              <li><strong>Public Rooms:</strong> Join or create public chat rooms for group sharing</li>
              <li><strong>Secure:</strong> Temporary storage with automatic deletion for privacy</li>
            </ul>
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
              TShare is built using modern web technologies including React, Node.js, and Express. 
              We focus on performance, reliability, and scalability to ensure the best possible experience for our users.
            </p>
          </section>

          <section className="page__section">
            <h2>Contact Us</h2>
            <p>
              Have questions, suggestions, or feedback? We'd love to hear from you! 
              Please visit our <a href="/contact" className="page__link">Contact page</a> to get in touch.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default About