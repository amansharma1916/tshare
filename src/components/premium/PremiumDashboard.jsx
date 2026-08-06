import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { endpoints } from '../../api/api'
import './BuyPremium.css'

const PremiumDashboard = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('tshare_premium_username') || ''
  const token = localStorage.getItem('tshare_premium_token') || ''

  const [codes, setCodes] = useState([])
  const [selectedCode, setSelectedCode] = useState(null)
  const [loadingCodes, setLoadingCodes] = useState(true)
  const [loadingUpdate, setLoadingUpdate] = useState(false)
  
  // Update state
  const [activeTab, setActiveTab] = useState('text') // 'text' | 'image' | 'file'
  const [textInput, setTextInput] = useState('')
  const [fileInput, setFileInput] = useState(null)
  
  // Display name & visibility settings
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  
  // Upload UI state (for image/file uploads using dropzone)
  const fileInputRef = useRef(null)
  const [filePreview, setFilePreview] = useState('')
  const [fileError, setFileError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  // Password protection state
  const [codePassword, setCodePassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  useEffect(() => {
    if (!token || !username) {
      navigate('/premium/login')
      return
    }
    loadPremiumCodes()
  }, [token, username, navigate])

  const loadPremiumCodes = async () => {
    setLoadingCodes(true)
    setErrorMessage('')
    try {
      const res = await fetch(endpoints.myCodes, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ username })
      })

      const data = await res.json()
      if (res.ok) {
        setCodes(data.codes || [])
        if (data.codes && data.codes.length > 0) {
          // Auto-select first code if none is selected
          const first = data.codes[0]
          setSelectedCode(first)
          setActiveTab(first.dataType || 'text')
          setTextInput(first.text || '')
          setDisplayNameInput(first.displayName || '')
          setIsPublic(first.isPublic !== false)
        }
      } else {
        setErrorMessage(data.message || 'Failed to load codes')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Network error fetching owned codes')
    } finally {
      setLoadingCodes(false)
    }
  }

  const handleCodeSelect = (codeObj) => {
    setSelectedCode(codeObj)
    setActiveTab(codeObj.dataType || 'text')
    setTextInput(codeObj.text || '')
    setFileInput(null)
    setFilePreview('')
    setFileError('')
    setDisplayNameInput(codeObj.displayName || '')
    setIsPublic(codeObj.isPublic !== false)
    // Set password state
    setCodePassword('')
    setPasswordMessage({ type: '', text: '' })
    setSuccessMessage('')
    setErrorMessage('')
  }

  // File preview effect — generates preview URL when fileInput changes
  useEffect(() => {
    if (!fileInput) {
      setFilePreview('')
      return
    }
    const objectUrl = URL.createObjectURL(fileInput)
    setFilePreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [fileInput])

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null
    if (file) {
      setFileInput(file)
      setFileError('')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (activeTab === 'image') {
        if (!file.type.startsWith('image/')) {
          setFileError('Please drop a valid image file')
          return
        }
      }
      setFileInput(file)
      setFileError('')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleClearFile = () => {
    setFileInput(null)
    setFilePreview('')
    setFileError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Update this to also clear file when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setFileInput(null)
    setFilePreview('')
    setFileError('')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!selectedCode) return

    setErrorMessage('')
    setSuccessMessage('')
    setLoadingUpdate(true)

    const formData = new FormData()
    formData.append('username', username)
    formData.append('code', selectedCode.code)
    formData.append('dataType', activeTab)
    formData.append('displayName', displayNameInput)
    formData.append('isPublic', isPublic)

    if (activeTab === 'text') {
      formData.append('text', textInput)
    } else {
      if (!fileInput) {
        setErrorMessage('Please select a file to upload')
        setLoadingUpdate(false)
        return
      }
      formData.append('file', fileInput)
    }

    try {
      const res = await fetch(endpoints.updatePremiumCode, {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
        },
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setSuccessMessage('Content updated successfully!')
        // Reload codes to update the selected code details
        const updatedCodes = codes.map(c => c.code === selectedCode.code ? data.premiumCode : c)
        setCodes(updatedCodes)
        setSelectedCode(data.premiumCode)
      } else {
        setErrorMessage(data.message || 'Failed to update content')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Network error while updating content')
    } finally {
      setLoadingUpdate(false)
    }
  }

  // Set or update password for the selected code
  const handleSetPassword = async (e) => {
    e.preventDefault()
    if (!selectedCode) return

    setPasswordLoading(true)
    setPasswordMessage({ type: '', text: '' })

    try {
      const res = await fetch(endpoints.setCodePassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          code: selectedCode.code,
          password: codePassword
        })
      })

      const data = await res.json()
      if (res.ok) {
        setPasswordMessage({ 
          type: 'success', 
          text: data.message || 'Password updated successfully' 
        })
        // Update selected code to reflect password change
        const updatedCodes = codes.map(c => c.code === selectedCode.code ? { ...c, hasPassword: data.premiumCode.hasPassword } : c)
        setCodes(updatedCodes)
        setSelectedCode({ ...selectedCode, hasPassword: data.premiumCode.hasPassword })
        setCodePassword('')
      } else {
        setPasswordMessage({ type: 'error', text: data.message || 'Failed to update password' })
      }
    } catch (err) {
      console.error(err)
      setPasswordMessage({ type: 'error', text: 'Network error while updating password' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('tshare_premium_token')
    localStorage.removeItem('tshare_premium_username')
    navigate('/premium/login')
  }

  if (loadingCodes) {
    return (
      <div className="premium-container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <motion.div className="spinner" style={{ width: '40px', height: '40px' }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading your Premium Codes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="premium-container" style={{ minHeight: 'calc(100vh - 100px)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '960px', display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* Header Summary */}
        <div className="premium-card bg-glass" style={{ maxWidth: 'none', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--theme-primary-light) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Premium Dashboard
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Logged in as: <strong style={{ color: 'var(--theme-primary-light)' }}>{username}</strong></p>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>

        {codes.length === 0 ? (
          <div className="premium-card bg-glass" style={{ maxWidth: 'none', textAlign: 'center', padding: '40px' }}>
            <h2>No Codes Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>You haven't purchased any premium codes yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/buy')}>Purchase Code</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }} className="dashboard-grid">
            
            {/* Sidebar Code List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="section-label" style={{ paddingLeft: '4px' }}>Your Codes</div>
              {codes.map((c) => (
                <button
                  key={c.code}
                  className={`preset-btn ${selectedCode && selectedCode.code === c.code ? 'active' : ''}`}
                  style={{ 
                    textAlign: 'left', 
                    padding: '10px 12px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px',
                    width: '100%',
                    minHeight: '80px'
                  }}
                  onClick={() => handleCodeSelect(c)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '1px' }}>{c.code.toUpperCase()}</span>
                    <span style={{ 
                      fontSize: '10px', 
                      opacity: 0.7, 
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}>
                      {c.dataType ? c.dataType.toUpperCase() : 'EMPTY'}
                    </span>
                  </div>
                  
                  {/* Content Preview */}
                  <div style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {c.dataType === 'text' && c.text && (
                      <span>{c.text.substring(0, 50)}{c.text.length > 50 ? '...' : ''}</span>
                    )}
                    {c.dataType === 'image' && c.originalName && (
                      <span>{c.originalName}</span>
                    )}
                    {c.dataType === 'file' && c.originalName && (
                      <span>📎 {c.originalName}</span>
                    )}
                    {!c.dataType && !c.text && !c.originalName && (
                      <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No content</span>
                    )}
                  </div>
                </button>
              ))}
              <button className="btn btn-secondary" style={{ marginTop: '10px', justifyContent: 'center', fontSize: '12px', padding: '8px 12px' }} onClick={() => navigate('/buy')}>
                + Purchase Another
              </button>
            </div>

            {/* Code Management Content Area */}
            {selectedCode && (
              <div className="premium-card bg-glass" style={{ maxWidth: 'none', padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--theme-primary-light)' }}>
                      Code: {selectedCode.code}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Expires: {new Date(selectedCode.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <a
                      href={`${window.location.origin}/receive?code=${selectedCode.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ textDecoration: 'none', fontSize: '12px' }}
                    >
                      Open Link
                    </a>
                  </div>
                </div>

                {/* Content Update Form */}
                <form onSubmit={handleUpdate} className="premium-form">
                  {successMessage && (
                    <div className="alert alert-success" style={{ padding: '12px' }}>
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="alert alert-danger" style={{ padding: '12px' }}>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Display Name & Visibility Settings */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div>
                      <label className="section-label">Display Name</label>
                      <input
                        type="text"
                        className="custom-amount-input"
                        placeholder="Your public display name"
                        style={{ paddingLeft: '14px', boxSizing: 'border-box', width: '100%' }}
                        value={displayNameInput}
                        onChange={(e) => setDisplayNameInput(e.target.value)}
                      />
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Shown on receive page & public marquee
                      </p>
                    </div>
                    <div>
                      <label className="section-label">Show Code in Public</label>
                      <div
                        onClick={() => setIsPublic(!isPublic)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-default)',
                          cursor: 'pointer',
                          background: isPublic ? 'rgba(212, 175, 55, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                          borderColor: isPublic ? 'rgba(212, 175, 55, 0.4)' : 'rgba(239, 68, 68, 0.3)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 600, color: isPublic ? '#f59e0b' : 'var(--text-muted)' }}>
                          {isPublic ? '🌐 Public' : '🔒 Hidden'}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        {isPublic ? 'Code & display name shown in public marquee' : 'Only display name shown in public marquee'}
                      </p>
                    </div>
                  </div>

                  {/* Independent save for display name & visibility (no file re-upload needed) */}
                  <button
                    type="button"
                    className="btn-settings-save"
                    onClick={async () => {
                      setErrorMessage('')
                      setSuccessMessage('')
                      const formData = new FormData()
                      formData.append('username', username)
                      formData.append('code', selectedCode.code)
                      formData.append('dataType', activeTab)
                      formData.append('displayName', displayNameInput)
                      formData.append('isPublic', isPublic)
                      // Only append file if user has selected one
                      if (activeTab !== 'text' && fileInput) {
                        formData.append('file', fileInput)
                      }
                      // For text, preserve current text
                      if (activeTab === 'text') {
                        formData.append('text', textInput)
                      }
                      try {
                        const res = await fetch(endpoints.updatePremiumCode, {
                          method: 'POST',
                          headers: {
                            ...getAuthHeaders()
                          },
                          body: formData
                        })
                        const data = await res.json()
                        if (res.ok) {
                          setSuccessMessage('Settings updated successfully!')
                          const updatedCodes = codes.map(c => c.code === selectedCode.code ? data.premiumCode : c)
                          setCodes(updatedCodes)
                          setSelectedCode(data.premiumCode)
                        } else {
                          setErrorMessage(data.message || 'Failed to update settings')
                        }
                      } catch (err) {
                        setErrorMessage('Network error while updating settings')
                      }
                    }}
                    style={{ marginBottom: '20px' , background: 'linear-gradient(135deg, var(--theme-primary-light), var(--theme-primary))', color: '#fff', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  >
                    Save Display Name & Visibility
                  </button>

                  {/* DataType Tabs */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="section-label">Content Type</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      {['text', 'image', 'file'].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          className={`preset-btn ${activeTab === tab ? 'active' : ''}`}
                          style={{ flex: 1 }}
                          onClick={() => handleTabChange(tab)}
                        >
                          {tab.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form fields based on tab */}
                  {activeTab === 'text' && (
                    <div style={{ marginBottom: '20px' }}>
                      <label className="section-label">Shared Text</label>
                      <textarea
                        rows="6"
                        className="custom-amount-input"
                        placeholder="Type text to share..."
                        style={{ paddingLeft: '14px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                      />
                    </div>
                  )}

                  {(activeTab === 'image' || activeTab === 'file') && (
                    <div style={{ marginBottom: '20px' }}>
                      <label className="section-label">Upload {activeTab === 'image' ? 'Image' : 'File'}</label>
                      <div
                        className={`dropzone ${isDragOver ? 'dropzone--active' : ''} ${filePreview ? 'dropzone--has-file' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={activeTab === 'image' ? 'image/*' : '*'}
                          onChange={handleFileChange}
                          className="dropzone__input"
                          hidden
                        />

                        {filePreview ? (
                          <div className="dropzone__preview">
                            {activeTab === 'image' ? (
                              <img src={filePreview} alt="Selected preview" />
                            ) : (
                              <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                                <div className="dropzone__file-name">{fileInput?.name}</div>
                              </div>
                            )}
                            <div className="dropzone__overlay">
                              <span>Click to change</span>
                            </div>
                          </div>
                        ) : (
                          <div className="dropzone__placeholder">
                            <div className="dropzone__icon">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                {activeTab === 'image' ? (
                                  <>
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                  </>
                                ) : (
                                  <>
                                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                                    <polyline points="13 2 13 9 20 9" />
                                  </>
                                )}
                              </svg>
                            </div>
                            <div className="dropzone__text">
                              <span className="dropzone__title">{activeTab === 'image' ? 'Drop an image here' : 'Drop a file here'}</span>
                              <span className="dropzone__hint">or click to browse</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {fileInput && (
                        <div className="dropzone__file-info">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="dropzone__file-name">{fileInput.name}</span>
                          <span className="dropzone__file-size">{formatFileSize(fileInput.size)}</span>
                        </div>
                      )}

                      {fileError && (
                        <p className="share__error" style={{ marginTop: '8px' }}>
                          {fileError}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="editor-actions">
                    {(activeTab === 'image' || activeTab === 'file') && fileInput && (
                      <button
                        type="button"
                        className="editor-clear-btn"
                        onClick={handleClearFile}
                        disabled={loadingUpdate}
                      >
                        Clear
                      </button>
                    )}
                    {activeTab === 'text' && textInput && (
                      <button
                        type="button"
                        className="editor-clear-btn"
                        onClick={() => { setTextInput(''); }}
                        disabled={loadingUpdate}
                      >
                        Clear
                      </button>
                    )}
                    <button type="submit" className="btn-pay-now" disabled={loadingUpdate || (activeTab !== 'text' && !fileInput)}>
                      {loadingUpdate ? (
                        <div className="btn__loading">
                          <span className="btn__spinner"></span>
                          Uploading...
                        </div>
                      ) : (
                        <span>Update Content</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Password Protection Section - OUTSIDE the form */}
                <div style={{ 
                  marginTop: '24px', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(212, 175, 55, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d4af37' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <label className="section-label" style={{ margin: 0 }}>Password Protection</label>
                    {selectedCode.hasPassword && (
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                        color: '#000',
                        fontWeight: 600
                      }}>
                        PROTECTED
                      </span>
                    )}
                  </div>
                  
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                    {selectedCode.hasPassword 
                      ? 'This code is password protected. Enter a new password below to change it, or leave empty to remove protection.'
                      : 'Add an optional password to protect this code. Anyone receiving content will need to enter this password first.'}
                  </p>

                  {passwordMessage.text && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      background: passwordMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${passwordMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      color: passwordMessage.type === 'success' ? '#22c55e' : '#ef4444',
                      fontSize: '13px'
                    }}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleSetPassword}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <input
                        type="password"
                        className="custom-amount-input"
                        placeholder={selectedCode.hasPassword ? "Enter new password (leave empty to remove)" : "Enter password (optional)"}
                        style={{ 
                          flex: '1 1 250px',
                          paddingLeft: '14px',
                          boxSizing: 'border-box'
                        }}
                        value={codePassword}
                        onChange={(e) => setCodePassword(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="btn-settings-save"
                        disabled={passwordLoading}
                        style={{ 
                          flex: '0 0 auto',
                          background: 'linear-gradient(135deg, #d4af37, #f59e0b)',
                          color: '#000',
                          fontWeight: 600,
                          padding: '10px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {passwordLoading ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="btn__spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span>
                            Saving...
                          </span>
                        ) : (
                          selectedCode.hasPassword ? 'Change Password' : 'Set Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

PremiumDashboard.propTypes = {};

export default PremiumDashboard