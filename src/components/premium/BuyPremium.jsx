import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { endpoints } from '../../api/api'
import { Skeleton } from '../common/Skeleton'
import './BuyPremiumRedesign.css'

/* ── Icon primitives (clean, professional, no emojis) ── */
const IconCrown = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 17V5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3z" />
    <path d="M8 12l-2-2 4-4 4 4 4-4 4 4" />
  </svg>
)

const IconLightning = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L2 14h6v6l11-10h-6l1-6z" />
  </svg>
)

const IconShield = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const IconSparkle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.9 5.4h5.4l-4.4 3.2 1.7 5.4-4.6-3.1L5.4 17l1.7-5.4L2.7 8.4h5.4z" />
  </svg>
)

const IconCheck = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconClose = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const IconEye = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconEyeOff = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

/* ── Stepper timeline ── */
const STEPS = [
  { id: 0, label: 'Choose Code', sub: 'Select or enter your premium code' },
  { id: 1, label: 'Create Account', sub: 'Set your login credentials' },
  { id: 2, label: 'Review & Pay', sub: 'Confirm and complete payment' },
  { id: 3, label: 'Complete', sub: 'Your premium code is active' },
]

const Stepper = ({ activeStep }) => {
  return (
    <div className="bp-stepper">
      <div className="bp-stepper__track">
        {STEPS.map((step, i) => {
          const state = step.id < activeStep ? 'complete' : step.id === activeStep ? 'active' : 'idle'
          return (
            <React.Fragment key={step.id}>
              {i > 0 && (
                <div
                  className="bp-stepper__line"
                  style={{
                    background: i <= activeStep ? 'linear-gradient(90deg, var(--color-premium), var(--color-premium-light))' : undefined,
                  }}
                />
              )}
              <motion.div
                className={`bp-stepper__step bp-stepper__step--${state}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="bp-stepper__pill">
                  {state === 'complete' ? <IconCheck size={16} /> : step.id + 1}
                </div>
                <span className="bp-stepper__label">{step.label}</span>
                <span className="bp-stepper__caption">{step.sub}</span>
              </motion.div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

const BuyPremium = () => {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [codeLength, setCodeLength] = useState(4) // 4 or 6
  const [isChecking, setIsChecking] = useState(false)
  const [codeStatus, setCodeStatus] = useState(null) // 'available' | 'unavailable' | null
  const [codeMessage, setCodeMessage] = useState('')

  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [pricingSettings, setPricingSettings] = useState({ premiumCodePrice4Digit: 299, premiumCodePrice6Digit: 99 })
  const [forSaleCodes, setForSaleCodes] = useState([])
  const [amount, setAmount] = useState('299')
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null) // 'success' | 'failed' | 'cancelled'
  const [errorMessage, setErrorMessage] = useState('')
  const [transactionDetails, setTransactionDetails] = useState(null)
  const [pricingLoading, setPricingLoading] = useState(true)
  const [showNewUserConfirm, setShowNewUserConfirm] = useState(false)
  const [checkingAccount, setCheckingAccount] = useState(false)

  // Fetch Pricing & Codes for Sale
  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      await Promise.all([fetchPricing(), fetchForSaleCodes()])
      if (isMounted) setPricingLoading(false)
    }
    loadData()
    return () => { isMounted = false }
  }, [])

  const fetchPricing = async () => {
    try {
      const res = await fetch(endpoints.pricingSettings)
      const data = await res.json()
      if (data.success && data.pricing) {
        setPricingSettings(data.pricing)
      }
    } catch (err) {
      console.error('Failed to fetch pricing settings:', err)
    }
  }

  const fetchForSaleCodes = async () => {
    try {
      const res = await fetch(endpoints.premiumCodesForSale)
      const data = await res.json()
      if (data.success) {
        setForSaleCodes(data.codes || [])
      }
    } catch (err) {
      console.error('Failed to fetch codes for sale:', err)
    }
  }

  const renderVaultSkeleton = () => (
    <div className="bp-vault">
      <div className="bp-vault__preview">
        <div className="bp-vault__preview-inner">
          <Skeleton className="bp-vault__placeholder" style={{ height: '80px', width: '100%' }} />
          <Skeleton className="bp-vault__price-tag" style={{ height: '40px', width: '120px', marginTop: '16px' }} />
        </div>
      </div>
      <div className="bp-vault__rail-section" style={{ marginTop: '24px' }}>
        <Skeleton className="bp-vault__rail-header" style={{ height: '20px', width: '180px', marginBottom: '12px' }} />
        <div className="bp-vault__rail">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="bp-vault__tile" style={{ height: '72px', width: '100%' }} />
          ))}
        </div>
      </div>
    </div>
  )

  const renderCheckoutSkeleton = () => (
    <div className="bp-checkout">
      <div className="bp-checkout__panel">
        <div className="bp-checkout__panel-inner">
          <Skeleton className="bp-checkout__title" style={{ height: '28px', width: '200px', marginBottom: '8px' }} />
          <Skeleton className="bp-checkout__subtitle" style={{ height: '16px', width: '100%', marginBottom: '24px' }} />

          <div className="bp-field">
            <Skeleton className="bp-label" style={{ height: '14px', width: '100px', marginBottom: '8px' }} />
            <div className="bp-segmented">
              <Skeleton className="bp-seg-button" style={{ height: '40px', flex: 1 }} />
              <Skeleton className="bp-seg-button" style={{ height: '40px', flex: 1 }} />
            </div>
          </div>

          <div className="bp-field" style={{ marginTop: '20px' }}>
            <Skeleton className="bp-label" style={{ height: '14px', width: '180px', marginBottom: '8px' }} />
            <Skeleton className="bp-input" style={{ height: '48px', width: '100%' }} />
          </div>

          <div className="bp-field" style={{ marginTop: '20px' }}>
            <Skeleton className="bp-label" style={{ height: '14px', width: '160px', marginBottom: '8px' }} />
            <Skeleton className="bp-cred-input" style={{ height: '48px', width: '100%', marginBottom: '8px' }} />
            <Skeleton className="bp-cred-input" style={{ height: '48px', width: '100%' }} />
          </div>

          <div className="bp-review" style={{ marginTop: '24px' }}>
            <Skeleton className="bp-review-content" style={{ height: '48px', width: '100%' }} />
          </div>

          <Skeleton className="bp-pay" style={{ height: '52px', width: '100%', marginTop: '20px' }} />
        </div>
      </div>
    </div>
  )

  const getDisplayPrice = () => {
    // Check if the typed code is listed for sale by admin
    const found = forSaleCodes.find(c => c.code.toUpperCase() === code.toUpperCase())
    if (found) {
      return found.price
    }
    return codeLength === 4 ? pricingSettings.premiumCodePrice4Digit : pricingSettings.premiumCodePrice6Digit
  }

  // Update amount dynamically when code, codeLength or pricing changes
  useEffect(() => {
    const price = getDisplayPrice()
    setAmount(price.toString())
  }, [code, codeLength, pricingSettings, forSaleCodes])

  // Check code availability in real-time
  const checkCodeAvailability = async (codeToCheck) => {
    const cleanCode = codeToCheck.trim()
    if (cleanCode.length !== codeLength) {
      setCodeStatus(null)
      setCodeMessage('')
      return
    }

    setIsChecking(true)
    setCodeStatus(null)
    setCodeMessage('')

    try {
      const res = await fetch(endpoints.checkPremiumCode(cleanCode))
      const data = await res.json()
      if (res.ok) {
        if (data.isAvailable) {
          setCodeStatus('available')
          setCodeMessage('This code is available!')
        } else {
          // Check if this is one of our own for-sale codes
          const isListedForSale = forSaleCodes.some(c => c.code.toUpperCase() === cleanCode.toUpperCase())
          if (isListedForSale) {
            setCodeStatus('available')
            setCodeMessage('Listed for sale — available for instant purchase!')
          } else {
            setCodeStatus('unavailable')
            setCodeMessage('Already owned by someone else.')
          }
        }
      } else {
        setCodeStatus('unavailable')
        setCodeMessage(data.message || 'Error checking availability')
      }
    } catch (err) {
      console.error(err)
      setCodeMessage('Network error checking availability')
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (code) {
      const timer = setTimeout(() => {
        checkCodeAvailability(code)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setCodeStatus(null)
      setCodeMessage('')
    }
  }, [code, codeLength])

  // Determine active stepper step from current form progress
  const activeStep = useMemo(() => {
    if (paymentStatus === 'success') return 3
    if (code && codeStatus === 'available' && usernameInput.trim() && passwordInput.trim()) return 2
    if (code && codeStatus === 'available') return 1
    return 0
  }, [paymentStatus, code, codeStatus, usernameInput, passwordInput])

  const handleBuyNow = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setPaymentStatus(null)
    setTransactionDetails(null)

    if (!code || code.trim().length !== codeLength) {
      setErrorMessage(`Please enter a valid ${codeLength}-character alphanumeric code.`)
      return
    }

    if (codeStatus !== 'available') {
      setErrorMessage('The code you selected is not available.')
      return
    }

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Please enter a username and password to create/secure your premium account.')
      return
    }

    const finalAmountInRs = parseFloat(amount)
    if (!finalAmountInRs || isNaN(finalAmountInRs)) {
      setErrorMessage('Please enter a valid amount')
      return
    }

    const amountInPaise = Math.round(finalAmountInRs * 100)

    if (amountInPaise < 100) {
      setErrorMessage('Minimum payment amount is ₹1.00')
      return
    }

    setCheckingAccount(true)

    try {
      const checkRes = await fetch(endpoints.checkAccount, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput
        })
      })
      const checkData = await checkRes.json()

      if (!checkData.success) {
        throw new Error(checkData.message || 'Failed to verify account credentials')
      }

      // Existing user with wrong password → block payment
      if (checkData.exists && checkData.passwordMatch === false) {
        setErrorMessage(checkData.message || 'Username already exists and password does not match')
        return
      }

      // New user → confirm before opening the payment window
      if (!checkData.exists) {
        setShowNewUserConfirm(true)
        return
      }

      // Existing user with matching password → proceed
      await openPaymentWindow(amountInPaise, finalAmountInRs)
    } catch (err) {
      console.error('Error checking account:', err)
      setErrorMessage(err.message || 'Could not verify account credentials. Please try again.')
    } finally {
      setCheckingAccount(false)
    }
  }

  const handleNewUserConfirm = async () => {
    setShowNewUserConfirm(false)

    const finalAmountInRs = parseFloat(amount)
    const amountInPaise = Math.round(finalAmountInRs * 100)

    try {
      await openPaymentWindow(amountInPaise, finalAmountInRs)
    } catch (err) {
      console.error('Error starting checkout:', err)
      setErrorMessage(err.message || 'Could not initiate checkout. Please try again.')
    }
  }

  const openPaymentWindow = async (amountInPaise, finalAmountInRs) => {
    setLoading(true)

    try {
      // Step 1: Create Razorpay Order on backend
      const response = await fetch(endpoints.createOrder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          username: usernameInput.trim(),
          code: code.trim(),
          receipt: `rcpt_${Date.now()}`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment order')
      }

      const { order_id, currency, amount: respAmount } = data

      // Step 2: Configure Razorpay Checkout Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TLzqWxx7hzbAYk',
        amount: respAmount,
        currency: currency,
        name: 'TShare Code Store',
        description: `Premium Code ${code} for ${usernameInput}`,
        image: '/s2.svg',
        order_id: order_id,
        handler: async (paymentResponse) => {
          setLoading(true)
          try {
            // Verify payment signature & register user/code on success
            const verifyResponse = await fetch(endpoints.verifyPayment, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                order_id: paymentResponse.razorpay_order_id,
                payment_id: paymentResponse.razorpay_payment_id,
                signature: paymentResponse.razorpay_signature,
                username: usernameInput.trim(),
                password: passwordInput,
                code: code.trim(),
                amount: respAmount
              })
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok) {
              setPaymentStatus('success')
              setTransactionDetails({
                paymentId: paymentResponse.razorpay_payment_id,
                orderId: paymentResponse.razorpay_order_id,
                amount: finalAmountInRs,
                code: code.trim()
              })
              // Store credentials to auto-login
              localStorage.setItem('tshare_premium_username', usernameInput.trim())
              localStorage.setItem('tshare_premium_password', passwordInput)
              // Refresh listings
              fetchForSaleCodes()
            } else {
              setPaymentStatus('failed')
              setErrorMessage(verifyData.message || 'Payment verification failed')
            }
          } catch (err) {
            console.error('Verification call error:', err)
            setPaymentStatus('failed')
            setErrorMessage('Network error during payment verification')
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: usernameInput,
          email: `${usernameInput}@tshare.in`,
          contact: '9999999999'
        },
        notes: {
          code: code,
          username: usernameInput
        },
        theme: {
          color: '#d4af37'
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setPaymentStatus('cancelled')
            setErrorMessage('Payment process cancelled.')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (paymentResponse) {
        console.error('Payment failed event:', paymentResponse.error)
        setPaymentStatus('failed')
        setErrorMessage(paymentResponse.error.description || 'Payment transaction failed')
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      console.error('Error starting checkout:', err)
      setErrorMessage(err.message || 'Could not initiate checkout. Please try again.')
      setLoading(false)
    }
  }

  const availabilityColor = codeStatus === 'available'
    ? 'var(--theme-success)'
    : codeStatus === 'unavailable'
      ? 'var(--theme-danger)'
      : 'var(--text-muted)'

  const payEnabled = !loading && !checkingAccount && paymentStatus !== 'success' && codeStatus === 'available' && code && usernameInput.trim() && passwordInput.trim()

  return (
    <div className="bp-page">
      {/* ════════════════════════════════════════════════════════════
          HERO — magazine-style with floating orbs + feature ribbon
       ════════════════════════════════════════════════════════════ */}
      <motion.section
        className="bp-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bp-hero__orb bp-hero__orb--1" />
        <div className="bp-hero__orb bp-hero__orb--2" />
        <div className="bp-hero__orb bp-hero__orb--3" />

        <div className="bp-hero__content">
          <motion.div
            className="bp-hero__badge"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <IconCrown size={16} />
            <span>TSHARE PREMIUM CODES</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Claim Your Premium Identity
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            Unlock custom shortcodes, personalized display branding, and permanent cloud sharing. Choose a curated code or secure your own custom name.
          </motion.p>

          <motion.div
            className="bp-hero__features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            <div className="bp-hero__feature">
              <span className="bp-hero__feature-icon"><IconShield size={16} /></span>
              Exclusive Ownership
            </div>
            <div className="bp-hero__feature">
              <span className="bp-hero__feature-icon"><IconSparkle size={16} /></span>
              Gold Branding
            </div>
            <div className="bp-hero__feature">
              <span className="bp-hero__feature-icon"><IconLightning size={16} /></span>
              Premium Panel
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ════════════════════════════════════════════════════════════
          STEPPER PROCESS TIMELINE
       ════════════════════════════════════════════════════════════ */}
      <Stepper activeStep={activeStep} />

      {/* ════════════════════════════════════════════════════════════
          MAIN STAGE — asymmetrical split vault + checkout
       ════════════════════════════════════════════════════════════ */}
      <motion.div
        className="bp-stage"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.34 }}
      >
        {pricingLoading ? (
          <>
            {renderVaultSkeleton()}
            {renderCheckoutSkeleton()}
          </>
        ) : (
          <>
            {/* ── LEFT: Code Vault ────────────────────────────────────── */}
            <div className="bp-vault">
          {/* Live code plaque preview */}
          <div className="bp-vault__preview">
            <div className="bp-vault__preview-inner">
              {code && code.length === codeLength ? (
                <>
                  <div className="bp-vault__code-display">{code}</div>
                  <div className="bp-vault__status-dot" style={{ color: availabilityColor }}>
                    <span className="bp-vault__status-bullet" style={{ background: availabilityColor }} />
                    {isChecking ? 'Checking availability…' : codeMessage || 'Enter a code to check availability'}
                  </div>
                  <div className="bp-vault__price-tag">₹{amount}</div>
                </>
              ) : (
                <>
                  <div className="bp-vault__placeholder">
                    Your premium code will appear here
                  </div>
                  <div className="bp-vault__price-tag">From ₹{amount}</div>
                </>
              )}
            </div>
          </div>

          {/* Curated code rail (horizontal, not a vertical card stack) */}
          {forSaleCodes.length > 0 && (
            <div className="bp-vault__rail-section">
              <div className="bp-vault__rail-header">
                <span className="bp-vault__rail-title">Curated Codes for Sale</span>
              </div>
              <div className="bp-vault__rail">
                {forSaleCodes.map((item) => {
                  const selected = code.toUpperCase() === item.code.toUpperCase()
                  return (
                    <motion.button
                      key={item.code}
                      className={`bp-vault__tile ${selected ? 'bp-vault__tile--selected' : ''}`}
                      whileHover={{ y: -3 }}
                      onClick={() => {
                        setCode(item.code)
                        setCodeLength(item.code.length)
                        setAmount(item.price.toString())
                        setCodeStatus('available')
                        setCodeMessage(`Listed price: ₹${item.price}`)
                      }}
                    >
                      <span className="bp-vault__tile-code">{item.code}</span>
                      <span className="bp-vault__tile-meta">{item.code.length} digits · ₹{item.price}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Secure Checkout Panel ────────────────────────── */}
        <div className="bp-checkout">
          <div className="bp-checkout__panel">
            <div className="bp-checkout__panel-inner">
              <div className="bp-checkout__header">
                <h2 className="bp-checkout__title">Secure Your Code</h2>
                <p className="bp-checkout__subtitle">Configure your code and create account credentials to activate it instantly.</p>
              </div>

              <form onSubmit={handleBuyNow} className="bp-form">
                {/* Code length segmented control */}
                <div className="bp-field">
                  <label className="bp-label">Code Length</label>
                  <div className="bp-segmented">
                    <button
                      type="button"
                      className={`bp-seg-button ${codeLength === 4 ? 'bp-seg-button--active' : ''}`}
                      onClick={() => { setCodeLength(4); setCode('') }}
                    >
                      4-Digit Code
                    </button>
                    <button
                      type="button"
                      className={`bp-seg-button ${codeLength === 6 ? 'bp-seg-button--active' : ''}`}
                      onClick={() => { setCodeLength(6); setCode('') }}
                    >
                      6-Digit Code
                    </button>
                  </div>
                </div>

                {/* Code input */}
                <div className="bp-field">
                  <label className="bp-label">Desired Premium Code</label>
                  <div className="bp-input bp-input--code" style={{ paddingRight: isChecking ? '44px' : '14px' }}>
                    <input
                      type="text"
                      placeholder={`Enter custom ${codeLength}-character code`}
                      value={code}
                      maxLength={codeLength}
                      onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}
                    />
                    {isChecking && (
                      <div className="bp-checking" style={{ right: '14px' }}>
                        <span className="bp-checking__dot" />
                      </div>
                    )}
                  </div>
                  {codeMessage && !isChecking && (
                    <div className="bp-avail" style={{ color: availabilityColor }}>
                      <span className="bp-avail__icon">
                        {codeStatus === 'available' ? <IconCheck size={14} /> : <IconClose size={14} />}
                      </span>
                      <span>{codeMessage}</span>
                    </div>
                  )}
                </div>

                {/* Credentials */}
                <div className="bp-field">
                  <label className="bp-label">Account Credentials</label>
                  <div className="bp-creds">
                    <input
                      type="text"
                      placeholder="Username (e.g. alex)"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      className="bp-cred-input"
                    />
                    <div className="bp-password-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="bp-cred-input"
                        style={{ paddingRight: '44px' }}
                      />
                      <button
                        type="button"
                        className="bp-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </button>
                    </div>
                  </div>
                  <p className="bp-cred-note">
                    You will use these credentials to log in and manage your purchased codes.
                  </p>
                </div>

                {/* Order review strip */}
                <div className="bp-review">
                  <div>
                    <span className="bp-label" style={{ color: 'var(--text-muted)' }}>Order Summary</span>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                      Code: <span className="bp-code-pill">{code || '—'}</span>
                    </div>
                  </div>
                  <div className="bp-price-pill">₹{amount}</div>
                </div>

                {/* Inline feedback */}
                <AnimatePresence mode="wait">
                  {errorMessage && (
                    <motion.div
                      key="error"
                      className="bp-alert bp-alert--error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <IconClose size={16} />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  {paymentStatus === 'success' && transactionDetails && (
                    <motion.div
                      key="success"
                      className="bp-alert bp-alert--success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                    >
                      <div className="bp-success-icon">
                        <IconCheck size={24} />
                      </div>
                      <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--color-premium-light)' }}>
                        Purchase Successful!
                      </h3>
                      <div className="bp-receipt">
                        <p><strong>Code Owned:</strong> <span>{transactionDetails.code}</span></p>
                        <p><strong>Payment ID:</strong> <span>{transactionDetails.paymentId}</span></p>
                        <p><strong>Order ID:</strong> <span>{transactionDetails.orderId}</span></p>
                        <p><strong>Amount Paid:</strong> <span>₹{transactionDetails.amount.toFixed(2)}</span></p>
                      </div>
                      <motion.button
                        type="button"
                        className="bp-pay"
                        style={{ marginTop: '6px', background: 'var(--theme-success-bg)', color: 'var(--theme-success-text)', boxShadow: '0 0 14px rgba(34,197,94,0.35)' }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate('/premium/dashboard')}
                      >
                        Go to Premium Dashboard
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pay button */}
                <motion.button
                  type="submit"
                  className="bp-pay"
                  disabled={!payEnabled}
                  whileHover={payEnabled ? { scale: 1.03 } : {}}
                  whileTap={payEnabled ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="bp-spinner" />
                      <span>Processing…</span>
                    </div>
                  ) : paymentStatus === 'success' ? (
                    'Code Activated'
                  ) : (
                    `Buy Now — ₹${amount}`
                  )}
                </motion.button>

                <div className="bp-footer-link">
                  <span style={{ color: 'var(--text-muted)' }}>Already own a code? </span>
                  <Link to="/premium/login">Premium Login</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        </>
        )}
      </motion.div>

      {/* New user confirmation modal */}
      <AnimatePresence>
        {showNewUserConfirm && (
          <motion.div
            className="bp-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewUserConfirm(false)}
          >
            <motion.div
              className="bp-modal"
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bp-modal__icon">
                <IconSparkle size={22} />
              </div>
              <h3 className="bp-modal__title">New Account Purchase</h3>
              <p className="bp-modal__text">
                <strong>{usernameInput.trim()}</strong> isn't registered yet. You're about to purchase
                code <strong className="bp-code-pill">{code}</strong> on a brand-new account.
              </p>
              <p className="bp-modal__text bp-modal__text--muted">
                This will create a new premium account with these credentials. Make sure the username
                and password are correct.
              </p>
              <div className="bp-modal__actions">
                <motion.button
                  type="button"
                  className="bp-modal__btn bp-modal__btn--ghost"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowNewUserConfirm(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  className="bp-modal__btn bp-modal__btn--confirm"
                  whileHover={{ scale: 1.02 }}
                  onClick={handleNewUserConfirm}
                >
                  Continue to Payment
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BuyPremium
