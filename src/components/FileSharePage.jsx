import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FileSharePage.css';
import { endpoints } from '../api/api';
import UsernamePopup from './auth/UsernamePopup';

const FileSharePage = () => {
  const [fileCode, setFileCode] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileCopied, setFileCopied] = useState(false);
  const [fileError, setFileError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupError, setPopupError] = useState('');
  const [popupSubmitting, setPopupSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (file) => {
    if (!file) return null;
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'pdf';
    if (type.startsWith('text/') || name.endsWith('.md') || name.endsWith('.csv')) return 'text';
    if (type.includes('spreadsheet') || type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) return 'spreadsheet';
    if (type.includes('presentation') || type.includes('powerpoint') || name.endsWith('.ppt') || name.endsWith('.pptx')) return 'presentation';
    if (type.includes('word') || type.includes('document') || name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.odt')) return 'document';
    if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('7z') || type.includes('gzip') || name.endsWith('.gz') || name.endsWith('.bz2')) return 'archive';
    if (type.includes('json') || type.includes('xml') || type.includes('yaml') || type.includes('yml') || type.includes('toml') || type.includes('ini')) return 'code';
    if (type.includes('javascript') || type.includes('python') || type.includes('java') || type.includes('typescript') || type.includes('c+') || type.includes('c++') || type.includes('c#') || type.includes('ruby') || type.includes('php') || type.includes('go') || type.includes('rust') || type.includes('swift') || type.includes('kotlin') || type.includes('dart') || type.includes('lua') || type.includes('perl') || type.includes('haskell') || type.includes('scala') || type.includes('julia') || type.includes('r') || type.includes('matlab') || type.includes('sql') || name.endsWith('.py') || name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.java') || name.endsWith('.cpp') || name.endsWith('.c') || name.endsWith('.cs') || name.endsWith('.rb') || name.endsWith('.php') || name.endsWith('.go') || name.endsWith('.rs') || name.endsWith('.swift') || name.endsWith('.kt') || name.endsWith('.dart') || name.endsWith('.lua') || name.endsWith('.pl') || name.endsWith('.hs') || name.endsWith('.scala') || name.endsWith('.jl') || name.endsWith('.r') || name.endsWith('.m') || name.endsWith('.sql') || name.endsWith('.sh') || name.endsWith('.bash') || name.endsWith('.zsh')) return 'code';
    return 'generic';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (!file) {
      setFilePreview('');
      return;
    }
    // Clean up preview on unmount / file change
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [file]);

  const onFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setFileError('Images cannot be uploaded here. Use the Image share page instead.');
        return;
      }
      setFile(selectedFile);
      setFileError('');
      setShowCode(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type.startsWith('image/')) {
        setFileError('Images cannot be uploaded here. Use the Image share page instead.');
        return;
      }
      setFile(droppedFile);
      setFileError('');
      setShowCode(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const uploadFile = () => {
    if (!file) {
      setFileError('Please select a file');
      return;
    }

    const username = localStorage.getItem('tshare_username');
    if (!username) {
      setPopupError('');
      setPopupOpen(true);
      return;
    }

    doUploadFile(username);
  };

  const doUploadFile = (username) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);

    setFileLoading(true);
    setFileError('');

    return fetch(endpoints.uploadFile, {
      method: 'POST',
      body: formData
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || 'Failed to upload file') });
        }
        return res.json();
      })
      .then(data => {
        if (!data.success) {
          throw new Error(data.message || 'Failed to upload file');
        }
        const newCode = String(data.id);
        setFileCode(newCode);
        setShowCode(true);
      })
      .catch(error => {
        console.error('Error:', error);
        setFileError(error.message || 'Failed to upload file');
        throw error;
      })
      .finally(() => {
        setFileLoading(false);
      });
  };

  const handleUsernameSubmit = (username) => {
    setPopupError('');
    setPopupSubmitting(true);
    doUploadFile(username)
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
    doUploadFile('');
  };

  const copyFileCode = () => {
    if (!fileCode) return;
    navigator.clipboard.writeText(fileCode)
      .then(() => {
        setFileCopied(true);
        setTimeout(() => setFileCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  const fileIcon = getFileIcon(file);

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
            <h1 className="share__title">Share a File</h1>
            <p className="share__desc">Upload any file and get a code to share instantly. Supports documents, code, archives, and more.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {showCode && fileCode ? (
              <motion.div
                key="code"
                className="code-reveal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="code-reveal__badge">File Code Generated</div>
                <button
                  className="code-reveal__value"
                  onClick={copyFileCode}
                  title="Click to copy"
                >
                  <motion.span
                    className="code-reveal__digits"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {fileCode.split('').map((digit, i) => (
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
                    {fileCopied ? (
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
                  className={`dropzone ${isDragOver ? 'dropzone--active' : ''} ${file ? 'dropzone--has-file' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                  aria-label="Upload file"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={onFileChange}
                    className="dropzone__input"
                    hidden
                  />

                  {file ? (
                    <div className="dropzone__preview dropzone__preview--file">
                      <div className="file-preview__info">
                        <div className="file-preview__icon">
                          {fileIcon === 'image' && (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          )}
                          {fileIcon === 'pdf' && (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                          )}
                          {fileIcon === 'document' && (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                          )}
                          {fileIcon === 'spreadsheet' && (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                          )}
                          {fileIcon === 'archive' && (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 8v13H3V8" />
                              <path d="M1 3h22v5H1z" />
                              <line x1="10" y1="12" x2="14" y2="12" />
                            </svg>
                          )}
                          {fileIcon === 'code' && (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="16 18 22 12 16 6" />
                              <polyline points="8 6 2 12 8 18" />
                            </svg>
                          )}
                          {fileIcon === 'text' && (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                          )}
                          {fileIcon === 'generic' && (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                              <polyline points="13 2 13 9 20 9" />
                            </svg>
                          )}
                        </div>
                        <div className="file-preview__details">
                          <span className="file-preview__name">{file.name}</span>
                          <span className="file-preview__size">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      <div className="dropzone__overlay">
                        <span>Click to change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="dropzone__placeholder">
                      <div className="dropzone__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                          <path d="M12 12v6" />
                          <path d="M9 15l3 3 3-3" />
                        </svg>
                      </div>
                      <div className="dropzone__text">
                        <span className="dropzone__title">Drop a file here</span>
                        <span className="dropzone__hint">or click to browse — up to 50MB</span>
                      </div>
                    </div>
                  )}
                </div>

                {fileError && (
                  <motion.p
                    className="share__error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {fileError}
                  </motion.p>
                )}

                <div className="editor-actions">
                  <button
                    className="btn btn--primary"
                    onClick={uploadFile}
                    disabled={fileLoading || !file}
                  >
                    {fileLoading ? (
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
                        Share File
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

export default FileSharePage;