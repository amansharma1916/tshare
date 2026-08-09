import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getOrgAuth, clearOrgAuth } from './orgAuth';
import './OrgLayout.css';

// Neutral dashboard-style shell for the org admin pages.
const OrgLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = getOrgAuth();
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    clearOrgAuth();
    navigate('/org/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="org-shell">
      <header className="org-topbar">
        <div className="org-topbar__inner">
          <div className="org-topbar__brand">
            <span className="org-topbar__logo">
              <img src="/s2.svg" alt="tshare" width="26" height="26" />
            </span>
            <span>tshare</span>
            <span className="org-topbar__divider" />
            <span className="org-topbar__label">For Businesses</span>
          </div>
          <nav className="org-topbar__nav">
            {isLoggedIn ? (
              <button className="org-topbar__link org-topbar__link--btn" onClick={handleLogout} type="button">
                Logout
              </button>
            ) : (
              <>
                <Link className={`org-topbar__link ${isActive('/org/login') ? 'org-topbar__link--active' : ''}`} to="/org/login">
                  Login
                </Link>
                <Link className={`org-topbar__link ${isActive('/org/register') ? 'org-topbar__link--active' : ''}`} to="/org/register">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="org-shell__main">{children}</main>
    </div>
  );
};

export default OrgLayout;