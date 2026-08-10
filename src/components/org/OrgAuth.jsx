import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { orgEndpoints } from '../../api/orgEndpoints';
import { setOrgAuth } from './orgAuth';
import './OrgAuth.css';

const ease = [0.16, 1, 0.3, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -40px 0px' },
  transition: { duration: 0.6, delay, ease },
});

const Icon = ({ name, size = 20 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'code':
      return (
        <svg {...common}>
          <path d="M4 17l6-6-6-6" />
          <path d="M12 19l6-6-6-6" />
        </svg>
      );
    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case 'file':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'send':
      return (
        <svg {...common}>
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22l-4-9-9-4z" />
        </svg>
      );
    case 'scan':
      return (
        <svg {...common}>
          <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...common}>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case 'barChart':
      return (
        <svg {...common}>
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      );
    case 'smartphone':
      return (
        <svg {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    default:
      return null;
  }
};

const AnimatedCounter = ({ value, duration = 1.6 }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -30px 0px' });

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
};

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div className="org-auth__feature-card" {...fadeUp(delay)}>
    <span className="org-auth__feature-icon">
      <Icon name={icon} size={20} />
    </span>
    <div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  </motion.div>
);

const OrgAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/org/login';
  const [activeTab, setActiveTab] = useState(isLogin ? 'login' : 'register');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regForm, setRegForm] = useState({ name: '', email: '', ownerName: '', password: '' });
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    setActiveTab(isLogin ? 'login' : 'register');
    setLoginError('');
    setRegError('');
  }, [isLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(orgEndpoints.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setOrgAuth({ token: data.token, orgCode: data.org.orgCode, name: data.org.name });
      navigate('/org/dashboard');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegLoading(true);
    try {
      const res = await fetch(orgEndpoints.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setRegSuccess(`Your organization is ready! Your code is ${data.org.orgCode}. Use it on your posters.`);
      setRegForm({ name: '', email: '', ownerName: '', password: '' });
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setLoginError('');
    setRegError('');
    setRegSuccess('');
    navigate(tab === 'login' ? '/org/login' : '/org/register');
  };

  return (
    <div className="org-auth">
      <div className="org-auth__bg" aria-hidden="true">
        <div className="org-auth__grid" />
        <motion.div
          className="org-auth__orb org-auth__orb--1"
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="org-auth__orb org-auth__orb--2"
          animate={{ y: [0, 24, 0], x: [0, -18, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="org-auth__inner">
        <motion.div className="org-auth__info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <motion.div className="org-auth__badge" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <span className="org-auth__badge-dot" />
            For Businesse
          </motion.div>

          <motion.h1 className="org-auth__title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08, ease }}>
            One code for your
            <br />
            <span className="org-auth__gradient">whole business.</span>
          </motion.h1>

          <motion.p className="org-auth__subtitle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16, ease }}>
            Get a 4-character code + QR for your business. Customers send text, images, and files — no account, no app. You review everything from a live dashboard.
          </motion.p>

          <motion.div className="org-auth__features" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.24 }}>
            <FeatureCard icon="code" title="Memorable code" desc="Pick a 4-character code. Put it on posters, counters, or receipts." delay={0.28} />
            <FeatureCard icon="image" title="Anything inside" desc="Text, photos, PDFs — customers drop it behind your key in seconds." delay={0.36} />
            <FeatureCard icon="barChart" title="Live dashboard" desc="Review submissions, export data, and stay on top of requests in realtime." delay={0.44} />
            <FeatureCard icon="smartphone" title="No app required" desc="Works on any device. Just share the code and let them scan or type." delay={0.52} />
          </motion.div>

          <motion.div className="org-auth__stats" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
            <div className="org-auth__stat">
              <div className="org-auth__stat-value"><AnimatedCounter value={2400} />+</div>
              <div className="org-auth__stat-label">Businesses onboarded</div>
            </div>
            <div className="org-auth__stat">
              <div className="org-auth__stat-value"><AnimatedCounter value={98} />%</div>
              <div className="org-auth__stat-label">Uptime reliability</div>
            </div>
          </motion.div>

          <motion.div className="org-auth__usecases" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.68 }}>
            <span className="org-auth__usecase-lead">Great for…</span>
            <div className="org-auth__chips">
              <span className="org-auth__chip"><Icon name="copy" size={14} /> Print shops</span>
              <span className="org-auth__chip"><Icon name="users" size={14} /> Cafes & restaurants</span>
              <span className="org-auth__chip"><Icon name="file" size={14} /> Real estate</span>
              <span className="org-auth__chip"><Icon name="send" size={14} /> Events & venues</span>
              <span className="org-auth__chip"><Icon name="lock" size={14} /> Hotels</span>
            </div>
          </motion.div>

          <motion.div className="org-auth__cta-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.76 }}>
            <p>New here? <Link to="/" className="org-auth__link">Try TShare as a user →</Link></p>
          </motion.div>
        </motion.div>

        <motion.div
          className="org-auth__form-wrap"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
        >
          <div className="org-auth__card">
            <div className="org-auth__tabs" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'login'}
                className={`org-auth__tab ${activeTab === 'login' ? 'org-auth__tab--active' : ''}`}
                onClick={() => switchTab('login')}
                type="button"
              >
                Login
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'register'}
                className={`org-auth__tab ${activeTab === 'register' ? 'org-auth__tab--active' : ''}`}
                onClick={() => switchTab('register')}
                type="button"
              >
                Register
              </button>
              <motion.div
                className="org-auth__tab-indicator"
                animate={{ x: activeTab === 'login' ? '0%' : '100%', width: '50%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              />
            </div>

            <div className="org-auth__panel">
              {activeTab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.3, ease }}
                  onSubmit={handleLogin}
                  className="org-auth__form"
                >
                  <h2 className="org-auth__form-title">Welcome back</h2>
                  <p className="org-auth__form-desc">Sign in to your organization dashboard.</p>

                  {loginError && (
                    <motion.div className="org-auth__error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                      {loginError}
                    </motion.div>
                  )}

                  <div className="org-auth__field">
                    <label className="org-auth__label" htmlFor="org-login-email">Email</label>
                    <input
                      id="org-login-email"
                      className="org-auth__input"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@business.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="org-auth__field">
                    <label className="org-auth__label" htmlFor="org-login-password">Password</label>
                    <input
                      id="org-login-password"
                      className="org-auth__input"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Your password"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <button className="org-auth__submit" type="submit" disabled={loginLoading}>
                    {loginLoading ? 'Signing in…' : <><Icon name="send" size={16} /> Login</>}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3, ease }}
                  onSubmit={handleRegister}
                  className="org-auth__form"
                >
                  <h2 className="org-auth__form-title">Create your org</h2>
                  <p className="org-auth__form-desc">Get a code and start receiving in under a minute.</p>

                  {regError && (
                    <motion.div className="org-auth__error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                      {regError}
                    </motion.div>
                  )}
                  {regSuccess && (
                    <motion.div className="org-auth__success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                      {regSuccess} <Link to="/org/login" className="org-auth__success-link">Login now →</Link>
                    </motion.div>
                  )}

                  <div className="org-auth__field">
                    <label className="org-auth__label" htmlFor="org-name">Business name</label>
                    <input
                      id="org-name"
                      className="org-auth__input"
                      type="text"
                      value={regForm.name}
                      onChange={(e) => setRegForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Sunrise Xerox"
                      required
                      autoComplete="organization"
                    />
                  </div>

                  <div className="org-auth__field">
                    <label className="org-auth__label" htmlFor="org-email">Email</label>
                    <input
                      id="org-email"
                      className="org-auth__input"
                      type="email"
                      value={regForm.email}
                      onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@business.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="org-auth__field">
                    <label className="org-auth__label" htmlFor="org-owner">Owner name <span className="org-auth__optional">(optional)</span></label>
                    <input
                      id="org-owner"
                      className="org-auth__input"
                      type="text"
                      value={regForm.ownerName}
                      onChange={(e) => setRegForm((p) => ({ ...p, ownerName: e.target.value }))}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>

                  <div className="org-auth__field">
                    <label className="org-auth__label" htmlFor="org-password">Password</label>
                    <input
                      id="org-password"
                      className="org-auth__input"
                      type="password"
                      value={regForm.password}
                      onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="At least 6 characters"
                      minLength={6}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <button className="org-auth__submit" type="submit" disabled={regLoading}>
                    {regLoading ? 'Creating…' : <><Icon name="send" size={16} /> Create organization</>}
                  </button>
                </motion.form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrgAuth;
