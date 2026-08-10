import React, { useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { orgEndpoints } from '../../api/orgEndpoints';
import './OrgKiosk.css';

const OrgSubmitPage = () => {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tab, setTab] = useState('text');
  const [text, setText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null); // { orgName }

  const submitText = async () => {
    if (!text.trim()) {
      setError('Please write a message first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(orgEndpoints.submitText(code), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, senderName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not send');
      setDone({ orgName: data.orgName });
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitFile = async () => {
    if (!file) {
      setError('Please choose a file first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (senderName) formData.append('senderName', senderName);

      const res = await fetch(orgEndpoints.uploadFile(code), {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not send');
      setDone({ orgName: data.orgName });
      setFile(null);
      setFileName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pickFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFile(f);
      setFileName(f.name);
      setError('');
    }
  };

  if (done) {
    return (
      <div className="orgkiosk">
        <div className="orgkiosk__main">
          <div className="orgkiosk__container">
            <div className="orgkiosk__card">
              <div className="orgkiosk__success">
                <div className="orgkiosk__success-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2>Thank you!</h2>
                <p>Your content has reached {done.orgName ? `the ${done.orgName}` : 'the organization'}.</p>
                <button className="orgkiosk__btn" style={{ maxWidth: 280 }} onClick={() => setDone(null)} type="button">
                  Send another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
return (
    <div className="orgkiosk">
      <nav className="orgkiosk__nav">
        <div className="orgkiosk__nav-inner">
          <button className="orgkiosk__back" onClick={() => navigate('/')} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </button>
          <span className="orgkiosk__brand">Send to this business</span>
        </div>
      </nav>

      <div className="orgkiosk__main">
        <div className="orgkiosk__grid" aria-hidden="true" />
        <div className="orgkiosk__container">
          <div className="orgkiosk__header">
            <div className="orgkiosk__code">{code}</div>
            <h1 className="orgkiosk__title">Send your message</h1>
            <p className="orgkiosk__desc">
              No account needed. Choose text, an image, or a file — it goes straight to the business.
            </p>
          </div>

          <div className="orgkiosk__card">
            {error && <div className="org-error" style={{ marginTop: 0 }}>{error}</div>}

            <div className="orgkiosk__tabs" role="tablist">
              {(['text', 'image', 'file']).map((t) => (
                <button
                  key={t}
                  className={`orgkiosk__tab ${tab === t ? 'orgkiosk__tab--active' : ''}`}
                  onClick={() => setTab(t)}
                  type="button"
                >
                  {t === 'text' ? 'Text' : t === 'image' ? 'Image' : 'File'}
                </button>
              ))}
            </div>

            <div className="org-field">
              <label className="org-field__label" htmlFor="kiosk-name">Your name (optional)</label>
              <input
                id="kiosk-name"
                className="orgkiosk__input"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="How should the business know you?"
              />
            </div>

            {tab === 'text' ? (
              <>
                <textarea
                  className="orgkiosk__textarea"
                  placeholder="Type your message…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={50000}
                />
                <button className="orgkiosk__btn" style={{ marginTop: '1rem' }} onClick={submitText} disabled={loading} type="button">
                  {loading ? 'Sending…' : 'Send message'}
                </button>
              </>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  accept={tab === 'image' ? 'image/*' : undefined}
                  onChange={pickFile}
                />
                <div className="orgkiosk__drop" onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  {fileName ? (
                    <span className="orgkiosk__file-name">{fileName}</span>
                  ) : (
                    <>
                      <span>Click to choose a {tab === 'image' ? 'photo' : 'file'}</span>
                      <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Up to 50 MB</span>
                    </>
                  )}
                </div>
                <button className="orgkiosk__btn" style={{ marginTop: '1rem' }} onClick={submitFile} disabled={loading} type="button">
                  {loading ? 'Uploading…' : fileName ? `Send ${fileName}` : 'Send'}
                </button>
              </>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Powered by <Link to="/" style={{ color: 'var(--theme-primary)' }}>TShare</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrgSubmitPage;