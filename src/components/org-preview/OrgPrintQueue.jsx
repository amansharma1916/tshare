import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './OrgPrintQueue.css';

const ease = [0.16, 1, 0.3, 1];

const Icon = ({ name, size = 14 }) => {
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
    case 'printer':
      return (
        <svg {...common}>
          <path d="M6 9V2h12v7" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" rx="1" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'chevron':
      return (
        <svg {...common}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    default:
      return null;
  }
};

const formatTime = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const statusLabel = (job) => {
  if (job.status === 'printing') return 'Printing…';
  if (job.status === 'printed') return 'Printed';
  if (job.status === 'cancelled') return 'Cancelled';
  if (job.status === 'failed') return 'Failed';
  if (job.submission?.pdfStatus === 'pending') return 'Converting…';
  return 'Queued';
};

const statusIcon = (job) => {
  if (job.status === 'printed') return 'check';
  if (job.status === 'cancelled' || job.status === 'failed') return 'alert';
  return 'printer';
};

const OrgPrintQueue = ({ queue = [], history = [], socketOnline = false, loading = false, onMove, onCancel, onRetry }) => {
  const [open, setOpen] = useState(true);

  const activeCount = queue.length;

  return (
    <motion.div
      className="org-printq"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      <button className="org-printq__head" onClick={() => setOpen((o) => !o)} type="button" aria-expanded={open}>
        <span className="org-printq__head-icon"><Icon name="printer" size={16} /></span>
        <span className="org-printq__head-title">Print queue</span>
        {activeCount > 0 && <span className="org-printq__count">{activeCount}</span>}
        <span className={`org-printq__dot ${socketOnline ? 'org-printq__dot--online' : ''}`} title={socketOnline ? 'Agent server link: live' : 'Reconnecting…'} />
        <span className={`org-printq__chevron ${open ? 'org-printq__chevron--open' : ''}`}><Icon name="chevron" size={16} /></span>
      </button>

      {open && (
        <div className="org-printq__body">
          {loading && activeCount === 0 ? (
            <div className="org-printq__empty">
              <div className="org-dash__spinner" />
              <p>Loading print queue…</p>
            </div>
          ) : queue.length === 0 && history.length === 0 ? (
            <div className="org-printq__empty">
              <Icon name="printer" size={28} />
              <p>No print jobs yet.</p>
              <span>Turn on Auto Print above — new files and images will queue here and print automatically.</span>
            </div>
          ) : (
            <>
              {queue.length > 0 && (
                <div className="org-printq__section">
                  <div className="org-printq__section-label">Up next</div>
                  {queue.map((job, index) => (
                    <motion.div
                      key={job.id}
                      className={`org-printq__job ${job.status === 'printing' ? 'org-printq__job--printing' : ''}`}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <span className="org-printq__pos">#{job.order}</span>
                      <span className="org-printq__icon">
                        <Icon name={job.submission?.dataType === 'image' ? 'image' : 'file'} size={16} />
                      </span>
                      <div className="org-printq__info">
                        <div className="org-printq__name" title={job.submission?.originalName || 'Submission'}>
                          {job.submission?.originalName || 'Submission'}
                          {job.submission?.submissionCode && <span className="org-printq__ref"> #{job.submission.submissionCode}</span>}
                        </div>
                        <div className="org-printq__meta">
                          {formatTime(job.submission?.createdAt || job.createdAt)}
                          {job.submission?.senderName && <><span> · </span>{job.submission.senderName}</>}
                        </div>
                      </div>
                      <span className={`org-printq__status org-printq__status--${job.status}`}>
                        <Icon name={statusIcon(job)} size={12} />
                        {statusLabel(job)}
                      </span>
                      <div className="org-printq__actions">
                        <button className="org-printq__btn" onClick={() => onMove(job.id, 'up')} disabled={index === 0} type="button" title="Move up">↑</button>
                        <button className="org-printq__btn" onClick={() => onMove(job.id, 'down')} disabled={index === queue.length - 1} type="button" title="Move down">↓</button>
                        <button className="org-printq__btn" onClick={() => onMove(job.id, 'top')} disabled={index === 0} type="button" title="Print next">Top</button>
                        <button className="org-printq__btn org-printq__btn--danger" onClick={() => onCancel(job.id)} type="button" title="Cancel print">✕</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {history.length > 0 && (
                <div className="org-printq__section">
                  <div className="org-printq__section-label">History</div>
                  {history.map((job) => (
                    <motion.div key={job.id} className={`org-printq__job org-printq__job--done`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <span className="org-printq__pos">#{job.order}</span>
                      <span className="org-printq__icon">
                        <Icon name={job.submission?.dataType === 'image' ? 'image' : 'file'} size={16} />
                      </span>
                      <div className="org-printq__info">
                        <div className="org-printq__name" title={job.submission?.originalName || 'Submission'}>
                          {job.submission?.originalName || 'Submission'}
                        </div>
                        <div className="org-printq__meta">
                          {formatTime(job.completedAt)}
                          {job.lastError && <span className="org-printq__error"> — {job.lastError}</span>}
                        </div>
                      </div>
                      <span className={`org-printq__status org-printq__status--${job.status}`}>
                        <Icon name={statusIcon(job)} size={12} />
                        {statusLabel(job)}
                      </span>
                      <div className="org-printq__actions">
                        {job.status === 'failed' && (
                          <button className="org-printq__btn" onClick={() => onRetry(job.id)} type="button" title="Retry print">Retry</button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default OrgPrintQueue;
