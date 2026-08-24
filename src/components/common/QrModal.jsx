import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import './QrModal.css';

const QrModal = ({ code, onClose }) => {
  const qrRef = useRef(null);

  if (!code) return null;

  // Encode receive URL so generic phone cameras open the receive page directly.
  // Our in-app scanner also handles plain codes or URLs (see QrScanner).
  const qrValue = (() => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tshare.in';
      return `${origin}/receive?code=${encodeURIComponent(code)}`;
    } catch {
      return code;
    }
  })();

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `tshare-${code}.png`;
      a.click();
    };
    img.src = url;
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const content = (
    <div className="qr-modal__backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="qr-modal__close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
        </button>

        <div className="qr-modal__header">
          <div className="qr-modal__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3z M17 17h4v4h-4z M14 21h3 M21 14h-4" />
            </svg>
          </div>
          <h3 className="qr-modal__title">Scan to receive</h3>
          <p className="qr-modal__subtitle">Share this QR — the receiver can scan it on the Receive page</p>
        </div>

        <div className="qr-modal__qr-wrap" ref={qrRef}>
          <QRCodeSVG
            value={qrValue}
            size={220}
            bgColor="#ffffff"
            fgColor="#0a0a0f"
            level="M"
            includeMargin={false}
          />
        </div>

        <div className="qr-modal__code">
          {code.split('').map((c, i) => (
            <span key={i} className="qr-modal__digit">{c}</span>
          ))}
        </div>
        <p className="qr-modal__hint">Code • tap to copy is still available on the previous screen</p>

        <div className="qr-modal__actions">
          <button className="qr-modal__btn qr-modal__btn--secondary" onClick={onClose}>Close</button>
          <button className="qr-modal__btn qr-modal__btn--primary" onClick={handleDownload}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default QrModal;
