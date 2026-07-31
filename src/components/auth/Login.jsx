import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Login.css';
import { endpoints } from '../../api/api';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(endpoints.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('tshare_username', username.trim());
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--layout-bg)',
      padding: '20px',
    }}>
      <motion.div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--sidebar-bg)',
          border: '1px solid var(--sidebar-border)',
          borderRadius: '12px',
          padding: '32px',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--theme-primary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Sign in to your TShare account
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--layout-bg)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--theme-primary)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--layout-bg)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--theme-primary)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)' }}
            />
          </div>

          {error && (
            <motion.div
              style={{
                padding: '8px 12px',
                background: 'var(--theme-danger-bg)',
                color: 'var(--theme-danger-text)',
                borderRadius: '6px',
                fontSize: '13px',
                textAlign: 'center',
              }}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              justifyContent: 'center',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--theme-primary-light)', textDecoration: 'none' }}>
              Register
            </Link>
          </p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: 'var(--text-subtle)', textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;