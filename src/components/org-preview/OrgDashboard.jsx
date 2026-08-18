import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { orgEndpoints } from '../../api/orgEndpoints';
import { getOrgAuth, orgAuthHeaders } from '../org/orgAuth.js';
import useOrgPrint from './useOrgPrint';
import OrgPrintQueue from './OrgPrintQueue';
import '../org/OrgDashboard.css';
import './OrgDashboardPreview.css';

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
    case 'printer':
      return (
        <svg {...common}>
          <path d="M6 9V2h12v7" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" rx="1" />
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
// Renders an inline preview for a file item in the org dashboard preview pane.
// Files live behind the org-JWT-protected proxy (see orgPreviewRoute.js), so a
// plain <iframe src> gets a 401 — we fetch with the auth header and hand the
// preview a blob URL instead. The backend proxy sets Content-Disposition: inline
// so browsers render PDFs natively instead of downloading them.
const FilePreview = ({ file, token }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    setUrl('');
    if (!file?.id) return undefined;
    fetch(orgEndpoints.previewData(file.id), { headers: orgAuthHeaders(token) })
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error('Preview failed'))))
      .then((blob) => { if (!cancelled) setUrl(URL.createObjectURL(blob)); })
      .catch(() => { if (!cancelled) setUrl(''); });
    return () => { cancelled = true; };
  }, [file?.id, token]);

  if (!file?.id) {
    return <span className="org-dash__file-icon"><Icon name="file" size={48} /></span>;
  }
  return <iframe src={url || ''} title="Preview" className="org-dash__preview-iframe" />;
};

// Authenticated thumbnail (preview ?raw=1) for the submissions list.
const AuthThumb = ({ file, token }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    setUrl('');
    if (!file?.id) return undefined;
    fetch(orgEndpoints.previewDataRaw(file.id), { headers: orgAuthHeaders(token) })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => { if (!cancelled && blob) setUrl(URL.createObjectURL(blob)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [file?.id, token]);

  if (!url) return null;
  return <img src={url} alt="" className="org-dash__thumb" />;
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
  // Blob URL handed to the "Open in new tab" window (kept so it can be revoked).
  const openBlobUrlRef = useRef(null);

  const cursorRef = useRef(cursor);
  useEffect(() => { cursorRef.current = cursor; }, [cursor]);

  const [searchCursor, setSearchCursor] = useState(null);
  const searchCursorRef = useRef(null);
  useEffect(() => { searchCursorRef.current = searchCursor; }, [searchCursor]);

  // Preview conversion status for the selected item ('pending' / 'ready' / ...).
  const [previewStatus, setPreviewStatus] = useState('na');
  const previewPollRef = useRef(null);

  // Auto Print: toggle state + live print queue (see useOrgPrint).
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(false);
  const {
    queue: printQueue,
    loading: printLoading,
    socketOnline: printSocketOnline,
    toggleAutoPrint,
    moveJob: movePrintJob,
    cancelJob: cancelPrintJob,
    retryJob: retryPrintJob,
  } = useOrgPrint(token);

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
      if (qrData.success) {
        setQr(qrData);
        setAutoPrintEnabled(Boolean(qrData.autoPrint && qrData.autoPrint.enabled));
      }
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
      }, 600);
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

  const handleAutoPrintToggle = async () => {
    const next = !autoPrintEnabled;
    setAutoPrintEnabled(next); // optimistic
    const result = await toggleAutoPrint(next);
    if (!result.success) setAutoPrintEnabled(!next);
  };

  // Open the submission in a new tab. The preview proxy is org-JWT protected,
  // so a plain link 401s — fetch with the auth header, then open a blob URL.
  const handleOpenInNewTab = async () => {
    if (!selectedItem?.id) return;
    setError('');
    try {
      const res = await fetch(orgEndpoints.previewData(selectedItem.id), {
        headers: { ...orgAuthHeaders(token) },
      });
      if (!res.ok) throw new Error('Open failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (openBlobUrlRef.current) URL.revokeObjectURL(openBlobUrlRef.current);
      openBlobUrlRef.current = url;
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      setError(err.message);
    }
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
    () =>
      items.find((i) => i.id === selectedId) ||
      searchResults.find((i) => i.id === selectedId) ||
      null,
    [items, searchResults, selectedId],
  );

  // Poll the preview conversion status for the selected image/file. Start polling
  // whenever the item is pending (or a legacy 'na' that will lazy-backfill), stop
  // once it reaches 'ready' / 'failed' / still-'na' (non-convertible).
  useEffect(() => {
    if (previewPollRef.current) { clearTimeout(previewPollRef.current); previewPollRef.current = null; }
    setPreviewStatus(selectedItem?.pdfStatus || 'na');
    if (!selectedItem || selectedItem.dataType === 'text' || !selectedItem.id) return undefined;

    const doPoll = async () => {
      try {
        const res = await fetch(orgEndpoints.previewStatus(selectedItem.id), { headers: orgAuthHeaders(token) });
        const data = await res.json();
        const s = (data && data.pdfStatus) || 'na';
        setPreviewStatus(s);
        if (s === 'pending') previewPollRef.current = setTimeout(doPoll, 2000);
      } catch (err) {
        previewPollRef.current = setTimeout(doPoll, 3000);
      }
    };

    const s0 = selectedItem.pdfStatus || 'na';
    // 'pending' = converting; 'na' = maybe legacy that /status will backfill.
    if (s0 === 'pending' || s0 === 'na') previewPollRef.current = setTimeout(doPoll, 400);

    return () => { if (previewPollRef.current) clearTimeout(previewPollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.id, selectedItem?.pdfStatus]);

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
            className={`org-dash__autoprint ${autoPrintEnabled ? 'org-dash__autoprint--on' : ''}`}
            onClick={handleAutoPrintToggle}
            type="button"
            aria-pressed={autoPrintEnabled}
            title={autoPrintEnabled ? 'Auto Print is ON — new files print automatically' : 'Auto Print is OFF'}
          >
            <Icon name="printer" size={17} />
            Auto Print {autoPrintEnabled ? 'ON' : 'OFF'}
          </button>
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

      {/* Print queue */}
      <OrgPrintQueue
        queue={printQueue.queue}
        history={printQueue.history}
        socketOnline={printSocketOnline}
        loading={printLoading}
        onMove={movePrintJob}
        onCancel={cancelPrintJob}
        onRetry={retryPrintJob}
      />

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
                        {item.dataType === 'image' && item.id && item.pdfStatus !== 'ready' ? (
                          <AuthThumb file={item} token={token} />
                        ) : item.dataType === 'file' || (item.dataType === 'image' && item.pdfStatus === 'ready') ? (
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
                    <button className="org-btn org-btn--ghost" onClick={handleOpenInNewTab} type="button">
                      <Icon name="external" size={14} /> Open
                    </button>
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
                      {previewStatus === 'pending' ? (
                        <div className="org-dash__converting">
                          <span className="org-dash__spinner" />
                          <p>Converting to PDF…</p>
                        </div>
                      ) : <FilePreview file={selectedItem} token={token} />}
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
                      {previewStatus === 'pending' ? (
                        <div className="org-dash__converting">
                          <span className="org-dash__spinner" />
                          <p>Converting to PDF…</p>
                        </div>
                      ) : <FilePreview file={selectedItem} token={token} />}
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
