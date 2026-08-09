import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { orgEndpoints } from '../../api/orgEndpoints';
import { getOrgAuth, orgAuthHeaders } from './orgAuth';
import './OrgDashboard.css';

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
    case 'external':
      return (
        <svg {...common}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
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

const OrgDashboard = () => {
  const { token, name } = getOrgAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qr, setQr] = useState(null);
  const [showQr, setShowQr] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const pageSize = 8;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { ...orgAuthHeaders(token) };
      const [res, qrRes] = await Promise.all([
        fetch(orgEndpoints.dashboard, { headers }),
        fetch(orgEndpoints.qr, { headers }),
      ]);

      if (res.status === 401 || qrRes.status === 401) {
        setError('Session expired. Please login again.');
        return;
      }

      const data = await res.json();
      if (data.success) setItems(data.items || []);
      else setError(data.message || 'Failed to load');

      const qrData = await qrRes.json();
      if (qrData.success) setQr(qrData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    load();
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

  const stats = useMemo(() => {
    const total = items.length;
    const text = items.filter((i) => i.dataType === 'text').length;
    const image = items.filter((i) => i.dataType === 'image').length;
    const file = items.filter((i) => i.dataType === 'file').length;
    return { total, text, image, file };
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.dataType === filter);
  }, [items, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

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
        <button className="org-dash__refresh" onClick={handleRefresh} disabled={refreshing || loading} type="button">
          <Icon name="refresh" size={16} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
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
        {/* Left: QR + Filters + List */}
        <div className="org-dash__left">
          {/* QR / Link card */}
          {qr && (
            <motion.div className="org-card org-dash__qr-card" {...fadeUp(0.12)}>
              <div className="org-dash__qr-head">
                <div>
                  <h2 className="org-card__title">Your QR & link</h2>
                  <p className="org-card__desc">Scan or share this so customers can send you content.</p>
                </div>
                <button className="org-dash__toggle" onClick={() => setShowQr((v) => !v)} type="button">
                  {showQr ? 'Hide' : 'Show'}
                </button>
              </div>

              {showQr && (
                <motion.div
                  className="org-dash__qr-body"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.35, ease }}
                >
                  <div className="org-dash__qr-visual">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=${encodeURIComponent(qr.qrUrl || '')}`}
                      alt="Organization QR code"
                      width="140"
                      height="140"
                      className="org-dash__qr-img"
                    />
                  </div>
                  <div className="org-dash__qr-info">
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
                </motion.div>
              )}
            </motion.div>
          )}

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
                  onClick={() => { setFilter(f.key); setPage(1); }}
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
                <h2 className="org-card__title">Incoming submissions</h2>
                <p className="org-card__desc">
                  {filter === 'all' ? 'Newest first' : `Only ${filter}`} · {filtered.length} item{filtered.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="org-dash__loading">
                <div className="org-dash__spinner" />
                <p>Loading submissions…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="org-dash__empty">
                <Icon name="text" size={32} />
                <p>Nothing here yet.</p>
                <span>Share your QR and submissions will show up here.</span>
              </div>
            ) : (
              <>
                <div className="org-dash__list">
                  {pageItems.map((item) => (
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
                        {item.dataType === 'image' && item.url ? (
                          <img src={item.url} alt="" className="org-dash__thumb" />
                        ) : item.dataType === 'file' ? (
                          <span className="org-dash__file-icon"><Icon name="file" size={18} /></span>
                        ) : (
                          <span className="org-dash__text-icon"><Icon name="text" size={18} /></span>
                        )}
                        <div className="org-dash__item-text">
                          <div className="org-dash__item-title">{preview(item)}</div>
                          <div className="org-dash__item-meta">
                            <>{formatTime(item.createdAt)} {item.senderName && <><span>· </span><span className="org-dash__sender">{item.senderName}</span></>}</>
                            {' '}{(item.dataType === 'image' || item.dataType === 'file') && item.size ? <span>· {(item.size / 1024).toFixed(1)} KB</span> : ''}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="org-dash__pagination">
                    <button
                      className="org-dash__page-btn"
                      disabled={safePage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      type="button"
                    >
                      Previous
                    </button>
                    <div className="org-dash__page-gap">
                      Page {safePage} of {totalPages}
                    </div>
                    <button
                      className="org-dash__page-btn"
                      disabled={safePage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
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
                  {(selectedItem.dataType === 'image' || selectedItem.dataType === 'file') && selectedItem.url && (
                    <a className="org-btn org-btn--ghost" href={selectedItem.url} target="_blank" rel="noreferrer">
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
                {selectedItem.dataType === 'image' && selectedItem.url && (
                  <img src={selectedItem.url} alt="Preview" className="org-dash__preview-img" />
                )}
                {selectedItem.dataType === 'file' && (
                  <div className="org-dash__preview-file">
                    <span className="org-dash__file-icon"><Icon name="file" size={32} /></span>
                    <div>
                      <div className="org-dash__file-name">{selectedItem.originalName || 'File'}</div>
                      <div className="org-dash__file-meta">
                        {selectedItem.size && <span>{(selectedItem.size / 1024).toFixed(1)} KB </span>}
                        {selectedItem.senderName && <><span>· </span><span className="org-dash__sender">{selectedItem.senderName}</span></>}
                      </div>
                    </div>
                    {selectedItem.url && (
                      <a className="org-btn org-btn--ghost" href={selectedItem.url} target="_blank" rel="noreferrer" style={{ marginTop: 12 }}>
                        <Icon name="external" size={16} /> Download / Open
                      </a>
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
    </div>
  );
};

export default OrgDashboard;
