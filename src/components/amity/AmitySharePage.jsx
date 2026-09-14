import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../ImageSharePage.css';
import './AmitySharePage.css';
import { endpoints } from '../../api/api';
import { useLayout } from '../layout/LayoutContext';
import {
  AMITY_MAX_FILE_MB,
  AMITY_MAX_IMAGE_MB,
  buildAmityUploadFile,
  isImageFile,
  isVideoFile,
} from '../../api/amityShare';

// Public upload funnel for the Amity team: visitors pick any photos / videos and
// send them in one go. Nothing here exposes a share code — the uploads are only
// meant to be reviewed from the admin panel's "Amity Shares" tab.
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

// Turn backend / network errors into something a visitor can act on.
const friendlyError = (message = '') => {
  const text = String(message);
  if (/not supported/i.test(text)) return 'This file type is not supported.';
  if (/too large|file size|limit/i.test(text)) return 'File is too large — please pick a smaller one.';
  if (/network|failed to fetch|connect/i.test(text)) return 'Network problem — please try again.';
  return text || 'Upload failed. Please try again.';
};

const AmitySharePage = () => {
  const { insideLayout } = useLayout();
  const [items, setItems] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Keeps the object URLs reachable for cleanup without re-running effects.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Release every preview URL when the visitor leaves the page.
  useEffect(() => () => {
    itemsRef.current.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }, []);

  const doneCount = items.filter((item) => item.status === 'done').length;
  const pendingCount = items.length - doneCount;
  const allDone = items.length > 0 && pendingCount === 0;
  const totalSize = useMemo(
    () => items.reduce((sum, item) => sum + (item.file?.size || 0), 0),
    [items]
  );

  const addFiles = (fileList) => {
    const picked = Array.from(fileList || []);
    if (!picked.length) return;

    setError('');
    const accepted = [];
    const rejected = [];

    picked.forEach((file) => {
      const image = isImageFile(file);
      const video = isVideoFile(file);

      if (!image && !video) {
        rejected.push(`${file.name} — only images and videos can be uploaded here`);
        return;
      }

      const maxMb = image ? AMITY_MAX_IMAGE_MB : AMITY_MAX_FILE_MB;
      if (file.size > maxMb * 1024 * 1024) {
        rejected.push(`${file.name} — larger than ${maxMb}MB`);
        return;
      }

      accepted.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isImage: image,
        isVideo: video,
        status: 'queued',
        error: '',
      });
    });

    if (accepted.length) setItems((prev) => [...prev, ...accepted]);
    if (rejected.length) setError(rejected.join(' • '));
  };

  const onInputChange = (event) => {
    addFiles(event.target.files);
    // Allow re-picking the same file after a removal.
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    addFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const removeItem = (id) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setItems([]);
    setError('');
  };

  // Images go to /image/upload, videos (and anything else) to /file/upload.
  // `validity: 'none'` keeps the uploads from expiring, and no username is sent
  // so they stay anonymous and never land in someone's share history.
  const uploadOne = async (entry) => {
    const payload = buildAmityUploadFile(entry.file);
    const formData = new FormData();
    formData.append(entry.isImage ? 'image' : 'file', payload);
    formData.append('validity', 'none');

    const response = await fetch(entry.isImage ? endpoints.uploadImage : endpoints.uploadFile, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Upload failed. Please try again.');
    }
    return data;
  };

  const uploadAll = async () => {
    const pending = itemsRef.current.filter((item) => item.status !== 'done');
    if (!pending.length) return;

    setError('');
    setUploading(true);

    for (const entry of pending) {
      setItems((prev) => prev.map((item) => (
        item.id === entry.id ? { ...item, status: 'uploading', error: '' } : item
      )));

      try {
        await uploadOne(entry);
        setItems((prev) => prev.map((item) => (
          item.id === entry.id ? { ...item, status: 'done', error: '' } : item
        )));
      } catch (err) {
        console.error('Amity upload error:', err);
        setItems((prev) => prev.map((item) => (
          item.id === entry.id ? { ...item, status: 'error', error: friendlyError(err.message) } : item
        )));
      }
    }

    setUploading(false);
  };

  const statusLabel = (item) => {
    if (item.status === 'uploading') return 'Uploading…';
    if (item.status === 'done') return 'Uploaded';
    if (item.status === 'error') return item.error || 'Failed';
    return 'Ready';
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
            <img src="/nextec.jpeg" alt="Nextec" className="amity-logo" />
            <span className="share__badge">
              <span className="share__badge-dot" />
              Amity · Photos &amp; videos
            </span>
            <h1 className="share__title">
              Send your <span className="share__title-grad">photos &amp; videos</span> to the Amity team
            </h1>
            <p className="share__desc">
              Pick any images or videos below and hit upload. Your files go straight to the Amity
              team.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {allDone && !uploading ? (
              <motion.div
                key="done"
                className="amity-success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="amity-success__icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="amity-success__title">
                  {doneCount === 1 ? 'Your file is on its way' : `All ${doneCount} files are on their way`}
                </h2>
                <p className="amity-success__desc">
                  Thanks! The Amity team has received your upload{doneCount === 1 ? '' : 's'}. You can
                  close this page or send more.
                </p>
                <button type="button" className="btn btn--primary editor-share-btn" onClick={clearAll}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  Upload more
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
                  <div className="image-card">
                    <div className="editor-bar">
                      <span className="editor-bar__dots" aria-hidden="true"><i /><i /><i /></span>
                      <span className="editor-bar__label">tshare / amity</span>
                      <span className="editor-bar__live">
                        <span className="editor-bar__pulse" />
                        image up to {AMITY_MAX_IMAGE_MB}MB · video up to {AMITY_MAX_FILE_MB}MB
                      </span>
                    </div>
                    <div
                      className={`dropzone ${isDragOver ? 'dropzone--active' : ''}`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => inputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
                      aria-label="Upload images or videos"
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={onInputChange}
                        className="dropzone__input"
                        hidden
                      />
                      <div className="dropzone__placeholder">
                        <div className="dropzone__icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <div className="dropzone__text">
                          <span className="dropzone__title">Drop photos or videos here</span>
                          <span className="dropzone__hint">or click to browse · select as many as you like</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {items.length > 0 && (
                  <div className="amity-list">
                    <div className="amity-list__head">
                      <span>{items.length} file{items.length === 1 ? '' : 's'} · {formatFileSize(totalSize)}</span>
                      {uploading && <span className="amity-list__progress">{doneCount} of {items.length} uploaded</span>}
                    </div>
                    <ul className="amity-list__items">
                      {items.map((item) => (
                        <li key={item.id} className={`amity-item amity-item--${item.status}`}>
                          <div className="amity-item__thumb">
                            {item.isImage ? (
                              <img src={item.previewUrl} alt={item.file.name} />
                            ) : (
                              <video src={item.previewUrl} muted playsInline preload="metadata" />
                            )}
                          </div>
                          <div className="amity-item__meta">
                            <span className="amity-item__name" title={item.file.name}>{item.file.name}</span>
                            <span className="amity-item__size">
                              {item.isVideo ? 'Video' : 'Image'} · {formatFileSize(item.file.size)}
                            </span>
                            <span className="amity-item__status">{statusLabel(item)}</span>
                          </div>
                          <button
                            type="button"
                            className="amity-item__remove"
                            onClick={() => removeItem(item.id)}
                            disabled={uploading}
                            title="Remove"
                            aria-label={`Remove ${item.file.name}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {error && (
                  <motion.p className="share__error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    {error}
                  </motion.p>
                )}

                <div className="editor-actions">
                  <button
                    type="button"
                    className="editor-clear-btn"
                    onClick={clearAll}
                    disabled={!items.length || uploading}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    Clear
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary editor-share-btn"
                    onClick={uploadAll}
                    disabled={uploading || !pendingCount}
                  >
                    {uploading ? (
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
                        Uploading…
                      </span>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {pendingCount ? `Upload ${pendingCount} file${pendingCount === 1 ? '' : 's'}` : 'Upload'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AmitySharePage;
