import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RecievePage.css';
import { endpoints } from '../api/api';
import UsernamePopup from './auth/UsernamePopup';

const SEGMENT_COUNT = 4;

const RecievePage = () => {
  const [receivedData, setReceivedData] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [imageCode, setImageCode] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [pdfCode, setPdfCode] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [fileCode, setFileCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [segments, setSegments] = useState(Array(SEGMENT_COUNT).fill(''));
  const [activeSegment, setActiveSegment] = useState(0);
  const segmentRefs = useRef([]);
  const [contentType, setContentType] = useState('text');
  const [showContent, setShowContent] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [pendingCode, setPendingCode] = useState('');
  const [pendingContentType, setPendingContentType] = useState('text');
  const [popupError, setPopupError] = useState('');
  const [popupSubmitting, setPopupSubmitting] = useState(false);

  useEffect(() => {
    segmentRefs.current[0]?.focus();
  }, []);

  const getCode = () => segments.join('');

  const handleSegmentChange = useCallback((index, value) => {
    const digit = value.replace(/\D/g, '');
    if (!digit) return;

    const newSegments = [...segments];
    newSegments[index] = digit.slice(-1);
    setSegments(newSegments);
    setError('');
    setSuccessMessage('');
    setShowContent(false);

    if (index < SEGMENT_COUNT - 1) {
      setActiveSegment(index + 1);
      segmentRefs.current[index + 1]?.focus();
    }
  }, [segments]);

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

    if (e.key === 'ArrowRight' && index < SEGMENT_COUNT - 1) {
      e.preventDefault();
      setActiveSegment(index + 1);
      segmentRefs.current[index + 1]?.focus();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleReceive();
    }
  }, [segments]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, SEGMENT_COUNT);
    if (!pasted) return;

    const newSegments = [...segments];
    for (let i = 0; i < pasted.length; i++) {
      newSegments[i] = pasted[i];
    }
    setSegments(newSegments);
    setError('');

    const nextIndex = Math.min(pasted.length, SEGMENT_COUNT - 1);
    setActiveSegment(nextIndex);
    segmentRefs.current[nextIndex]?.focus();
  }, [segments]);

  const clearAll = () => {
    setSegments(Array(SEGMENT_COUNT).fill(''));
    setActiveSegment(0);
    segmentRefs.current[0]?.focus();
    setReceivedData('');
    setImageData(null);
    setPdfData(null);
    setError('');
    setSuccessMessage('');
    setShowContent(false);
  };

  const handleReceive = () => {
    const code = getCode();
    if (code.length !== SEGMENT_COUNT) {
      setError('Please enter all 4 digits');
      return;
    }

    const username = localStorage.getItem('tshare_username');
    if (!username) {
      setPendingCode(code);
      setPendingContentType(contentType);
      setPopupError('');
      setPopupOpen(true);
      return;
    }

    doReceive(code, contentType, username);
  };

  const doReceive = (code, type, username) => {
    if (type === 'text') return receiveData(code, username);
    else if (type === 'image') return receiveImage(code, username);
    else if (type === 'pdf') return receivePdf(code, username);
    else if (type === 'file') return receiveFile(code, username);
  };

  const handleUsernameSubmit = (username) => {
    setPopupError('');
    setPopupSubmitting(true);
    doReceive(pendingCode, pendingContentType, username)
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
    doReceive(pendingCode, pendingContentType, '');
  };

  const receiveData = (code, username) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setShowContent(false);
    setImageData(null);
    setPdfData(null);

    return fetch(endpoints.get(code) + (username ? '?username=' + encodeURIComponent(username) : ''))
      .then(res => {
          if (!res.ok) return res.json().then(err => { throw new Error(err.message || 'Invalid code or data not found') });
          return res.json();
      })
      .then(data => {
        if (data && data.text) {
          const unescapedText = data.text
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\');
          setReceivedData(unescapedText);
          setSuccessMessage('Text received successfully');
          setShowContent(true);
        } else {
          throw new Error('No data found for this code');
        }
      })
      .catch(error => {
        setError(error.message || 'Failed to retrieve data');
        throw error;
      })
      .finally(() => setLoading(false));
  };

  const receiveImage = (code, username) => {
    setImageLoading(true);
    setError('');
    setSuccessMessage('');
    setShowContent(false);
    setReceivedData('');
    setPdfData(null);

    return fetch(endpoints.getImage(code) + (username ? '?username=' + encodeURIComponent(username) : ''))
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.message || 'Invalid code or image not found') });
        return res.json();
      })
      .then(data => {
        if (data?.image?.url) {
          setImageData(data.image);
          setImageCode(code);
          setSuccessMessage('Image received');
          setShowContent(true);
        } else {
          throw new Error('No image found for this code');
        }
      })
      .catch(error => {
        setError(error.message || 'Failed to retrieve image');
        throw error;
      })
      .finally(() => setImageLoading(false));
  };

  const receivePdf = (code, username) => {
    setPdfLoading(true);
    setError('');
    setSuccessMessage('');
    setShowContent(false);
    setReceivedData('');
    setImageData(null);

    return fetch(endpoints.getPdf(code) + (username ? '?username=' + encodeURIComponent(username) : ''))
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.message || 'Invalid code or PDF not found') });
        return res.json();
      })
      .then(data => {
        if (data?.pdf?.url) {
          setPdfData(data.pdf);
          setPdfCode(code);
          setSuccessMessage('PDF received');
          setShowContent(true);
        } else {
          throw new Error('No PDF found for this code');
        }
      })
      .catch(error => {
        setError(error.message || 'Failed to retrieve PDF');
        throw error;
      })
      .finally(() => setPdfLoading(false));
  };

  const receiveFile = (code, username) => {
    setFileLoading(true);
    setError('');
    setSuccessMessage('');
    setShowContent(false);
    setReceivedData('');
    setImageData(null);
    setPdfData(null);

    return fetch(endpoints.getFile(code) + (username ? '?username=' + encodeURIComponent(username) : ''))
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.message || 'Invalid code or file not found') });
        return res.json();
      })
      .then(data => {
        if (data?.file?.url) {
          setFileData(data.file);
          setFileCode(code);
          setSuccessMessage('File received');
          setShowContent(true);
        } else {
          throw new Error('No file found for this code');
        }
      })
      .catch(error => {
        setError(error.message || 'Failed to retrieve file');
        throw error;
      })
      .finally(() => setFileLoading(false));
  };

  const copyToClipboard = () => {
    if (!receivedData) return;
    navigator.clipboard.writeText(receivedData)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(error => console.error('Error copying:', error));
  };

  const downloadImage = () => {
    if (!imageCode) return;
    window.location.href = endpoints.downloadImage(imageCode);
  };

  const downloadPdf = () => {
    if (!pdfCode) return;
    window.location.href = endpoints.downloadPdf(pdfCode);
  };

  const downloadFile = () => {
    if (!fileCode) return;
    window.location.href = endpoints.downloadFile(fileCode);
  };

  const isReceiving = loading || imageLoading || pdfLoading || fileLoading;

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
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

    <main className="receive">
        <div className="receive__container">
          <motion.div
            className="share__header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="share__title">Receive Content</h1>
            <p className="share__desc">Enter the 4-digit code shared with you.</p>
          </motion.div>

          <motion.div
            className="receive__tabs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {[
              { id: 'text', label: 'Text', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
              { id: 'image', label: 'Image', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
              { id: 'file', label: 'File', icon: 'M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`receive__tab ${contentType === tab.id ? 'receive__tab--active' : ''}`}
                onClick={() => {
                  setContentType(tab.id);
                  setError('');
                  setSuccessMessage('');
                  setShowContent(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </motion.div>

          <motion.div
            className="receive__code-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="segmented-input" onPaste={handlePaste}>
              {segments.map((digit, i) => (
                <React.Fragment key={i}>
                  <input
                    ref={(el) => { segmentRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleSegmentChange(i, e.target.value)}
                    onKeyDown={(e) => handleSegmentKeyDown(i, e)}
                    onFocus={() => setActiveSegment(i)}
                    className={`segment-input ${digit ? 'segment-input--filled' : ''} ${activeSegment === i ? 'segment-input--active' : ''}`}
                    aria-label={`Digit ${i + 1} of 4`}
                    autoComplete="off"
                  />
                </React.Fragment>
              ))}
            </div>

            <div className="receive__actions-row">
              <button className="receive__clear-btn" onClick={clearAll} type="button">
                Clear
              </button>
              <button
                className="btn btn--primary receive__go-btn"
                onClick={handleReceive}
                disabled={isReceiving || getCode().length !== SEGMENT_COUNT}
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
            {showContent && (
              <motion.div
                key={`content-${contentType}`}
                className="receive__content"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              >
                {contentType === 'text' && receivedData && (
                  <div className="receive__text-content">
                    <pre className="receive__text">{receivedData}</pre>
                    <button
                      className="btn btn--secondary receive__action-btn"
                      onClick={copyToClipboard}
                    >
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
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                )}

                {contentType === 'image' && imageData && (
                  <div className="receive__image-content">
                    <div className="receive__image-wrapper">
                      <motion.img
                        src={imageData.url}
                        alt={imageData.originalName || 'Shared image'}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <div className="receive__file-meta">
                      <span>{imageData.originalName || 'Shared image'}</span>
                    </div>
                    <button
                      className="btn btn--secondary receive__action-btn"
                      onClick={downloadImage}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </button>
                  </div>
                )}

                {contentType === 'pdf' && pdfData && (
                  <div className="receive__pdf-content">
                    <div className="receive__pdf-wrapper">
                      <iframe
                        src={endpoints.previewPdf(pdfCode)}
                        title="Shared PDF"
                      />
                    </div>
                    <div className="receive__file-meta">
                      <span>{pdfData.originalName || 'Shared PDF'}</span>
                    </div>
                    <button
                      className="btn btn--secondary receive__action-btn"
                      onClick={downloadPdf}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download PDF
                    </button>
                  </div>
                )}

                {contentType === 'file' && fileData && (
                  <div className="receive__file-content">
                    <div className="receive__file-preview">
                      <iframe
                        src={endpoints.previewFile(fileCode)}
                        title="File preview"
                      />
                    </div>
                    <div className="receive__file-info">
                      <div className="receive__file-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                      </div>
                      <div className="receive__file-details">
                        <span className="receive__file-name">{fileData.originalName || 'Shared file'}</span>
                        {fileData.size && (
                          <span className="receive__file-size">
                            {fileData.size >= 1024 * 1024
                              ? (fileData.size / (1024 * 1024)).toFixed(1) + ' MB'
                              : fileData.size >= 1024
                                ? (fileData.size / 1024).toFixed(1) + ' KB'
                                : fileData.size + ' B'}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn btn--secondary receive__action-btn"
                      onClick={downloadFile}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download File
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default RecievePage;