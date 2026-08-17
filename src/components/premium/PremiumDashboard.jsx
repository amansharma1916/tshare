import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { endpoints } from '../../api/api'
import './BuyPremium.css'
import './PremiumDashboard.css'

// ── Small inline SVG icon set (no emoji, consistent stroke style) ──
const Icon = ({ name, size = 16, ...rest }) => {
  const paths = {
    crown: <path d="M2 7l5 4 5-7 5 7 5-4-2 12H4L2 7z" />,
    lock: (<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>),
    globe: (<><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></>),
    logout: (<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>),
    key: (<><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></>),
    text: (<><path d="M4 6h16M4 12h10M4 18h7" /></>),
    image: (<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>),
    file: (<><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /></>),
    external: (<><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>),
    check: <polyline points="20 6 9 17 4 12" />,
    alert: (<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>),
    plus: (<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    gem: (<><path d="M6 3h12l4 6-10 12L2 9l4-6z" /><path d="M2 9h20M12 21L8 9l4-6 4 6-4 12z" /></>),
    sparkles: (<><path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9L12 3z" /><path d="M19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z" /></>),
    clock: (<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>),
    refresh: (<><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></>),
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {paths[name]}
    </svg>
  )
}

const PremiumDashboard = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('tshare_premium_username') || ''
  const token = localStorage.getItem('tshare_premium_token') || ''

  const [codes, setCodes] = useState([])
  const [selectedCode, setSelectedCode] = useState(null)
  const [loadingCodes, setLoadingCodes] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  
  // Update state — items editor (content is now an items list, not one blob)
  const [activeTab, setActiveTab] = useState('text') // 'text' | 'image' | 'file'
  const [textInput, setTextInput] = useState('')
  const [files, setFiles] = useState([])           // array for multi-select
  const [addingItem, setAddingItem] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState('')

  // Display name & visibility settings
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  // Buy capacity modal state
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [slotPrice, setSlotPrice] = useState(30)
  const [slotCount, setSlotCount] = useState(1)
  const [buyLoading, setBuyLoading] = useState(false)
  const [buyMessage, setBuyMessage] = useState('')

  // File input ref for the multi-select picker
  const fileInputRef = useRef(null)

  // Password protection state
  const [codePassword, setCodePassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

  // Change account password state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState('')
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('')

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  
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
          setActiveTab('text')
          setTextInput('')
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
    setActiveTab('text')
    setTextInput('')
    setFiles([])
    setDisplayNameInput(codeObj.displayName || '')
    setIsPublic(codeObj.isPublic !== false)
    // Set password state
    setCodePassword('')
    setPasswordMessage({ type: '', text: '' })
    setSuccessMessage('')
    setErrorMessage('')
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]
  }

  // Update this to also clear files when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setFiles([])
    setErrorMessage('')
  }

  const addTextItem = async () => {
    if (!selectedCode || addingItem) return
    if (!textInput.trim()) { setErrorMessage('Enter some text to add'); return }
    setErrorMessage(''); setSuccessMessage(''); setAddingItem(true)
    try {
      const res = await fetch(endpoints.premiumAddItem, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ code: selectedCode.code, text: textInput })
      })
      const data = await res.json()
      if (res.ok) {
        setTextInput('')
        setSuccessMessage('Text added!')
        await loadPremiumCodes()
      } else {
        setErrorMessage(data.message || 'Failed to add text')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Network error adding text')
    } finally {
      setAddingItem(false)
    }
  }

  const handleFilesSelected = (event) => {
    const chosen = Array.from(event.target.files || [])
    if (chosen.length === 0) return
    const free = (selectedCode?.capacity ?? 0) - (selectedCode?.items?.length ?? 0)
    if (chosen.length > free) {
      setErrorMessage(`You can add at most ${free} more item${free === 1 ? '' : 's'} (capacity ${selectedCode.capacity}). ${chosen.length - free} file${chosen.length - free === 1 ? '' : 's'} skipped.`)
    }
    setFiles(chosen.slice(0, Math.max(free, 0)))
    setErrorMessage('')
  }

  const addFiles = async () => {
    if (!selectedCode || addingItem || files.length === 0) return
    setErrorMessage(''); setSuccessMessage(''); setAddingItem(true)
    try {
      let added = 0
      for (const file of files) {
        const itemCount = selectedCode.items?.length ?? 0
        if (itemCount + added >= selectedCode.capacity) {
          setErrorMessage(`Capacity reached (${selectedCode.capacity}). Some files were not uploaded.`)
          break
        }
        const formData = new FormData()
        formData.append('code', selectedCode.code)
        formData.append('file', file)
        const res = await fetch(endpoints.premiumAddItem, {
          method: 'POST',
          headers: { ...getAuthHeaders() },
          body: formData
        })
        const data = await res.json()
        if (res.ok) {
          added += 1
        } else {
          setErrorMessage(data.message || 'Failed to upload a file')
          break
        }
      }
      setFiles([])
      if (added > 0) setSuccessMessage(`Added ${added} file${added === 1 ? '' : 's'}!`)
      await loadPremiumCodes()
    } catch (err) {
      console.error(err)
      setErrorMessage('Network error uploading files')
    } finally {
      setAddingItem(false)
    }
  }

  const deleteItem = async (itemId) => {
    if (!selectedCode || deletingItemId) return
    if (!window.confirm('Delete this item? This cannot be undone.')) return
    setDeletingItemId(itemId)
    setErrorMessage(''); setSuccessMessage('')
    try {
      const res = await fetch(endpoints.premiumDeleteItem(selectedCode.code, itemId), {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMessage('Item deleted')
        await loadPremiumCodes()
      } else {
        setErrorMessage(data.message || 'Failed to delete item')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Network error deleting item')
    } finally {
      setDeletingItemId('')
    }
  }

  const openBuyModal = () => {
    setSlotCount(1)
    setBuyMessage('')
    setShowBuyModal(true)
    fetch(endpoints.pricingSettings)
      .then(r => r.json())
      .then(d => setSlotPrice(d?.pricing?.slotPrice ?? 30))
      .catch(() => setSlotPrice(30))
  }

  const buyCapacity = async () => {
    if (buyLoading || !selectedCode) return
    setBuyMessage(''); setBuyLoading(true)
    try {
      const orderRes = await fetch(endpoints.premiumCapacityOrder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ code: selectedCode.code, slots: slotCount })
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create order')

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TLzqWxx7hzbAYk',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TShare Code Store',
        description: `Add ${slotCount} slot${slotCount === 1 ? '' : 's'} to ${selectedCode.code}`,
        image: '/s2.svg',
        order_id: orderData.order_id,
        handler: async (paymentResponse) => {
          const verifyRes = await fetch(endpoints.premiumCapacityVerify, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({
              order_id: paymentResponse.razorpay_order_id,
              payment_id: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
              code: selectedCode.code,
              slots: slotCount
            })
          })
          const verifyData = await verifyRes.json()
          if (verifyRes.ok) {
            setBuyMessage('Slots added! Capacity is now ' + verifyData.capacity)
            setShowBuyModal(false)
            await loadPremiumCodes()
          } else {
            setBuyMessage(verifyData.message || 'Verification failed')
          }
        },
        prefill: { name: username, email: `${username}@tshare.in`, contact: '9999999999' },
        notes: { code: selectedCode.code, slots: slotCount },
        theme: { color: '#d4af37' },
        modal: { ondismiss: () => { setBuyLoading(false); setBuyMessage('Payment cancelled') } }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error(err)
      setBuyMessage(err.message || 'Payment error')
    } finally {
      setBuyLoading(false)
    }
  }

  // Save display name & visibility
  const handleSaveSettings = async () => {
    if (!selectedCode || savingSettings) return

    setErrorMessage('')
    setSuccessMessage('')
    setSavingSettings(true)

    try {
      const res = await fetch(endpoints.updatePremiumCode, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          code: selectedCode.code,
          displayName: displayNameInput,
          isPublic
        })
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
      console.error(err)
      setErrorMessage('Network error while updating settings')
    } finally {
      setSavingSettings(false)
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

  const openDeleteModal = () => {
    setDeletePassword('')
    setDeleteConfirm('')
    setDeleteError('')
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    if (deleteLoading) return
    setShowDeleteModal(false)
    setDeletePassword('')
    setDeleteConfirm('')
    setDeleteError('')
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    if (deleteLoading) return

    setDeleteError('')
    if (deleteConfirm.trim() !== username) {
      setDeleteError('Type your username exactly to confirm deletion')
      return
    }
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm')
      return
    }

    setDeleteLoading(true)
    try {
      const res = await fetch(endpoints.deleteAccount(username), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ password: deletePassword })
      })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.message || 'Failed to delete account')
        setDeleteLoading(false)
        return
      }
      localStorage.removeItem('tshare_premium_token')
      localStorage.removeItem('tshare_premium_username')
      if (localStorage.getItem('tshare_username') === username) {
        localStorage.removeItem('tshare_username')
      }
      setShowDeleteModal(false)
      setDeleteLoading(false)
      navigate('/premium/login')
    } catch (err) {
      console.error(err)
      setDeleteError('Network error. Please try again.')
      setDeleteLoading(false)
    }
  }

  const openChangePasswordModal = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setChangePasswordError('')
    setChangePasswordSuccess('')
    setShowChangePasswordModal(true)
  }

  const closeChangePasswordModal = () => {
    if (changePasswordLoading) return
    setShowChangePasswordModal(false)
    setChangePasswordError('')
    setChangePasswordSuccess('')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (changePasswordLoading) return

    setChangePasswordError('')
    setChangePasswordSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePasswordError('Please fill in all password fields')
      return
    }
    if (newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError('New passwords do not match')
      return
    }

    setChangePasswordLoading(true)
    try {
      const res = await fetch(endpoints.changePremiumPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        setChangePasswordSuccess(data.message || 'Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setChangePasswordError(data.message || 'Failed to change password')
      }
    } catch (err) {
      console.error(err)
      setChangePasswordError('Network error while changing password')
    } finally {
      setChangePasswordLoading(false)
    }
  }

  if (loadingCodes) {
    return (
      <div className="pd-page">
        <div className="pd-shell">
          <div className="pd-center">
            <div className="pd-loader" />
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Loading your Premium Codes...</p>
          </div>
        </div>
      </div>
    )
  }

  const protectedCount = codes.filter(c => c.hasPassword).length

  // Expiry awareness: days left for the selected code (0 = today, negative = expired)
  const daysLeft = selectedCode?.expiresAt
    ? Math.ceil((new Date(selectedCode.expiresAt) - Date.now()) / 86400000)
    : null
  const isExpiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0
  const isExpiredNow = daysLeft !== null && daysLeft < 0
  const renewUrl = selectedCode
    ? `/buy?code=${encodeURIComponent(selectedCode.code)}&username=${encodeURIComponent(username)}`
    : '/buy'

  // Days left for any code (null = lifetime validity)
  const daysLeftFor = (c) => {
    if (!c.expiresAt) return null
    return Math.ceil((new Date(c.expiresAt) - Date.now()) / 86400000)
  }

  const renewUrlFor = (c) =>
    `/buy?code=${encodeURIComponent(c.code)}&username=${encodeURIComponent(username)}`

  return (
    <div className="pd-page">
      <div className="pd-shell">

        {/* ── Header ── */}
        <header className="pd-header">
          <div className="pd-header__identity">
            <div className="pd-avatar" aria-hidden="true">
              {(username || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="pd-header__title">Premium Dashboard</h1>
              <p className="pd-header__sub">
                <strong>{username}</strong>
                <span className="pd-member-badge"><Icon name="crown" size={11} /> Premium Member</span>
              </p>
            </div>
          </div>
          <div className="pd-header__actions">
            <button className="pd-btn pd-btn--ghost" onClick={openChangePasswordModal}>
              <Icon name="key" size={15} /> Change Password
            </button>
            <button className="pd-btn pd-btn--danger" onClick={openDeleteModal}>
              <Icon name="alert" size={15} /> Delete Account
            </button>
            <button className="pd-btn pd-btn--ghost" onClick={handleLogout}>
              <Icon name="logout" size={15} /> Logout
            </button>
          </div>
        </header>

        {/* ── Stats strip ── */}
        <section className="pd-stats" aria-label="Account overview">
          <div className="pd-stat">
            <div className="pd-stat__label"><Icon name="gem" size={13} /> Codes Owned</div>
            <div className="pd-stat__value pd-stat__value--gold">{codes.length}</div>
            <p className="pd-stat__hint">{protectedCount > 0 ? `${protectedCount} protected` : 'No password protection'}</p>
          </div>
          <div className="pd-stat">
            <div className="pd-stat__label"><Icon name="gem" size={13} /> Items</div>
            <div className="pd-stat__value" style={{ fontSize: '18px' }}>
              {(selectedCode?.items || []).length} / {selectedCode?.capacity ?? 2}
            </div>
            <p className="pd-stat__hint">Slots used in selected code</p>
          </div>
          <div className="pd-stat">
            <div className="pd-stat__label"><Icon name="shield" size={13} /> Security</div>
            <div className="pd-stat__value" style={{ fontSize: '18px' }}>{selectedCode?.hasPassword ? 'Protected' : 'Open'}</div>
            <p className="pd-stat__hint">{selectedCode?.hasPassword ? 'Password required to receive' : 'Anyone with the code can view'}</p>
          </div>
          <div className="pd-stat">
            <div className="pd-stat__label"><Icon name="external" size={13} /> Status</div>
            <div className="pd-stat__value" style={{ fontSize: '18px', color: isExpiredNow ? '#f87171' : isExpiringSoon ? '#fbbf24' : '#86efac' }}>
              {isExpiredNow ? 'Expired' : isExpiringSoon ? 'Expiring' : 'Active'}
            </div>
            <p className="pd-stat__hint">
              {selectedCode?.expiresAt
                ? isExpiredNow
                  ? `Expired ${new Date(selectedCode.expiresAt).toLocaleDateString()} — renew to reactivate`
                  : isExpiringSoon
                    ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left — renew soon`
                    : `Expires ${new Date(selectedCode.expiresAt).toLocaleDateString()}`
                : 'Lifetime validity'}
            </p>
          </div>
        </section>

        {codes.length === 0 ? (
          <div className="pd-empty">
            <div className="pd-empty__icon"><Icon name="gem" size={26} /></div>
            <h2>No Premium Codes Yet</h2>
            <p>You haven't purchased any premium codes. Unlock premium sharing now.</p>
            <button className="pd-btn pd-btn--gold" onClick={() => navigate('/buy')}>
              <Icon name="plus" size={15} /> Purchase Code
            </button>
          </div>
        ) : (
          <div className="pd-grid">

            {/* ── Code list ── */}
            <aside className="pd-codes">
              <div className="pd-codes__head">
                <h2>Your Codes</h2>
                <span className="pd-codes__count">{codes.length}</span>
              </div>

              {codes.map((c) => {
                const isActive = selectedCode && selectedCode.code === c.code
                const dLeft = daysLeftFor(c)
                const isExpiredCard = dLeft !== null && dLeft < 0
                const isExpiringCard = dLeft !== null && !isExpiredCard && dLeft <= 3
                return (
                  <div
                    key={c.code}
                    role="button"
                    tabIndex={0}
                    className={`pd-code-card ${isActive ? 'pd-code-card--active' : ''}`}
                    onClick={() => handleCodeSelect(c)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCodeSelect(c) } }}
                    aria-pressed={isActive}
                  >
                    <div className="pd-code-card__row">
                      <span className="pd-code-card__code">{c.code.toUpperCase()}</span>
                      <span className={`pd-type-badge ${(c.items && c.items[0]) ? `pd-type-badge--${c.items[0].type}` : 'pd-type-badge--empty'}`}>
                        {c.items && c.items[0] && c.items[0].type === 'text' && <Icon name="text" size={11} />}
                        {c.items && c.items[0] && c.items[0].type === 'image' && <Icon name="image" size={11} />}
                        {c.items && c.items[0] && c.items[0].type === 'file' && <Icon name="file" size={11} />}
                        {(c.items && c.items[0] && c.items[0].type) ? c.items[0].type.toUpperCase() : 'EMPTY'}
                      </span>
                    </div>

                    <div className="pd-code-card__preview">
                      {(c.items || []).length === 0 && <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No content yet</span>}
                      {c.items && c.items[0] && c.items[0].type === 'text' && <span>{(c.items[0].text || '').substring(0, 50)}</span>}
                      {c.items && c.items[0] && (c.items[0].type === 'image' || c.items[0].type === 'file') && c.items[0].originalName && <span><Icon name={c.items[0].type} size={11} /> {c.items[0].originalName}</span>}
                      {c.itemCount > 1 && <span style={{ opacity: 0.6 }}> +{c.itemCount - 1} more</span>}
                    </div>

                    <div className="pd-code-card__footer">
                      <div className="pd-code-card__meta">
                        <span className={`pd-code-card__days ${isExpiredCard ? 'pd-code-card__days--expired' : isExpiringCard ? 'pd-code-card__days--warn' : ''}`}>
                          <Icon name="clock" size={11} />
                          {dLeft === null
                            ? 'Lifetime'
                            : isExpiredCard
                              ? 'Expired'
                              : dLeft === 0
                                ? 'Expires today'
                                : `${dLeft} day${dLeft === 1 ? '' : 's'} left`}
                        </span>
                        <span className="pd-lock-dot">{c.isPublic === false ? 'Hidden' : 'Public'}</span>
                        {c.hasPassword && <span className="pd-lock-dot"><Icon name="lock" size={10} /> Protected</span>}
                      </div>
                      <button
                        type="button"
                        className="pd-code-card__renew"
                        title={isExpiredCard ? 'Repurchase code' : 'Renew code'}
                        aria-label={isExpiredCard ? `Repurchase code ${c.code}` : `Renew code ${c.code}`}
                        onClick={(e) => { e.stopPropagation(); navigate(renewUrlFor(c)) }}
                      >
                        <Icon name="refresh" size={13} />
                        <span>{isExpiredCard ? 'Restore' : 'Renew'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}

              <button className="pd-btn pd-btn--ghost pd-codes__cta" onClick={() => navigate('/buy')}>
                <Icon name="plus" size={14} /> Purchase Another
              </button>
            </aside>

            {/* ── Editor panel ── */}
            {selectedCode && (
              <section className="pd-editor">
                <div className="pd-editor__head">
                  <div>
                    <h2 className="pd-editor__head-title">
                      <Icon name="gem" size={14} /> Code
                      <span className="pd-editor__code">{selectedCode.code}</span>
                    </h2>
                    <p className="pd-editor__expiry">
                      Expires: <strong>{new Date(selectedCode.expiresAt).toLocaleDateString()}</strong>
                    </p>
                  </div>
                  <a
                    href={`${window.location.origin}/receive?code=${selectedCode.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pd-btn pd-btn--ghost"
                  >
                    <Icon name="external" size={14} /> Open Link
                  </a>
                </div>

                {/* ── Renewal alert (≤3 days left) ── */}
                {(isExpiringSoon || isExpiredNow) && (
                  <div className={`pd-renewal ${isExpiredNow ? 'pd-renewal--expired' : ''}`} role="alert">
                    <div className="pd-renewal__icon">
                      <Icon name="alert" size={17} />
                    </div>
                    <div className="pd-renewal__body">
                      <strong>
                        {isExpiredNow
                          ? 'This code has expired'
                          : daysLeft === 0
                            ? 'Expires today'
                            : daysLeft === 1
                              ? 'Expires in 1 day'
                              : `Expires in ${daysLeft} days`}
                      </strong>
                      <span>
                        {isExpiredNow
                          ? 'Renew now to reactivate it for another 30 days.'
                          : 'Renew now to keep it active for another 30 days.'}
                      </span>
                      <span className="pd-renewal__warn">
                        {isExpiredNow
                          ? `All extra slots you purchased for this code have been discarded. Repurchasing starts over with the default 2 slots — capacity is not restored.`
                          : `If you don't renew before expiry, everything under this code will be discarded — including every extra slot you purchased (currently ${selectedCode.capacity} slots) and all its content.`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="pd-btn pd-btn--gold"
                      onClick={() => navigate(renewUrl)}
                    >
                      <Icon name="refresh" size={14} /> Renew · 30 days
                    </button>
                  </div>
                )}

                {/* ── Expired slot-loss warning ── */}
                {isExpiredNow && (
                  <div className="pd-alert pd-alert--error" role="alert" style={{ marginTop: '12px' }}>
                    <Icon name="alert" size={15} />
                    <span>
                      <strong>Extra slots are gone.</strong> This code has expired, so any additional slots you
                      purchased beyond the default 2 have been permanently discarded. Repurchasing restores
                      only the default 2 slots.
                    </span>
                  </div>
                )}

                <div className="premium-form" style={{ gap: '26px' }}>
                  {successMessage && (
                    <div className="pd-alert pd-alert--success" role="status">
                      <Icon name="check" size={15} /><span>{successMessage}</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="pd-alert pd-alert--error" role="alert">
                      <Icon name="alert" size={15} /><span>{errorMessage}</span>
                    </div>
                  )}

                  {/* ── Display settings ── */}
                  <div className="pd-section">
                    <h3 className="pd-section__title"><Icon name="sparkles" size={14} /> Display &amp; Visibility</h3>
                    <div className="pd-settings-grid">
                      <div>
                        <label className="pd-field__label" htmlFor="pd-display-name">Display Name</label>
                        <input
                          id="pd-display-name"
                          type="text"
                          className="pd-input"
                          placeholder="Your public display name"
                          value={displayNameInput}
                          onChange={(e) => setDisplayNameInput(e.target.value)}
                        />
                        <p className="pd-field__hint">Shown on receive page &amp; public marquee</p>
                      </div>
                      <div>
                        <label className="pd-field__label" id="pd-visibility-label">Show Code in Public</label>
                        <button
                          type="button"
                          className={`pd-toggle ${isPublic ? 'pd-toggle--on' : ''}`}
                          onClick={() => setIsPublic(!isPublic)}
                          role="switch"
                          aria-checked={isPublic}
                          aria-labelledby="pd-visibility-label"
                        >
                          <span className="pd-toggle__label">
                            <Icon name={isPublic ? 'globe' : 'lock'} size={15} />
                            {isPublic ? 'Public' : 'Hidden'}
                          </span>
                          <span className="pd-toggle__track" aria-hidden="true" />
                        </button>
                        <p className="pd-field__hint">
                          {isPublic ? 'Code & display name shown in public marquee' : 'Only display name shown in public marquee'}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '14px' }}>
                      <button
                        type="button"
                        className="pd-btn pd-btn--purple"
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                      >
                        {savingSettings ? (
                          <><span className="pd-spinner" /> Saving...</>
                        ) : (
                          <>Save Display Name &amp; Visibility</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ── Items editor ── */}
                  <div className="pd-section">
                    <h3 className="pd-section__title">
                      <Icon name="gem" size={14} /> Items
                      <span className="pd-capacity-meter">
                        {(selectedCode.items || []).length} / {selectedCode.capacity} slots used
                      </span>
                    </h3>

                    <div className="pd-capacity-bar">
                      <div
                        className="pd-capacity-bar__fill"
                        style={{ width: `${Math.min(100, ((selectedCode.items || []).length / selectedCode.capacity) * 100)}%` }}
                      />
                    </div>

                    {(selectedCode.items || []).length === 0 ? (
                      <p className="pd-field__hint">No items yet. Add text or files below.</p>
                    ) : (
                      <ul className="pd-items">
                        {selectedCode.items.map((item) => (
                          <li key={item.itemId} className="pd-item">
                            <span className={`pd-type-badge pd-type-badge--${item.type}`}>
                              {item.type === 'text' && <Icon name="text" size={11} />}
                              {item.type === 'image' && <Icon name="image" size={11} />}
                              {item.type === 'file' && <Icon name="file" size={11} />}
                              {item.type.toUpperCase()}
                            </span>
                            <span className="pd-item__name">
                              {item.type === 'text'
                                ? (item.text || '').substring(0, 60)
                                : item.originalName || item.itemId}
                            </span>
                            {item.size > 0 && <span className="pd-item__size">{formatFileSize(item.size)}</span>}
                            <button
                              type="button"
                              className="pd-btn pd-btn--ghost pd-btn--clear"
                              onClick={() => deleteItem(item.itemId)}
                              disabled={deletingItemId === item.itemId}
                            >
                              {deletingItemId === item.itemId ? '...' : 'Delete'}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="pd-tabs" role="tablist" aria-label="Add item type" style={{ marginTop: '16px' }}>
                      {['text', 'image', 'file'].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          role="tab"
                          aria-selected={activeTab === tab}
                          className={`pd-tab ${activeTab === tab ? 'pd-tab--active' : ''}`}
                          onClick={() => handleTabChange(tab)}
                        >
                          {tab === 'text' && <Icon name="text" size={14} />}
                          {tab === 'image' && <Icon name="image" size={14} />}
                          {tab === 'file' && <Icon name="file" size={14} />}
                          {tab.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      {activeTab === 'text' && (
                        <>
                          <label className="pd-field__label" htmlFor="pd-new-text">New Text Item</label>
                          <textarea
                            id="pd-new-text"
                            rows="5"
                            className="pd-input pd-textarea"
                            placeholder="Type text to add as a new item..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                          />
                          <div className="pd-actions" style={{ marginTop: '12px' }}>
                            <button type="button" className="pd-btn pd-btn--gold" onClick={addTextItem} disabled={addingItem || !textInput.trim()}>
                              {addingItem ? 'Adding...' : 'Add Text'}
                            </button>
                          </div>
                        </>
                      )}

                      {(activeTab === 'image' || activeTab === 'file') && (
                        <>
                          <label className="pd-field__label">
                            Upload {activeTab === 'image' ? 'Images' : 'Files'} (select multiple)
                          </label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={activeTab === 'image' ? 'image/*' : '*'}
                            onChange={handleFilesSelected}
                            className="pd-input"
                            style={{ padding: '10px' }}
                          />
                          {files.length > 0 && (
                            <p className="pd-field__hint">{files.length} file{files.length === 1 ? '' : 's'} selected</p>
                          )}
                          <div className="pd-actions" style={{ marginTop: '12px' }}>
                            <button type="button" className="pd-btn pd-btn--gold" onClick={addFiles} disabled={addingItem || files.length === 0}>
                              {addingItem ? 'Uploading...' : 'Upload Files'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <button type="button" className="pd-btn pd-btn--purple" onClick={openBuyModal}>
                        <Icon name="plus" size={14} /> Buy More Slots · ₹{slotPrice}/slot
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Password protection ── */}
                <div className="pd-lock">
                  <div className="pd-lock__head">
                    <Icon name="lock" size={18} />
                    <h3 className="pd-lock__title">Password Protection</h3>
                    {selectedCode.hasPassword && (
                      <span className="pd-protected-pill">Protected</span>
                    )}
                  </div>

                  <p className="pd-lock__desc">
                    {selectedCode.hasPassword
                      ? 'This code is password protected. Enter a new password below to change it, or leave empty to remove protection.'
                      : 'Add an optional password to protect this code. Anyone receiving content will need to enter this password first.'}
                  </p>

                  {passwordMessage.text && (
                    <div className={`pd-alert ${passwordMessage.type === 'success' ? 'pd-alert--success' : 'pd-alert--error'}`} style={{ marginBottom: '12px' }} role={passwordMessage.type === 'error' ? 'alert' : 'status'}>
                      {passwordMessage.type === 'success' ? <Icon name="check" size={14} /> : <Icon name="alert" size={14} />}
                      <span>{passwordMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSetPassword}>
                    <div className="pd-lock__row">
                      <input
                        type="password"
                        className="pd-input"
                        placeholder={selectedCode.hasPassword ? "Enter new password (leave empty to remove)" : "Enter password (optional)"}
                        value={codePassword}
                        onChange={(e) => setCodePassword(e.target.value)}
                        aria-label="Code password"
                      />
                      <button type="submit" className="pd-btn pd-btn--gold" disabled={passwordLoading}>
                        {passwordLoading ? (
                          <><span className="pd-spinner pd-spinner--dark" /> Saving...</>
                        ) : (
                          selectedCode.hasPassword ? 'Change Password' : 'Set Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* ── Change Password Modal ── */}
      {showChangePasswordModal && (
        <div className="pd-modal-overlay" onClick={closeChangePasswordModal}>
          <div
            className="pd-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
          >
            <div className="pd-modal__head">
              <h2 id="change-password-title">Change Password</h2>
              <button
                type="button"
                className="pd-modal__close"
                onClick={closeChangePasswordModal}
                aria-label="Close"
                disabled={changePasswordLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="pd-modal__desc">
              Update the password used to log in to your premium account.
            </p>

            <form onSubmit={handleChangePassword} className="pd-modal__form">
              {changePasswordError && (
                <div className="pd-alert pd-alert--error" role="alert">
                  <Icon name="alert" size={14} /><span>{changePasswordError}</span>
                </div>
              )}
              {changePasswordSuccess && (
                <div className="pd-alert pd-alert--success" role="status">
                  <Icon name="check" size={14} /><span>{changePasswordSuccess}</span>
                </div>
              )}

              <label className="pd-field__label" htmlFor="pd-cur-pass">Current Password</label>
              <input
                id="pd-cur-pass"
                type="password"
                className="pd-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setChangePasswordError(''); setChangePasswordSuccess('') }}
                autoFocus
              />

              <label className="pd-field__label" htmlFor="pd-new-pass">New Password</label>
              <input
                id="pd-new-pass"
                type="password"
                className="pd-input"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setChangePasswordError(''); setChangePasswordSuccess('') }}
              />

              <label className="pd-field__label" htmlFor="pd-conf-pass">Confirm New Password</label>
              <input
                id="pd-conf-pass"
                type="password"
                className="pd-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setChangePasswordError(''); setChangePasswordSuccess('') }}
              />

              <div className="pd-modal__actions">
                <button type="button" className="pd-btn pd-btn--ghost" onClick={closeChangePasswordModal} disabled={changePasswordLoading}>
                  Cancel
                </button>
                <button type="submit" className="pd-btn pd-btn--gold" disabled={changePasswordLoading}>
                  {changePasswordLoading ? (
                    <><span className="pd-spinner pd-spinner--dark" /> Saving...</>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Account Modal ── */}
      {showDeleteModal && (
        <div className="pd-modal-overlay" onClick={closeDeleteModal}>
          <div
            className="pd-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
          >
            <div className="pd-modal__head">
              <h2 id="delete-account-title">Delete Account</h2>
              <button
                type="button"
                className="pd-modal__close"
                onClick={closeDeleteModal}
                aria-label="Close"
                disabled={deleteLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="pd-modal__desc">
              This permanently deletes your premium account, all your purchased codes, their uploaded
              files and your payment records. Your codes will become available for purchase by others.
              This action <strong>cannot be undone</strong>.
            </p>

            <form onSubmit={handleDeleteAccount} className="pd-modal__form">
              {deleteError && (
                <div className="pd-alert pd-alert--error" role="alert">
                  <Icon name="alert" size={14} /><span>{deleteError}</span>
                </div>
              )}

              <label className="pd-field__label" htmlFor="pd-del-pass">Password</label>
              <input
                id="pd-del-pass"
                type="password"
                className="pd-input"
                placeholder="Enter your current password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError('') }}
                autoFocus
                disabled={deleteLoading}
              />

              <label className="pd-field__label" htmlFor="pd-del-confirm">Type <strong>{username}</strong> to confirm</label>
              <input
                id="pd-del-confirm"
                type="text"
                className="pd-input"
                placeholder={username}
                value={deleteConfirm}
                onChange={(e) => { setDeleteConfirm(e.target.value); setDeleteError('') }}
                disabled={deleteLoading}
              />

              <div className="pd-modal__actions">
                <button type="button" className="pd-btn pd-btn--ghost" onClick={closeDeleteModal} disabled={deleteLoading}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pd-btn pd-btn--danger"
                  disabled={deleteLoading || deleteConfirm.trim() !== username || !deletePassword}
                >
                  {deleteLoading ? (
                    <><span className="pd-spinner" /> Deleting...</>
                  ) : (
                    'Delete My Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Buy More Slots Modal ── */}
      {showBuyModal && (
        <div className="pd-modal-overlay" onClick={() => !buyLoading && setShowBuyModal(false)}>
          <div className="pd-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="buy-slots-title">
            <div className="pd-modal__head">
              <h2 id="buy-slots-title">Buy More Slots</h2>
              <button type="button" className="pd-modal__close" onClick={() => setShowBuyModal(false)} disabled={buyLoading} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="pd-modal__desc">
              Add extra slots to code <strong>{selectedCode?.code}</strong> at ₹{slotPrice} per slot.
              Current capacity: <strong>{selectedCode?.capacity}</strong>.
            </p>

            <div className="pd-modal__form">
              {buyMessage && <div className="pd-alert pd-alert--error" role="alert"><Icon name="alert" size={14} /><span>{buyMessage}</span></div>}

              <label className="pd-field__label" htmlFor="pd-slot-count">Number of slots</label>
              <input
                id="pd-slot-count"
                type="number"
                min="1"
                max="20"
                className="pd-input"
                value={slotCount}
                onChange={(e) => setSlotCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                disabled={buyLoading}
              />

              <p className="pd-field__hint">Total: ₹{slotCount * slotPrice}</p>

              <div className="pd-modal__actions">
                <button type="button" className="pd-btn pd-btn--ghost" onClick={() => setShowBuyModal(false)} disabled={buyLoading}>Cancel</button>
                <button type="button" className="pd-btn pd-btn--gold" onClick={buyCapacity} disabled={buyLoading}>
                  {buyLoading ? 'Processing...' : 'Pay ₹' + slotCount * slotPrice}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

PremiumDashboard.propTypes = {};

export default PremiumDashboard