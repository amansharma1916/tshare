import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SharePage.css';
import { endpoints, baseUrl } from '../api/api';
import io from 'socket.io-client';

const SharePage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState(null);
  const [text, setText] = useState('');
  const [showCode, setShowCode] = useState(false);
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

    setLoading(true);
    setShowCode(false);

    fetch(endpoints.save, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(res => res.json())
      .then(data => {
        setCode(data.id);
        setText('');
        setShowCode(true);
        if (socket) {
          socket.emit('text-update', {
            textId: data.id,
            text: text
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
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

  return (
    <div className="page">
      <motion.nav
        className="nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="nav__inner">
          <button className="nav__back" onClick={() => window.location.href = '/'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="nav__brand">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#navBrand)" />
              <path d="M9 16l5 5 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="navBrand" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#8b5cf6"/>
                  <stop offset="1" stopColor="#ec4899"/>
                </linearGradient>
              </defs>
            </svg>
            <span>TShare</span>
          </div>
        </div>
      </motion.nav>

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
                onClick={() => window.location.href = '/share-pdf'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                PDF
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SharePage;