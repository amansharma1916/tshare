import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { orgEndpoints } from '../../api/orgEndpoints';
import { getOrgAuth, orgAuthHeaders } from '../org/orgAuth';
import '../org/OrgDashboard.css';
import './OrgDashboardPreview.css';
import DocxPreview from './DocxPreview';

const ease = [0.16, 1, 0.3, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -40px 0px' },
  transition: { duration: 0.55, delay, ease },
});

const Icon = ({ name, size = 18 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'text':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h10M4 18h7" />
        </svg>
      );
    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case 'file':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...common}>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case 'refresh':
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'download':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'external':
      return (
        <svg {...common}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    case 'qr':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    default:
      return null;
  }
};

const StatCard = ({ label, value, icon, delay }) => (
  <motion.div className="org-dash__stat" {...fadeUp(delay)}>
    <span className="org-dash__stat-icon"><Icon name={icon} size={20} /></span>
    <div>
      <div className="org-dash__stat-value">{value}</div>
      <div className="org-dash__stat-label">{label}</div>
    </div>
  </motion.div>
);

// ── File preview helpers ──────────────────────────────────
// Classifies a file into a preview category based on its extension & MIME type.
// 'image'   → render with <img>
// 'pdf'     → render with <iframe> (browsers have a built-in PDF viewer)
// 'text'    → render with <iframe> (browser renders text/plain inline)
// 'document'→ render with Google Docs Viewer (Office / OpenDocument)
// 'other'   → fallback: icon + download button only
const FILE_IMAGE_RE = /\.(jpe?g|png|gif|bmp|webp|avif|svg|ico|tiff?|heic?)$/i;
const FILE_TEXT_RE = /\.(txt|md|csv|json|js|jsx|ts|tsx|py|java|c|cpp|cc|cxx|h|hpp|rb|php|go|rs|swift|kt|kts|scala|lua|pl|pm|sh|bash|zsh|fish|html?|css|scss|sass|less|xml|yaml|yml|toml|ini|cfg|conf|sql|graphql|gql|proto|makefile|dockerfile|env|gitignore|log)$/i;
const FILE_DOC_RE = /\.(doc|docx|xls|xlsx|ppt|pptx|odt|ods|odp|rtf)$/i;

const getFilePreviewType = (originalName, mimeType) => {
  const name = (originalName || '').toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  if (mime.startsWith('image/') || FILE_IMAGE_RE.test(name)) return 'image';
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (mime.startsWith('text/') || FILE_TEXT_RE.test(name)) return 'text';
  if (
    mime.includes('word') || mime.includes('excel') || mime.includes('powerpoint') ||
    mime.includes('spreadsheet') || mime.includes('presentation') ||
    mime.includes('opendocument') || mime === 'application/rtf' ||
    FILE_DOC_RE.test(name)
  ) return 'document';

  return 'other';
};

// Builds a third-party Office viewer URL for previewing MS Office documents
// (.doc/.docx/.xls/.xlsx/.ppt/.pptx) and other document files (.odt/.ods/.odp/.rtf).
// Uses the Microsoft Office Online viewer, which reliably renders .docx etc. and
// provides a built-in Print button. The src points at the backend preview proxy
// (same-origin, inline, stable) when an id exists — external viewers fetch a
// consistent endpoint instead of hitting Cloudinary directly — and falls back to
// the raw file URL otherwise.
const getOfficePreviewUrl = (file) => {
  const src = file?.id ? orgEndpoints.previewData(file.id) : (file?.url || '');
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(src)}`;
};

// True when the file is a Word .docx (default ~= the MS Office Open XML word format).
// These are rendered client-side with DocxPreview because they're the common case
// for orgs (xerox/shops) and reliable everywhere, unlike third-party viewers.
const DOCX_RE = /\.docx$/i;
const isDocxFile = (file) =>
  DOCX_RE.test(file?.originalName || '') ||
  /wordprocessingml/.test(file?.mimeType || '');

// Renders an inline preview for a file item in the org dashboard preview pane.
// Uses the backend proxy endpoint (like RecievePage does) which sets
// Content-Disposition: inline so the browser renders PDFs instead of downloading them.
const renderFilePreview = (file) => {
  if (!file.id) {
    return <span className="org-dash__file-icon"><Icon name="file" size={48} /></span>;
  }

  const type = getFilePreviewType(file.originalName, file.mimeType);

  switch (type) {
    case 'image':
      // Images live in a private R2 bucket, so load via the backend proxy. The
      // proxy renders JPEG/PNG as a PDF and other formats as the raw image.
      return <iframe src={orgEndpoints.previewData(file.id)} title="Image Preview" className="org-dash__preview-iframe" />;

    case 'pdf':
    case 'text':
      // Use backend proxy for PDFs and text files so Content-Disposition: inline
      // is set correctly (browsers render these natively instead of downloading).
      return (
        <iframe
          src={orgEndpoints.previewData(file.id)}
          title={type === 'pdf' ? 'PDF Preview' : 'Text Preview'}
          className="org-dash__preview-iframe"
        />
      );

    case 'document': {
      // .docx renders client-side (works offline / localhost — no third-party fetch).
      if (isDocxFile(file)) {
        return <DocxPreview file={file} />;
      }
      // Other office docs (xls/xlsx/ppt/pptx/odt/rtf): best-effort via Microsoft
      // Office Online viewer.
      return <iframe src={getOfficePreviewUrl(file)} title="Document Preview" className="org-dash__preview-iframe" />;
    }

    default:
      // Unsupported binary types — show icon only; download button is separate.
      return <span className="org-dash__file-icon"><Icon name="file" size={48} /></span>;
  }
};

const OrgDashboard = () => {
  const { token, name } = getOrgAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [qr, setQr] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({ total: 0, text: 0, image: 0, file: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const searchDebounceRef = useRef(null);
  const searchQueryRef = useRef(searchQuery);
  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);

  const cursorRef = useRef(cursor);
  useEffect(() => { cursorRef.current = cursor; }, [cursor]);

  const [searchCursor, setSearchCursor] = useState(null);
  const searchCursorRef = useRef(null);
  useEffect(() => { searchCursorRef.current = searchCursor; }, [searchCursor]);

  const load = useCallback(async (loadMore = false, isSearch = false) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      if (isSearch) {
        setSearchCursor(null);
      } else {
        setCursor(null);
      }
    }
    setError('');
    try {
      const headers = { ...orgAuthHeaders(token) };
      const params = new URLSearchParams();
      params.set('limit', '10');
      const activeCursor = isSearch ? searchCursorRef.current : cursorRef.current;
      if (loadMore && activeCursor) params.set('cursor', activeCursor);
      if (filter !== 'all') params.set('type', filter);
      if (isSearch && searchQueryRef.current.trim()) params.set('q', searchQueryRef.current.trim());

      const endpoint = isSearch ? orgEndpoints.searchDashboard : orgEndpoints.dashboard;
      const [res, qrRes] = await Promise.all([
        fetch(`${endpoint}?${params.toString()}`, { headers }),
        fetch(orgEndpoints.qr, { headers }),
      ]);

      if (res.status === 401 || qrRes.status === 401) {
        setError('Session expired. Please login again.');
        return;
      }

      const data = await res.json();
      if (data.success) {
        if (isSearch) {
          setSearchMode(true);
          if (loadMore) {
            setSearchResults((prev) => [...prev, ...(data.items || [])]);
          } else {
            setSearchResults(data.items || []);
          }
          setSearchCursor(data.nextCursor);
        } else {
          if (loadMore) {
            setItems((prev) => [...prev, ...(data.items || [])]);
          } else {
            setItems(data.items || []);
          }
          setCursor(data.nextCursor);
          setSearchMode(false);
        }
        setHasMore(data.hasMore);
        setStats(data.stats || { total: 0, text: 0, image: 0, file: 0 });
      } else {
        setError(data.message || 'Failed to load');
      }

      const qrData = await qrRes.json();
      if (qrData.success) setQr(qrData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [token, filter]);

  const loadSearch = useCallback((loadMore = false) => load(loadMore, true), [load]);

  useEffect(() => {
    if (!token) return;
    if (searchQueryRef.current.trim()) {
      loadSearch(false); // filter change while searching
    } else {
      load(false);
    }
    // Not depending on searchQuery: typing is handled by handleSearchInput's
    // debounce to avoid double requests and stale-closure fetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filter]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    searchQueryRef.current = val;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (val.trim()) {
      searchDebounceRef.current = setTimeout(() => {
        setSearchCursor(null);
        loadSearch(false);
      }, 300);
    } else {
      setSearchMode(false);
      setSearchResults([]);
      load(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchQueryRef.current = '';
    setSearchMode(false);
    setSearchResults([]);
    setSearchCursor(null);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    load(false);
  };

  const handleSearchLoadMore = () => {
    loadSearch(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };





  const handleDownloadFile = async () => {
    if (!selectedItem?.id) return;
    setError('');
    try {
      const res = await fetch(orgEndpoints.previewData(selectedItem.id), {
        headers: { ...orgAuthHeaders(token) },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedItem.originalName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadImage = async () => {
    if (!selectedItem?.id) return;
    setError('');
    try {
      // Download the ORIGINAL image file via the dedicated download endpoint.
      const res = await fetch(orgEndpoints.downloadData(selectedItem.id), {
        headers: { ...orgAuthHeaders(token) },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedItem.originalName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError('');
    try {
      const res = await fetch(orgEndpoints.deleteData(id), {
        method: 'DELETE',
        headers: { ...orgAuthHeaders(token) },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedId((prev) => (prev === id ? null : prev));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId('');
    }
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const preview = (item) => {
    if (item.dataType === 'text') return item.text || '—';
    return item.originalName || item.url || '—';
  };

  const copyLink = () => {
    if (!qr) return;
    navigator.clipboard?.writeText(qr.qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };



  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setShowQrModal(false);
    };
    if (showQrModal) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [showQrModal]);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedId) || null,
    [items, selectedId],
  );

  if (!token) {
    return (
      <div className="org-shell__inner">
        <div className="org-card" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <p>You are not signed in as an organization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="org-shell__inner">
      {error && (
        <motion.div className="org-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          {error}
        </motion.div>
      )}

      {/* Top bar */}
      <motion.div className="org-dash__topbar" {...fadeUp(0)}>
        <div>
          <h1 className="org-dash__name">{name || 'Your organization'}</h1>
          <p className="org-dash__code">
            Public code: <span className="org-dash__mono">{qr?.orgCode || '—'}</span>
          </p>
        </div>
        <div className="org-dash__topbar-actions">
          <button
            className="org-dash__qr-trigger"
            onClick={() => setShowQrModal(true)}
            type="button"
            aria-label="Show QR code and link"
            title="QR & link"
          >
            <Icon name="qr" size={18} />
          </button>
          <div className="org-dash__search-wrap">
            <input
              className="org-dash__search-input"
              type="text"
              placeholder="Search by name or code…"
              value={searchQuery}
              onChange={handleSearchInput}
            />
            {searchQuery && (
              <button className="org-dash__search-clear" onClick={clearSearch} type="button" aria-label="Clear search">×</button>
            )}
          </div>
          <button className="org-dash__refresh" onClick={handleRefresh} disabled={refreshing || loading} type="button">
            <Icon name="refresh" size={16} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div className="org-dash__stats" {...fadeUp(0.06)}>
        <StatCard label="Total" value={stats.total} icon="text" delay={0.08} />
        <StatCard label="Text" value={stats.text} icon="text" delay={0.12} />
        <StatCard label="Images" value={stats.image} icon="image" delay={0.16} />
        <StatCard label="Files" value={stats.file} icon="file" delay={0.2} />
      </motion.div>

      {/* Split: Left column + Right preview */}
      <motion.div className="org-dash__split" {...fadeUp(0.1)}>
        {/* Left: Filters + List */}
        <div className="org-dash__left">
          {/* Filters */}
          <motion.div className="org-dash__filters" {...fadeUp(0.14)}>
            <div className="org-dash__filter-pills">
              {[
                { key: 'all', label: 'All' },
                { key: 'text', label: 'Text' },
                { key: 'image', label: 'Images' },
                { key: 'file', label: 'Files' },
              ].map((f) => (
                <button
                  key={f.key}
                  className={`org-dash__pill ${filter === f.key ? 'org-dash__pill--active' : ''}`}
                  onClick={() => setFilter(f.key)}
                  type="button"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* List */}
          <motion.div className="org-card org-dash__list-card" {...fadeUp(0.18)}>
            <div className="org-dash__list-head">
              <div>
                <h2 className="org-card__title">
                  {searchMode ? 'Search results' : 'Incoming submissions'}
                </h2>
                <p className="org-card__desc">
                  {searchMode
                    ? `Found ${stats.total} result${stats.total === 1 ? '' : 's'} for "${searchQuery}"`
                    : (filter === 'all' ? 'Newest first' : `Only ${filter}`) + ` · ${stats.total} item${stats.total === 1 ? '' : 's'}`
                  }
                </p>
              </div>
            </div>

            {loading ? (
              <div className="org-dash__loading">
                <div className="org-dash__spinner" />
                <p>Loading submissions…</p>
              </div>
            ) : (searchMode ? searchResults : items).length === 0 ? (
              <div className="org-dash__empty">
                <Icon name={searchMode ? 'file' : 'text'} size={32} />
                {searchMode ? (
                  <>
                    <p>No matches for "{searchQuery}".</p>
                    <span>Try a different file name or 4-digit reference code.</span>
                  </>
                ) : (
                  <>
                    <p>Nothing here yet.</p>
                    <span>Share your QR and submissions will show up here.</span>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="org-dash__list">
                  {(searchMode ? searchResults : items).map((item) => (
                    <motion.div
                      key={item.id}
                      className={`org-dash__item ${selectedId === item.id ? 'org-dash__item--selected' : ''}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease }}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <span className={`org-dash__badge org-dash__badge--${item.dataType}`}>
                        <Icon name={item.dataType} size={14} />
                        {item.dataType}
                      </span>

                      <div className="org-dash__item-primary" title={preview(item)}>
                        {item.dataType === 'image' && item.id ? (
                          <img src={orgEndpoints.previewDataRaw(item.id)} alt="" className="org-dash__thumb" />
                        ) : item.dataType === 'file' ? (
                          <span className="org-dash__file-icon"><Icon name="file" size={18} /></span>
                        ) : (
                          <span className="org-dash__text-icon"><Icon name="text" size={18} /></span>
                        )}
                        <div className="org-dash__item-text">
                          <div className="org-dash__item-title">{preview(item)}</div>
                          <div className="org-dash__item-meta">
                            {item.submissionCode && <span className="org-dash__refcode">#{item.submissionCode}</span>}
                            <>{formatTime(item.createdAt)} {item.senderName && <><span>· </span><span className="org-dash__sender">{item.senderName}</span></>}</>
                            {' '}{(item.dataType === 'image' || item.dataType === 'file') && item.size ? <span>· {(item.size / 1024).toFixed(1)} KB</span> : ''}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {(searchMode ? searchResults.length < stats.total : hasMore) && (
                  <button
                    className="org-dash__load-more"
                    onClick={() => searchMode ? handleSearchLoadMore() : load(true)}
                    disabled={loadingMore}
                    type="button"
                  >
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Right: Preview */}
        <div className="org-dash__preview">
          {selectedItem ? (
            <motion.div
              className="org-dash__preview-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease }}
            >
              <div className="org-dash__preview-head">
                <span className={`org-dash__badge org-dash__badge--${selectedItem.dataType}`}>
                  <Icon name={selectedItem.dataType} size={14} />
                  {selectedItem.dataType}
                </span>
                <div className="org-dash__preview-actions">
                  {(selectedItem.dataType === 'image' || selectedItem.dataType === 'file') && selectedItem.id && (
                    <a className="org-btn org-btn--ghost" href={orgEndpoints.previewData(selectedItem.id)} target="_blank" rel="noreferrer">
                      <Icon name="external" size={14} /> Open
                    </a>
                  )}
                  <button
                    className="org-btn org-btn--danger"
                    type="button"
                    disabled={deletingId === selectedItem.id}
                    onClick={() => handleDelete(selectedItem.id)}
                  >
                    <Icon name="trash" size={14} />
                    {deletingId === selectedItem.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>

              <div className="org-dash__preview-body">
                {selectedItem.dataType === 'text' && (
                  <div className="org-dash__preview-text">
                    {selectedItem.text || 'No content'}
                  </div>
                )}
                {selectedItem.dataType === 'image' && (
                  <div className="org-dash__preview-file">
                    <div className="org-dash__file-preview-area">
                      {renderFilePreview(selectedItem)}
                    </div>
                    <div className="org-dash__file-meta-row">
                      <div className="org-dash__file-name">{selectedItem.originalName || 'Image'}</div>
                      <div className="org-dash__file-meta">
                        {selectedItem.size && <span>{(selectedItem.size / 1024).toFixed(1)} KB </span>}
                        {selectedItem.senderName && <><span>· </span><span className="org-dash__sender">{selectedItem.senderName}</span></>}
                      </div>
                    </div>
                    {selectedItem.url && (
                      <button className="org-btn org-btn--ghost" onClick={handleDownloadImage} type="button">
                        <Icon name="download" size={16} /> Download
                      </button>
                    )}
                  </div>
                )}
                {selectedItem.dataType === 'file' && (
                  <div className="org-dash__preview-file">
                    <div className="org-dash__file-preview-area">
                      {renderFilePreview(selectedItem)}
                    </div>
                    <div className="org-dash__file-meta-row">
                      <div className="org-dash__file-name">{selectedItem.originalName || 'File'}</div>
                      <div className="org-dash__file-meta">
                        {selectedItem.size && <span>{(selectedItem.size / 1024).toFixed(1)} KB </span>}
                        {selectedItem.senderName && <><span>· </span><span className="org-dash__sender">{selectedItem.senderName}</span></>}
                      </div>
                    </div>
                    {selectedItem.url && (
                      <button className="org-btn org-btn--ghost" onClick={handleDownloadFile} type="button">
                        <Icon name="download" size={16} /> Download
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="org-dash__preview-meta">
                <span>Received {formatTime(selectedItem.createdAt)}</span>
                {selectedItem.senderName && <><span>· </span><span className="org-dash__sender">{selectedItem.senderName}</span></>}
              </div>
            </motion.div>
          ) : (
            <div className="org-dash__preview-empty">
              <Icon name="text" size={36} />
              <p>Select an item to preview</p>
              <span>Click any submission on the left to view its content here.</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* QR Modal */}
      {showQrModal && qr && (
        <div className="org-dash__modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="org-dash__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="QR code and link">
            <div className="org-dash__modal-head">
              <h3 className="org-card__title">Your QR & link</h3>
              <button className="org-dash__modal-close" onClick={() => setShowQrModal(false)} type="button" aria-label="Close">
                &times;
              </button>
            </div>
            <p className="org-card__desc">Scan or share this so customers can send you content.</p>
            <div className="org-dash__qr-visual">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=${encodeURIComponent(qr.qrUrl || '')}`}
                alt="Organization QR code"
                width="160"
                height="160"
                className="org-dash__qr-img"
              />
            </div>
            <p className="org-dash__qr-url">{qr.qrUrl}</p>
            <div className="org-dash__qr-actions">
              <a className="org-btn org-btn--ghost" href={qr.qrUrl} target="_blank" rel="noreferrer">
                <Icon name="external" size={16} /> Open
              </a>
              <button className="org-btn org-btn--ghost" onClick={copyLink} type="button">
                <Icon name={copied ? 'qr' : 'copy'} size={16} />
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgDashboard;
