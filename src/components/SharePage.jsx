import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './SharePage.css';
import { endpoints, baseUrl } from '../api/api';
import io from 'socket.io-client';
import UsernameMapper from './auth/UsernameMapper';
import { useLayout } from './layout/LayoutContext';
import { Skeleton } from './common/Skeleton';

const SharePage = () => {
  const navigate = useNavigate();
  const { insideLayout } = useLayout();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState(null);
  const [text, setText] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [shareError, setShareError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const newSocket = io(baseUrl);
    setSocket(newSocket);
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const charCount = text.length;
  const maxChars = 50000;

  const saveTextDb = () => {
    if (!text.trim()) {
      textareaRef.current?.focus();
      return;
    }

    const username = localStorage.getItem('tshare_username');
    setShareError('');
    doSaveText(text, username || '');
  };

  const doSaveText = (textToSave, username) => {
    setLoading(true);
    setShowCode(false);
    setShareError('');

    return fetch(endpoints.save, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToSave, username }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || 'Failed to save text') });
        }
        return res.json();
      })
      .then(data => {
        if (!data.id) {
          throw new Error(data.message || 'Failed to save text');
        }
        const newCode = String(data.id)
        setCode(newCode)
        setText('')
        setShowCode(true)
        if (socket) {
          socket.emit('text-update', {
            textId: data.id,
            text: textToSave
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setShareError(error.message || 'Failed to save text');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  const handleShareAnother = () => {
    setShowCode(false);
    setCode('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const renderLoadingState = () => (
    <div className="share__editor">
      <div className="editor-wrapper">
        <div className="editor-textarea-wrapper">
          <Skeleton className="editor-textarea" style={{ height: '200px' }} />
        </div>
        <div className="editor-actions">
          <Skeleton className="editor-clear-btn" style={{ width: '80px', height: '40px' }} />
          <Skeleton className="editor-share-btn" style={{ width: '120px', height: '40px' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={insideLayout ? 'share-page' : 'page'}>
      {!insideLayout && (
        <motion.nav
          className="nav"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="nav__inner">
            <button className="nav__back" onClick={() => {
              const params = new URLSearchParams(window.location.search);
              const from = params.get('from');
              navigate(from || '/');
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="nav__brand">
              <img src="/s2.svg" alt="TShare" width="20" height="20" />
              <span>TShare</span>
            </div>
          </div>
        </motion.nav>
      )}

    <main className="share">
        <div className="share__container">
          <motion.div
            className="share__header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="share__header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <span className="share__badge">
              <span className="share__badge-dot" />
              Text · Instant &amp; free · No account
            </span>
            <h1 className="share__title">
              Drop text behind a <span className="share__title-grad">4-digit key</span>
            </h1>
            <p className="share__desc">
              Paste or type anything — a note, a link, a password. We lock it behind a short
              code you can share anywhere, and anyone can open it on any device, anytime.
            </p>
          </motion.div>

          <motion.div
            className="share__steps"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="share__step">
              <span className="share__step-num">1</span>
              <span className="share__step-txt"><strong>Type</strong> your text</span>
            </div>
            <span className="share__step-line" aria-hidden="true" />
            <div className="share__step">
              <span className="share__step-num">2</span>
              <span className="share__step-txt"><strong>Lock</strong> it behind a code</span>
            </div>
            <span className="share__step-line" aria-hidden="true" />
            <div className="share__step">
              <span className="share__step-num">3</span>
              <span className="share__step-txt"><strong>Share</strong> the 4-digit key</span>
            </div>
            <span className="share__step-line" aria-hidden="true" />
            {/* <div className="share__step">
              <span className="share__step-num">4</span>
              <span className="share__step-txt"><strong>Unlock</strong> anytime, any device</span>
            </div> */}
          </motion.div>

          <AnimatePresence mode="wait">
            {loading && !code ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderLoadingState()}
              </motion.div>
            ) : showCode && code ? (
              <motion.div
                key="code"
                className="code-reveal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="code-reveal__badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Code Generated
                </div>
                <button
                  className="code-reveal__value"
                  onClick={copyCode}
                  title="Click to copy"
                >
                  <motion.span
                    className="code-reveal__digits"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {code.split('').map((digit, i) => (
                      <motion.span
                        key={i}
                        className="code-reveal__digit"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {digit}
                      </motion.span>
                    ))}
                  </motion.span>
                  <span className="code-reveal__copy-icon">
                    {copied ? (
                      <motion.svg
                        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                  </span>
                </button>
                <p className="code-reveal__hint">
                  {copied ? 'Copied to clipboard!' : 'Click the code to copy it'}
                </p>
                <div className="code-reveal__meta">
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Stored &amp; reusable
                  </span>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></svg>
                    Open on any device
                  </span>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                    No account needed
                  </span>
                </div>
                <button className="code-reveal__share-another" onClick={handleShareAnother}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  Share Another
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="input"
                className="share__editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="editor-wrapper">
                  <div className="editor-textarea-wrapper">
                    <div className="editor-bar">
                      <span className="editor-bar__dots" aria-hidden="true"><i /><i /><i /></span>
                      <span className="editor-bar__label">tshare / text</span>
                      <span className="editor-bar__live"><span className="editor-bar__pulse" /> stored &amp; reusable</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      className="editor-textarea"
                      placeholder="Paste your text here..."
                      value={text}
                      onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                      rows={10}
                      maxLength={maxChars}
                    />
                    <div className="editor-char-count">
                      <span className={charCount > maxChars * 0.9 ? 'editor-char-count--warning' : ''}>
                        {charCount.toLocaleString()} / {maxChars.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="editor-actions">
                    <UsernameMapper />
                    <button
                      className="editor-clear-btn"
                      onClick={() => { setText(''); textareaRef.current?.focus() }}
                      disabled={!text.trim() || loading}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      Clear
                    </button>
                    <button
                      className="btn btn--primary editor-share-btn"
                      onClick={saveTextDb}
                      disabled={loading || !text.trim()}
                    >
                      {loading ? (
                        <span className="btn__loading">
                          <motion.span
                            className="btn__spinner"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M21 12a9 9 0 11-6.219-8.56" />
                            </svg>
                          </motion.span>
                          Sharing...
                        </span>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13" />
                            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                          </svg>
                          Share Text
                        </>
                      )}
                    </button>
                  </div>
                  {shareError && (
                    <motion.p
                      className="share__error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {shareError}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="share__media-tabs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="media-tabs__label">Share other types</div>
            <div className="media-tabs__list">
              <button
                className="media-tab"
                onClick={() => navigate('/share-image')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Image
              </button>
              <button
                className="media-tab"
                onClick={() => navigate('/share-file')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
                File
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SharePage;