import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { orgEndpoints } from '../../api/orgEndpoints';
import { openPrintWindow } from './printHelpers';

// Renders a .docx file directly in the browser with `docx-preview`.
//
// Why client-side rendering: third-party Office viewers (Microsoft Office Online,
// Google Docs) fetch the document from THEIR servers, so they fail whenever the
// file/backend isn't publicly reachable (e.g. localhost). Fetching the file through
// our own same-origin proxy (/org/preview/:id) and rendering it here works in both
// dev and production, and the rendered content is printable.
//
// A small toolbar (like the browser's PDF toolbar) provides Print and Download.
const DocxPreview = ({ file }) => {
  const bodyRef = useRef(null);
  const styleRef = useRef(null);
  const blobRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  const src = file?.id ? orgEndpoints.previewData(file.id) : (file?.url || '');
  const name = file?.originalName || 'document.docx';

  useEffect(() => {
    let cancelled = false;
    if (!bodyRef.current) return undefined;

    const renderDoc = async () => {
      setStatus('loading');
      try {
        if (!src) throw new Error('No source for document');
        const res = await fetch(src);
        if (!res.ok) throw new Error('Failed to load document');
        const blob = await res.blob();
        if (cancelled) return;
        blobRef.current = blob;

        // styleRef is a dedicated container so docx-preview's <style> rules and the
        // rendered markup both live inside .org-dash__docx — letting us clone the
        // whole styled output into the print window.
        await renderAsync(blob, bodyRef.current, styleRef.current, { experimental: true });
        if (cancelled) return;
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    renderDoc();

    return () => {
      cancelled = true;
    };
  }, [src]);

  // Print the client-rendered docx (reuses the shared print window; no download).
  const handlePrint = () => {
    const bodyHtml = bodyRef.current?.innerHTML;
    if (!bodyHtml || !bodyHtml.trim()) return;
    const styleHtml = styleRef.current?.innerHTML || '';
    openPrintWindow(`${styleHtml}${bodyHtml}`);
  };

  // Download the original .docx file (same-origin blob, so the filename is honored).
  const handleDownload = () => {
    const blob = blobRef.current;
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else if (src) {
      window.open(src, '_blank', 'noopener');
    }
  };

  const ready = status === 'ready';

  return (
    <div className="org-dash__docx" data-docx>
      <div className="org-dash__docx-toolbar">
        <span className="org-dash__docx-name" title={name}>{name}</span>
        <div className="org-dash__docx-toolbar-actions">
          <button className="org-btn org-btn--ghost" type="button" onClick={handlePrint} disabled={!ready}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
          <button className="org-btn org-btn--ghost" type="button" onClick={handleDownload} disabled={!ready}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {status === 'loading' && (
        <div className="org-dash__docx-status">Loading document…</div>
      )}
      {status === 'error' && (
        <div className="org-dash__docx-status org-dash__docx-status--error">
          Couldn't render this document.
        </div>
      )}
      <div ref={styleRef} className="org-dash__docx-style" />
      <div
        ref={bodyRef}
        className="org-dash__docx-body"
        style={{ display: ready ? 'block' : 'none' }}
      />
    </div>
  );
};

export default DocxPreview;