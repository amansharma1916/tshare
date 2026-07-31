import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SharePage.css';
import { endpoints, baseUrl } from '../api/api';
import io from 'socket.io-client';
import UsernamePopup from './auth/UsernamePopup';

const SharePage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState(null);
  const [text, setText] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [pendingText, setPendingText] = useState('');
  const [popupError, setPopupError] = useState('');
  const [popupSubmitting, setPopupSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const newSocket = io(baseUrl);
    setSocket(newSocket);
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const saveTextDb = () => {
    if (!text.trim()) {
      textareaRef.current?.focus();
      return;
    }

    const username = localStorage.getItem('tshare_username');
    if (!username) {
      setPendingText(text);
      setPopupError('');
      setPopupOpen(true);
      return;
    }

    doSaveText(text, username);
  };

  const doSaveText = (textToSave, username) => {
    setLoading(true);
    setShowCode(false);

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
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUsernameSubmit = (username) => {
    setPopupError('');
    setPopupSubmitting(true);
    doSaveText(pendingText, username)
      .then(() => {
        setPopupOpen(false);
      })
      .catch(error => {
        setPopupError(error.message || 'Something went wrong');
      })
      .finally(() => {
        setPopupSubmitting(false);
      });
  };

  const handleAnonymous = () => {
    setPopupOpen(false);
    doSaveText(pendingText, '');
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

  return (
    <div className="page">
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
            window.location.href = from || '/';
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

    <UsernamePopup
      isOpen={popupOpen}
      onClose={() => { setPopupOpen(false); setPopupError(''); }}
      onUsernameSubmit={handleUsernameSubmit}
      onAnonymous={handleAnonymous}
      submitError={popupError}
      onClearSubmitError={() => setPopupError('')}
      submitting={popupSubmitting}
    />

    <main className="share">
        <div className="share__container">
          <motion.div
            className="share__header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="share__title">Share Text</h1>
            <p className="share__desc">Paste or type the text you want to share instantly.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {showCode && code ? (
              <motion.div
                key="code"
                className="code-reveal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="code-reveal__badge">Code Generated</div>
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
                <p className="code-reveal__hint">Share this code with the recipient</p>
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
                  <textarea
                    ref={textareaRef}
                    className="editor-textarea"
                    placeholder="Paste your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                  />
                  <div className="editor-actions">
                    <button
                      className="btn btn--primary"
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
                onClick={() => window.location.href = '/share-image'}
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
                onClick={() => window.location.href = '/share-file'}
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