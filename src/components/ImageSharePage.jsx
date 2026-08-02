import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ImageSharePage.css';
import { endpoints } from '../api/api';
import UsernamePopup from './auth/UsernamePopup';
import { useLayout } from './layout/LayoutContext';

const ImageSharePage = () => {
  const navigate = useNavigate();
  const { insideLayout } = useLayout();
  const [imageCode, setImageCode] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [imageError, setImageError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupError, setPopupError] = useState('');
  const [popupSubmitting, setPopupSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  };

  const onImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      setImageError('');
      setShowCode(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImageError('');
      setShowCode(false);
    } else {
      setImageError('Please drop a valid image file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const uploadImage = () => {
    if (!imageFile) {
      setImageError('Please select an image file');
      return;
    }

    const username = localStorage.getItem('tshare_username');
    if (!username) {
      setPopupError('');
      setPopupOpen(true);
      return;
    }

    doUploadImage(username);
  };

  const doUploadImage = (username) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('username', username);

    setImageLoading(true);
    setImageError('');

    return fetch(endpoints.uploadImage, {
      method: 'POST',
      body: formData
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || 'Failed to upload image') });
        }
        return res.json();
      })
      .then(data => {
        if (!data.success) {
          throw new Error(data.message || 'Failed to upload image');
        }
        const newCode = String(data.id);
        setImageCode(newCode);
        setShowCode(true);
      })
      .catch(error => {
        console.error('Error:', error);
        setImageError(error.message || 'Failed to upload image');
        throw error;
      })
      .finally(() => {
        setImageLoading(false);
      });
  };

  const handleUsernameSubmit = (username) => {
    setPopupError('');
    setPopupSubmitting(true);
    doUploadImage(username)
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
    doUploadImage('');
  };

  const copyImageCode = () => {
    if (!imageCode) return;
    navigator.clipboard.writeText(imageCode)
      .then(() => {
        setImageCopied(true);
        setTimeout(() => setImageCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  const handleShareAnother = () => {
    setShowCode(false);
    setImageCode('');
    setImageFile(null);
    setImagePreview('');
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleClear = () => {
    setImageFile(null);
    setImagePreview('');
    setImageError('');
  };

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
            <div className="share__header-icon share__header-icon--image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <h1 className="share__title">Share an Image</h1>
            <p className="share__desc">Upload an image and get a 4-digit code to share instantly.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {showCode && imageCode ? (
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
                  Image Code Generated
                </div>
                <button
                  className="code-reveal__value"
                  onClick={copyImageCode}
                  title="Click to copy"
                >
                  <motion.span
                    className="code-reveal__digits"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {imageCode.split('').map((digit, i) => (
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
                    {imageCopied ? (
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
                  {imageCopied ? 'Copied to clipboard!' : 'Click the code to copy it'}
                </p>
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
                key="upload"
                className="share__editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="editor-wrapper">
                  <div
                    className={`dropzone ${isDragOver ? 'dropzone--active' : ''} ${imagePreview ? 'dropzone--has-file' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                    aria-label="Upload image"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onImageChange}
                      className="dropzone__input"
                      hidden
                    />

                    {imagePreview ? (
                      <div className="dropzone__preview">
                        <img src={imagePreview} alt="Selected preview" />
                        <div className="dropzone__overlay">
                          <span>Click to change</span>
                        </div>
                      </div>
                    ) : (
                      <div className="dropzone__placeholder">
                        <div className="dropzone__icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <div className="dropzone__text">
                          <span className="dropzone__title">Drop an image here</span>
                          <span className="dropzone__hint">or click to browse</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {imageFile && (
                    <div className="dropzone__file-info">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="dropzone__file-name">{imageFile.name}</span>
                      <span className="dropzone__file-size">{formatFileSize(imageFile.size)}</span>
                    </div>
                  )}

                  {imageError && (
                    <motion.p
                      className="share__error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {imageError}
                    </motion.p>
                  )}

                  <div className="editor-actions">
                    <button
                      className="editor-clear-btn"
                      onClick={handleClear}
                      disabled={!imageFile || imageLoading}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      Clear
                    </button>
                    <button
                      className="btn btn--primary editor-share-btn"
                      onClick={uploadImage}
                      disabled={imageLoading || !imageFile}
                    >
                      {imageLoading ? (
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
                          Uploading...
                        </span>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          Share Image
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
                onClick={() => navigate('/share')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Text
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

export default ImageSharePage;