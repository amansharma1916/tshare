import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Html5Qrcode } from 'html5-qrcode';
import './QrScanner.css';

const QrScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const containerId = useRef(`qr-reader-${Math.random().toString(36).slice(2, 8)}`);
  const isClosingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const id = containerId.current;
    // Lock background scroll so premium marquee doesn't shift when backdrop appears
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    // compensate for scrollbar disappearance to avoid layout shift
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    document.body.style.overflow = 'hidden';
    // Clear any leftover markup from StrictMode double-mount
    const host = document.getElementById(id);
    if (host) host.innerHTML = '';

    const qr = new Html5Qrcode(id, { verbose: false });
    scannerRef.current = qr;

    const start = async () => {
      try {
        setError('');
        setScanning(true);
        await qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (isClosingRef.current) return;
            const raw = String(decodedText || '').trim();
            let code = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
            try {
              if (raw.includes('code=')) {
                const m = raw.match(/code=([A-Za-z0-9]{4,8})/i);
                if (m) code = m[1].toUpperCase();
              } else if (raw.includes('tshare.in')) {
                const m2 = raw.match(/([A-Za-z0-9]{4,8})\s*$/);
                if (m2) code = m2[1].toUpperCase();
              }
            } catch {}
            if (code.length >= 4) {
              if (code.length > 6) code = code.slice(-6);
              if (isClosingRef.current) return;
              isClosingRef.current = true;
              // Fire-and-forget stop — don't block UI; parent will unmount and cleanup will clear
              qr.stop().catch(() => {}).finally(() => { try { qr.clear(); } catch {} });
              onScan(code);
              onClose();
            }
          },
          () => {}
        );
        if (cancelled) {
          try { await qr.stop(); } catch {}
          try { qr.clear(); } catch {}
        }
      } catch (e) {
        if (cancelled) return;
        console.error('QR start error', e);
        setError(e?.message || 'Camera not available. Please allow camera permission or try file upload.');
        setScanning(false);
      }
    };

    start();

    return () => {
      cancelled = true;
      isClosingRef.current = true;
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      // Use the local qr instance, not ref which may have been overwritten
      const inst = qr;
      try {
        if (inst.isScanning) {
          inst.stop().catch(() => {}).finally(() => { try { inst.clear(); } catch {} });
        } else {
          try { inst.clear(); } catch {}
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAndClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Always close immediately — don't let isClosingRef or camera stop block UI
    const inst = scannerRef.current;
    if (inst) {
      try { inst.stop().catch(() => {}); } catch {}
      // clear after a tick so video element is still in DOM for stop to finish
      setTimeout(() => { try { inst.clear(); } catch {} }, 50);
    }
    // Don't set isClosingRef before onClose — let parent unmount first
    onClose();
  };

  // Escape key closes
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') stopAndClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError('');
      // Use a temporary hidden element for file decoding so we don't interfere with the live camera
      const tempId = `qr-file-${Math.random().toString(36).slice(2, 6)}`;
      const tempDiv = document.createElement('div');
      tempDiv.id = tempId;
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);
      const fileQr = new Html5Qrcode(tempId, { verbose: false });
      const result = await fileQr.scanFile(file, true);
      try { fileQr.clear(); } catch {}
      tempDiv.remove();
      const raw = String(result || '').trim();
      let code = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const m = raw.match(/code=([A-Za-z0-9]{4,8})/i);
      if (m) code = m[1].toUpperCase();
      if (code.length > 6) code = code.slice(-6);
      if (code.length >= 4) {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        const inst = scannerRef.current;
        if (inst) {
          inst.stop().catch(() => {}).finally(() => { try { inst.clear(); } catch {} });
        }
        onScan(code);
        onClose();
      } else {
        setError('No valid code found in image');
      }
    } catch (err) {
      setError('Could not read QR from file');
    }
    e.target.value = '';
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) stopAndClose();
  };

  const content = (
    <div className="qr-scanner__backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true" aria-label="QR scanner">
      <div className="qr-scanner" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="qr-scanner__close"
          onClick={stopAndClose}
          onTouchEnd={stopAndClose}
          aria-label="Close scanner"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
        </button>
        <div className="qr-scanner__header">
          <div className="qr-scanner__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h3 className="qr-scanner__title">Scan QR code</h3>
          <p className="qr-scanner__subtitle">Point your camera at the QR shown on the sharer's screen</p>
        </div>

        <div id={containerId.current} className="qr-scanner__viewport" />

        {!scanning && !error && <p className="qr-scanner__hint">Starting camera…</p>}
        {error && <p className="qr-scanner__error">{error}</p>}

        <div className="qr-scanner__divider"><span>or</span></div>

        <label className="qr-scanner__file-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Upload QR image
          <input type="file" accept="image/*" onChange={handleFile} hidden />
        </label>

        <p className="qr-scanner__foot">The code will be auto-filled and received</p>
      </div>
    </div>
  );

  // Portal to body so fixed backdrop isn't clipped by AppLayout's overflow:hidden / transformed ancestors
  // and doesn't interfere with the premium marquee's animation.
  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default QrScanner;
