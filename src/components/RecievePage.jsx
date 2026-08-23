import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './RecievePage.css';
import { endpoints } from '../api/api';
import UsernameMapper from './auth/UsernameMapper';
import { useLayout } from './layout/LayoutContext';
import { Skeleton } from './common/Skeleton';

const RecievePage = () => {
  const navigate = useNavigate();
  const { insideLayout } = useLayout();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [segmentCount, setSegmentCount] = useState(4);
  const [segments, setSegments] = useState(Array(4).fill(''));
  const [activeSegment, setActiveSegment] = useState(0);
  const segmentRefs = useRef([]);

  // Unified receive state — holds whatever type the API returns
  const [receivedContent, setReceivedContent] = useState(null); // { dataType, id, text/image/file, createdAt }
  const [showContent, setShowContent] = useState(false);

  // Password protection state
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [protectedCode, setProtectedCode] = useState('');
  // The password the visitor verified against a protected code. The preview /
  // download endpoints check the password per request (?password=), so we keep
  // it until a new code is entered.
  const verifiedPasswordRef = useRef('');

  useEffect(() => {
    segmentRefs.current[0]?.focus();
  }, [segmentCount]);

  const getCode = () => segments.join('');

  const handleToggleMode = (count) => {
    setSegmentCount(count);
    setSegments(Array(count).fill(''));
    setActiveSegment(0);
    setError('');
    setSuccessMessage('');
    setShowContent(false);
    setReceivedContent(null);
  };

  const handleSegmentChange = useCallback((index, value) => {
    const char = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!char) return;

    const newSegments = [...segments];
    newSegments[index] = char.slice(-1);
    setSegments(newSegments);
    setError('');
    setSuccessMessage('');
    setShowContent(false);
    setReceivedContent(null);

    if (index < segmentCount - 1) {
      setActiveSegment(index + 1);
      segmentRefs.current[index + 1]?.focus();
    }
  }, [segments, segmentCount]);

  const handleSegmentKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newSegments = [...segments];
      if (segments[index]) {
        newSegments[index] = '';
        setSegments(newSegments);
      } else if (index > 0) {
        newSegments[index - 1] = '';
        setSegments(newSegments);
        setActiveSegment(index - 1);
        segmentRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setActiveSegment(index - 1);
      segmentRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < segmentCount - 1) {
      e.preventDefault();
      setActiveSegment(index + 1);
      segmentRefs.current[index + 1]?.focus();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleReceive();
    }
  }, [segments, segmentCount]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, segmentCount);
    if (!pasted) return;

    const newSegments = [...segments];
    for (let i = 0; i < pasted.length; i++) {
      newSegments[i] = pasted[i];
    }
    setSegments(newSegments);
    setError('');

    const nextIndex = Math.min(pasted.length, segmentCount - 1);
    setActiveSegment(nextIndex);
    segmentRefs.current[nextIndex]?.focus();
  }, [segments, segmentCount]);

  const clearAll = () => {
    setSegments(Array(segmentCount).fill(''));
    setActiveSegment(0);
    segmentRefs.current[0]?.focus();
    setReceivedContent(null);
    setError('');
    setSuccessMessage('');
    setShowContent(false);
    setCopied(false);
  };

  const handleReceive = () => {
    const code = getCode();
    if (code.length !== segmentCount) {
      setError(`Please enter all ${segmentCount} characters`);
      return;
    }

    const username = localStorage.getItem('tshare_username');
    doReceive(code, username || '');
  };

  const doReceive = (code, username) => {
    return receiveData(code, username);
  };

  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) {
      setPasswordError('Please enter a password');
      return;
    }
    
    setPasswordSubmitting(true);
    setPasswordError('');

    try {
      // Verify password and get data in one call
      const verifyRes = await fetch(endpoints.verifyCodePassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: protectedCode, 
          password: passwordInput 
        })
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}));
        throw new Error(err.message || 'Incorrect password');
      }

      const data = await verifyRes.json();

      // Process the data directly from verify response
      if (data?.isPremium && Array.isArray(data?.items)) {
        setReceivedContent({
          dataType: 'bundle',
          id: data.id,
          code: data.code,
          items: data.items,
          capacity: data.capacity,
          itemCount: data.itemCount,
          createdAt: data.createdAt,
          isPremium: true,
          displayName: data.displayName
        });
        setSuccessMessage(`Received ${data.items.length} item${data.items.length === 1 ? '' : 's'}`);
        setShowContent(true);
      } else if (data?.dataType === 'text') {
        const unescapedText = data.text
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\');
        setReceivedContent({ dataType: 'text', id: data.id, text: unescapedText, createdAt: data.createdAt, isPremium: data.isPremium, displayName: data.displayName });
        setSuccessMessage('Text received successfully');
        setShowContent(true);
      } else if (data?.dataType === 'image') {
        setReceivedContent({ dataType: 'image', id: data.id, ...data.image, createdAt: data.createdAt, isPremium: data.isPremium, displayName: data.displayName });
        setSuccessMessage('Image received');
        setShowContent(true);
      } else if (data?.dataType === 'file') {
        setReceivedContent({ dataType: 'file', id: data.id, ...data.file, createdAt: data.createdAt, isPremium: data.isPremium, displayName: data.displayName });
        setSuccessMessage('File received');
        setShowContent(true);
      }

      // Clear password state
      setPasswordRequired(false);
      setProtectedCode('');
      setPasswordInput('');
      setPasswordError('');
      // Remember the verified password so item downloads/previews can pass it.
      verifiedPasswordRef.current = passwordInput;
    } catch (err) {
      setPasswordError(err.message || 'Failed to verify password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // ──────────────────────────────────────────
  // UNIFIED RECEIVE — calls the single /data/:id endpoint
  // The API returns { dataType, id, text / image / file, createdAt }
  // ──────────────────────────────────────────
  const receiveData = async (code, username) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setShowContent(false);
    setReceivedContent(null);
    // New code — drop any previously verified password.
    verifiedPasswordRef.current = '';

    try {
      const url = endpoints.getData(code) + (username ? '?username=' + encodeURIComponent(username) : '');
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Check if password is required
      if (res.status === 401) {
        const err = await res.json().catch(() => ({}));
        if (err.requiresPassword) {
          // Show password prompt - don't proceed with request
          setPasswordRequired(true);
          setProtectedCode(code);
          setPasswordInput('');
          setPasswordError('');
          setLoading(false);
          return;
        }
        throw new Error(err.message || 'Invalid code or data not found');
      }
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Invalid code or data not found');
      }
      const data = await res.json();

      if (data?.isPremium && Array.isArray(data?.items)) {
        setReceivedContent({
          dataType: 'bundle',
          id: data.id,
          code: data.code,
          items: data.items,
          capacity: data.capacity,
          itemCount: data.itemCount,
          createdAt: data.createdAt,
          isPremium: true,
          displayName: data.displayName
        });
        setSuccessMessage(`Received ${data.items.length} item${data.items.length === 1 ? '' : 's'}`);
        setShowContent(true);
      } else if (data?.dataType === 'text') {
        const unescapedText = data.text
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\');
        setReceivedContent({ dataType: 'text', id: data.id, text: unescapedText, createdAt: data.createdAt, isPremium: data.isPremium, displayName: data.displayName });
        setSuccessMessage('Text received successfully');
        setShowContent(true);
      } else if (data?.dataType === 'image') {
        setReceivedContent({ dataType: 'image', id: data.id, ...data.image, createdAt: data.createdAt, isPremium: data.isPremium, displayName: data.displayName });
        setSuccessMessage('Image received');
        setShowContent(true);
      } else if (data?.dataType === 'file') {
        setReceivedContent({ dataType: 'file', id: data.id, ...data.file, createdAt: data.createdAt, isPremium: data.isPremium, displayName: data.displayName });
        setSuccessMessage('File received');
        setShowContent(true);
      } else {
        throw new Error('Unknown or unsupported data type');
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!receivedContent?.text) return;
    navigator.clipboard.writeText(receivedContent.text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(error => console.error('Error copying:', error));
  };

  const downloadCurrent = () => {
    if (!receivedContent?.id) return;
    if (receivedContent.dataType === 'image') {
      window.location.href = endpoints.downloadImage(receivedContent.id);
    } else if (receivedContent.dataType === 'file') {
      window.location.href = endpoints.downloadFile(receivedContent.id);
    }
  };

  const isReceiving = loading;

  const renderReceivingSkeleton = () => (
    <div className="receive__content">
      <div className="receive__text-content">
        <Skeleton className="receive__text-wrapper" style={{ height: '200px' }} />
      </div>
    </div>
  );

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  const getTypeIcon = () => {
    if (receivedContent?.dataType === 'text') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      );
    }
    if (receivedContent?.dataType === 'image') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    }
    if (receivedContent?.dataType === 'file') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    }
    // Generic receive icon (before content is known)
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <path d="M7 10l5 5 5-5" />
        <path d="M12 3v12" />
      </svg>
    );
  };

  const getTypeIconClass = () => {
    if (receivedContent?.dataType === 'image') return 'share__header-icon share__header-icon--image';
    if (receivedContent?.dataType === 'file') return 'share__header-icon share__header-icon--file';
    return 'share__header-icon';
  };
  const getTitle = () => {
    if (receivedContent?.dataType === 'bundle') return 'Receive Content';
    if (receivedContent?.dataType === 'text') return 'Receive Text';
    if (receivedContent?.dataType === 'image') return 'Receive Image';
    if (receivedContent?.dataType === 'file') return 'Receive File';
    return 'Receive Content';
  };

  const getDesc = () => 'Enter the 4-character code shared with you to retrieve text, images, or files.';

  const copyText = (text) => {
    navigator.clipboard.writeText(text).catch((e) => console.error('Error copying:', e));
  };

  // Password-protected premium codes check the password per request (?password=).
  // Append the verified password (if any) to per-item URLs.
  const withCodePassword = (url) => {
    const pw = verifiedPasswordRef.current;
    if (!pw) return url;
    return `${url}${url.includes('?') ? '&' : '?'}password=${encodeURIComponent(pw)}`;
  };

  const downloadItem = (itemId) => {
    if (!receivedContent?.code) return;
    window.location.href = withCodePassword(endpoints.premiumItemDownload(receivedContent.code, itemId));
  };

  const renderBundle = () => {
    if (!receivedContent?.items?.length) {
      return <p className="receive__text">This premium code has no content yet.</p>;
    }
    return (
      <div className="receive__bundle">
        <div className="receive__bundle-head">
          <span>{receivedContent.items.length} item{receivedContent.items.length === 1 ? '' : 's'} under this code</span>
        </div>
        {receivedContent.items.map((item) => {
          if (item.type === 'text') {
            return (
              <div key={item.itemId} className="receive__bundle-item receive__bundle-item--text">
                <pre className="receive__text">{item.text}</pre>
                <button className="btn btn--secondary receive__action-btn" onClick={() => copyText(item.text)}>
                  Copy Text
                </button>
              </div>
            );
          }
          if (item.type === 'image') {
            return (
              <div key={item.itemId} className="receive__bundle-item">
                <div className="receive__image-wrapper">
                  <motion.img
                    src={item.url}
                    alt={item.originalName || 'Shared image'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="receive__file-info">
                  <div className="receive__file-icon receive__file-icon--image">{getTypeIcon()}</div>
                  <div className="receive__file-details">
                    <span className="receive__file-name">{item.originalName || 'Shared image'}</span>
                  </div>
                </div>
                <button
                  className="btn btn--secondary receive__action-btn"
                  onClick={() => downloadItem(item.itemId)}
                >
                  Download
                </button>
              </div>
            );
          }
          return (
            <div key={item.itemId} className="receive__bundle-item">
              <div className="receive__file-preview">
                <iframe src={withCodePassword(endpoints.premiumItemPreview(receivedContent.code, item.itemId))} title="File preview" />
              </div>
              <div className="receive__file-info">
                <div className="receive__file-icon receive__file-icon--file">{getTypeIcon()}</div>
                <div className="receive__file-details">
                  <span className="receive__file-name">{item.originalName || 'Shared file'}</span>
                  {item.size && (
                    <span className="receive__file-size">
                      {item.size >= 1024 * 1024
                        ? (item.size / (1024 * 1024)).toFixed(1) + ' MB'
                        : item.size >= 1024
                          ? (item.size / 1024).toFixed(1) + ' KB'
                          : item.size + ' B'}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="btn btn--secondary receive__action-btn"
                onClick={() => downloadItem(item.itemId)}
              >
                Download File
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (!receivedContent) return null;

    if (receivedContent.dataType === 'bundle') {
      return renderBundle();
    }

    if (receivedContent.dataType === 'text') {
      return (
        <div className="receive__text-content">
          <div className="receive__text-wrapper">
            <pre className="receive__text">{receivedContent.text}</pre>
          </div>
          <button className="btn btn--secondary receive__action-btn" onClick={copyToClipboard}>
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy Text
              </>
            )}
          </button>
        </div>
      );
    }

    if (receivedContent.dataType === 'image') {
      return (
        <div className="receive__image-content">
          <div className="receive__image-wrapper">
            <motion.img
              src={receivedContent.url}
              alt={receivedContent.originalName || 'Shared image'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="receive__file-info">
            <div className="receive__file-icon receive__file-icon--image">
              {getTypeIcon()}
            </div>
            <div className="receive__file-details">
              <span className="receive__file-name">{receivedContent.originalName || 'Shared image'}</span>
            </div>
          </div>
          <button className="btn btn--secondary receive__action-btn" onClick={downloadCurrent}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
        </div>
      );
    }

    if (receivedContent.dataType === 'file') {
      return (
        <div className="receive__file-content">
          <div className="receive__file-preview">
            <iframe
              src={endpoints.previewFile(receivedContent.id)}
              title="File preview"
            />
          </div>
          <div className="receive__file-info">
            <div className="receive__file-icon receive__file-icon--file">
              {getTypeIcon()}
            </div>
            <div className="receive__file-details">
              <span className="receive__file-name">{receivedContent.originalName || 'Shared file'}</span>
              {receivedContent.size && (
                <span className="receive__file-size">
                  {receivedContent.size >= 1024 * 1024
                    ? (receivedContent.size / (1024 * 1024)).toFixed(1) + ' MB'
                    : receivedContent.size >= 1024
                      ? (receivedContent.size / 1024).toFixed(1) + ' KB'
                      : receivedContent.size + ' B'}
                </span>
              )}
            </div>
          </div>
          <button className="btn btn--secondary receive__action-btn" onClick={downloadCurrent}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download File
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`${insideLayout ? 'share-page' : 'page'} ${(receivedContent?.isPremium || passwordRequired) ? 'receive-page--premium' : ''} ${passwordRequired ? 'password-mode' : ''}`}>
      {!insideLayout && (
        <motion.nav
          className="nav"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="nav__inner">
            <button className="nav__back" onClick={() => navigate('/')}>
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

      <main className="receive">
        <div className="receive__container">
          {receivedContent?.isPremium && !passwordRequired && !passwordRequired && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="receive__premium-badge"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2Z" />
              </svg>
              Content shared by Premium User: <strong>{receivedContent.displayName || 'Premium User'}</strong>
            </motion.div>
          )}

          <motion.div
            className="share__header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={getTypeIconClass()}>
              {getTypeIcon()}
            </div>
            <span className="share__badge">
              <span className="share__badge-dot" />
              Receive · Instant & free · No account
            </span>
            <h1 className="share__title">{getTitle()}</h1>
            <p className="share__desc">{getDesc()}</p>
          </motion.div>

          {/* Password Protection Overlay - Blurred Content */}
          {passwordRequired && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="receive__lock-overlay"
            >
              {/* Lock Icon */}
              <div className="receive__lock-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>

              <h2 className="receive__lock-title">
                Premium Protected Content
              </h2>
              
              <p className="receive__lock-desc">
                This content is password protected. Enter the password to unlock premium content.
              </p>

              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="receive__lock-error"
                >
                  {passwordError}
                </motion.div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="Enter password to unlock"
                  autoFocus
                  className="receive__lock-input"
                />
              </div>

              <div className="receive__lock-actions">
                <button
                  onClick={() => {
                    setPasswordRequired(false);
                    setProtectedCode('');
                    setPasswordInput('');
                    setPasswordError('');
                  }}
                  disabled={passwordSubmitting}
                  className="receive__lock-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={passwordSubmitting}
                  className="receive__lock-btn-unlock"
                >
                  {passwordSubmitting ? (
                    <span className="receive__lock-spinner">
                      Verifying...
                    </span>
                  ) : (
                    'Unlock Content'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          <div className="toggle-container">
            <button
              type="button"
              onClick={() => handleToggleMode(4)}
              className={`toggle-btn ${segmentCount === 4 ? 'toggle-btn--active' : ''}`}
            >
              4 Characters Mode
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(6)}
              className={`toggle-btn ${segmentCount === 6 ? 'toggle-btn--active' : ''}`}
            >
              6 Characters Mode
            </button>
          </div>

          <motion.div
                      className="share__steps"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="share__step">
                        <span className="share__step-num">1</span>
                        <span className="share__step-txt"><strong>Enter</strong> the code</span>
                      </div>
                      <span className="share__step-line" aria-hidden="true" />
                      <div className="share__step">
                        <span className="share__step-num">2</span>
                        <span className="share__step-txt"><strong>Receive</strong> from the store</span>
                      </div>
                      <span className="share__step-line" aria-hidden="true" />
                      <div className="share__step">
                        <span className="share__step-num">3</span>
                        <span className="share__step-txt"><strong>Download</strong> the file</span>
                      </div>
                      <span className="share__step-line" aria-hidden="true" />
                      {/* <div className="share__step">
                        <span className="share__step-num">4</span>
                        <span className="share__step-txt"><strong>Open</strong> &amp; download anytime</span>
                      </div> */}
                    </motion.div>

          <motion.div
            className="receive__code-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="segmented-input" onPaste={handlePaste}>
              {segments.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { segmentRefs.current[i] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleSegmentChange(i, e.target.value)}
                  onKeyDown={(e) => handleSegmentKeyDown(i, e)}
                  onFocus={() => setActiveSegment(i)}
                  className={`segment-input ${digit ? 'segment-input--filled' : ''} ${activeSegment === i ? 'segment-input--active' : ''}`}
                  aria-label={`Digit ${i + 1} of ${segmentCount}`}
                  autoComplete="off"
                  style={{ textTransform: 'uppercase' }}
                />
              ))}
            </div>

            <div className="receive__actions-row">
              <UsernameMapper />
              <button className="editor-clear-btn" onClick={clearAll} type="button" disabled={isReceiving}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                Clear
              </button>
              <button
                className="btn btn--primary editor-share-btn"
                onClick={handleReceive}
                disabled={isReceiving || getCode().length !== segmentCount}
              >
                {isReceiving ? (
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
                    Receiving...
                  </span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <path d="M7 10l5 5 5-5" />
                      <path d="M12 3v12" />
                    </svg>
                    Receive
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="receive__status receive__status--error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {error}
                </motion.div>
              )}
              {successMessage && !error && (
                <motion.div
                  className="receive__status receive__status--success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading && !receivedContent ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderReceivingSkeleton()}
              </motion.div>
            ) : showContent && receivedContent ? (
              <motion.div
                key={`content-${receivedContent.dataType}`}
                className="receive__content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              >
                {renderContent()}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default RecievePage;