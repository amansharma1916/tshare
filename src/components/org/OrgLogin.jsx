import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orgEndpoints } from '../../api/orgEndpoints';
import { setOrgAuth } from './orgAuth';
import './OrgLayout.css';

const OrgLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(orgEndpoints.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      setOrgAuth({ token: data.token, orgCode: data.org.orgCode, name: data.org.name });
      navigate('/org/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="org-shell__container">
      <div className="org-card" style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
        <h2 className="org-card__title">Organization login</h2>
        <p className="org-card__desc">Sign in to review what your customers have sent you.</p>

        {error && <div className="org-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="org-field">
            <label className="org-field__label" htmlFor="org-login-email">Email</label>
            <input
              id="org-login-email"
              className="org-field__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              required
            />
          </div>

          <div className="org-field">
            <label className="org-field__label" htmlFor="org-login-password">Password</label>
            <input
              id="org-login-password"
              className="org-field__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>

          <button className="org-btn" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '1.1rem', fontSize: 13.5, color: 'var(--text-tertiary)' }}>
          New business? <Link to="/org/register" style={{ color: 'var(--theme-primary)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default OrgLogin;