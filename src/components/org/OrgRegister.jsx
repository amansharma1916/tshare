import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { orgEndpoints } from '../../api/orgEndpoints';
import './OrgLayout.css';

const OrgRegister = () => {
  const [form, setForm] = useState({ name: '', email: '', ownerName: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(orgEndpoints.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setSuccess(`Your organization is ready! Your code is ${data.org.orgCode}. Use it on your posters.`);
      setForm({ name: '', email: '', ownerName: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="org-shell__container">
      <div className="org-card" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <h2 className="org-card__title">Register your organization</h2>
        <p className="org-card__desc">
          Get a 4-character code + QR so your customers can send you text, images, and files.
        </p>

        {error && <div className="org-error">{error}</div>}
        {success && (
          <div className="org-success">
            {success} <Link to="/org/login" style={{ color: 'inherit', fontWeight: 700 }}>Login now →</Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="org-field">
            <label className="org-field__label" htmlFor="org-name">Business name</label>
            <input
              id="org-name"
              className="org-field__input"
              type="text"
              value={form.name}
              onChange={update('name')}
              placeholder="e.g. Sunrise Xerox"
              required
            />
          </div>

          <div className="org-field">
            <label className="org-field__label" htmlFor="org-email">Email</label>
            <input
              id="org-email"
              className="org-field__input"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="you@business.com"
              required
            />
          </div>

          <div className="org-field">
            <label className="org-field__label" htmlFor="org-owner">Owner name <span style={{ opacity: 0.6, fontWeight: 400 }}>(optional)</span></label>
            <input
              id="org-owner"
              className="org-field__input"
              type="text"
              value={form.ownerName}
              onChange={update('ownerName')}
              placeholder="Your name"
            />
          </div>

          <div className="org-field">
            <label className="org-field__label" htmlFor="org-password">Password</label>
            <input
              id="org-password"
              className="org-field__input"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <button className="org-btn" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating…' : 'Create organization'}
          </button>
        </form>

        <p style={{ marginTop: '1.1rem', fontSize: 13.5, color: 'var(--text-tertiary)' }}>
          Already registered? <Link to="/org/login" style={{ color: 'var(--theme-primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default OrgRegister;