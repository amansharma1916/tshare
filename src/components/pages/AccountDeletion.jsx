import React, { useState } from 'react'
import './pages.css'
import './AccountDeletion.css'
import { endpoints } from '../../api/api'

// Public request form; Play Store compliant. Users request account deletion by
// entering their username. The request is reviewed by an admin in the panel.
const AccountDeletion = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmed = username.trim()
    if (!trimmed) {
      setError('Please enter your username.')
      return
    }
    if (!confirm) {
      setError('Please confirm that you understand what will be deleted.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(endpoints.accountDeleteRequest, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed, email: email.trim(), reason: reason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to submit your request. Please try again.')
        setLoading(false)
        return
      }
      setSuccess(data.message || 'Deletion request received.')
      setUsername('')
      setEmail('')
      setReason('')
      setConfirm(false)
    } catch (err) {
      console.error(err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page__orb page__orb--1" />
      <div className="page__orb page__orb--2" />
      <div className="page__container">
        <div className="page__header">
          <div className="page__header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <span className="page__badge">
            <span className="page__badge-dot" />
            Account Deletion · Reviewed by our team
          </span>
          <h1 className="page__title">
            <span className="page__title-gradient">Delete</span> Your Account
          </h1>
          <p className="page__subtitle">
            Request permanent deletion of your TShare account and the data associated with it.
          </p>
        </div>

        <div className="page__content">
          {/* Play Store / Data-deletion disclosure */}
          <section className="page__section">
            <h2>What happens when you delete your account</h2>
            <p>
              When you submit a deletion request, our team reviews it and permanently removes
              your account and the data linked to it. Deletion cannot be undone.
            </p>
            <ul>
              <li><strong>Account details</strong> — your username, login credentials and premium membership status are permanently deleted.</li>
              <li><strong>Share &amp; receive history</strong> — your personal sharing history and activity records are deleted.</li>
              <li><strong>Premium codes you own</strong> — your premium codes and the files/images stored under them are removed from our storage.</li>
              <li><strong>Payment records</strong> — payment records tied to your account are deleted, except where we are legally required to retain financial records for accounting or tax compliance.</li>
            </ul>
            <p>
              <strong>What is <em>not</em> deleted:</strong> Public share links, codes, or content that
              other people have already received or that were shared anonymously without your account.
              Those are separate from your account and are managed by their own expiry settings.
            </p>
          </section>

          <section className="page__section">
            <h2>How long does it take?</h2>
            <p>
              Requests are reviewed and processed by our team, typically within <strong>5 business days</strong>.
              Once processed, your account is permanently deleted.
            </p>
          </section>

          {/* Request form */}
          <section className="page__section">
            <h2>Request deletion</h2>
            {error && (
              <div className="ad-form__error" role="alert">{error}</div>
            )}
            {success && (
              <div className="ad-form__success" role="status">{success}</div>
            )}

            <form className="ad-form" onSubmit={handleSubmit}>
              <label className="ad-form__label" htmlFor="ad-username">
                Your username <span className="ad-form__req">*</span>
              </label>
              <input
                id="ad-username"
                className="ad-form__input"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); setSuccess('') }}
                placeholder="Enter your username"
                autoComplete="off"
              />

              <label className="ad-form__label" htmlFor="ad-email">
                Contact email (optional)
              </label>
              <input
                id="ad-email"
                className="ad-form__input"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); setSuccess('') }}
                placeholder="We may use this to confirm your request"
              />

              <label className="ad-form__label" htmlFor="ad-reason">
                Reason (optional)
              </label>
              <textarea
                id="ad-reason"
                className="ad-form__input ad-form__textarea"
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(''); setSuccess('') }}
                placeholder="Tell us why you are leaving (optional)"
                rows={3}
              />

              <label className="ad-form__check">
                <input
                  type="checkbox"
                  checked={confirm}
                  onChange={(e) => { setConfirm(e.target.checked); setError(''); setSuccess('') }}
                />
                <span>
                  I understand that this will permanently delete my account, my history, my
                  premium codes and associated files, and that this action cannot be undone.
                </span>
              </label>

              <button type="submit" className="btn btn-danger ad-form__submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Request Account Deletion'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AccountDeletion