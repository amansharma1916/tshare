import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PdfSharePage.css';
import { endpoints } from '../api/api';

const PdfSharePage = () => {
  const [pdfCode, setPdfCode] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfCopied, setPdfCopied] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!pdfFile) {
      setPdfPreview('');
      return;
    }
    const objectUrl = URL.createObjectURL(pdfFile);
    setPdfPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pdfFile]);

  const onPdfChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setPdfFile(file);
      setPdfError('');
      setShowCode(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfError('');
      setShowCode(false);
    } else {
      setPdfError('Please drop a valid PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const uploadPdf = () => {
    if (!pdfFile) {
      setPdfError('Please select a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', pdfFile);

    setPdfLoading(true);
    setPdfError('');

    fetch(endpoints.uploadPdf, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          throw new Error(data.message || 'Failed to upload PDF');
        }
        setPdfCode(data.id);
        setShowCode(true);
      })
      .catch(error => {
        console.error('Error:', error);
        setPdfError(error.message || 'Failed to upload PDF');
      })
      .finally(() => {
        setPdfLoading(false);
      });
  };

  const copyPdfCode = () => {
    if (!pdfCode) return;
    navigator.clipboard.writeText(pdfCode)
      .then(() => {
        setPdfCopied(true);
        setTimeout(() => setPdfCopied(false), 2000);
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
            <h1 className="share__title">Share a PDF</h1>
            <p className="share__desc">Upload a PDF and get a code to share instantly.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {showCode && pdfCode ? (
              <motion.div
                key="code"
                className="code-reveal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="code-reveal__badge">PDF Code Generated</div>
                <button
                  className="code-reveal__value"
                  onClick={copyPdfCode}
                  title="Click to copy"
                >
                  <motion.span
                    className="code-reveal__digits"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {pdfCode.split('').map((digit, i) => (
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
                    {pdfCopied ? (
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
                key="upload"
                className="share__editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className={`dropzone ${isDragOver ? 'dropzone--active' : ''} ${pdfPreview ? 'dropzone--has-file' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                  aria-label="Upload PDF"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={onPdfChange}
                    className="dropzone__input"
                    hidden
                  />

                  {pdfPreview ? (
                    <div className="dropzone__preview dropzone__preview--pdf">
                      <iframe src={pdfPreview} title="PDF preview" />
                      <div className="dropzone__overlay">
                        <span>Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="dropzone__placeholder">
                      <div className="dropzone__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </div>
                      <div className="dropzone__text">
                        <span className="dropzone__title">Drop a PDF here</span>
                        <span className="dropzone__hint">or click to browse</span>
                      </div>
                    </div>
                  )}
                </div>

                {pdfError && (
                  <motion.p
                    className="share__error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {pdfError}
                  </motion.p>
                )}

                <div className="editor-actions">
                  <button
                    className="btn btn--primary"
                    onClick={uploadPdf}
                    disabled={pdfLoading || !pdfFile}
                  >
                    {pdfLoading ? (
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
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Share PDF
                      </>
                    )}
                  </button>
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
                onClick={() => window.location.href = '/sharePage'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Text
              </button>
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
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PdfSharePage;