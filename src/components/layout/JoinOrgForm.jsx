import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orgEndpoints } from '../../api/orgEndpoints'

const JoinOrgForm = ({ onNavigate }) => {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  const handleJoinOrg = async (e) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (!code || code.length < 4) return
    setJoinError('')
    setJoinLoading(true)
    try {
      const res = await fetch(orgEndpoints.validate(code))
      const data = await res.json()
      if (!data.success) {
        setJoinError(data.message || 'Organization not found')
        return
      }
      if (onNavigate) onNavigate(`/org/submit/${code}`)
      navigate(`/org/submit/${code}`)
    } catch {
      setJoinError('Failed to validate code. Please try again.')
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <form className="sidebar-join" onSubmit={handleJoinOrg}>
      <div className="sidebar-section-label sidebar-join__label">Join Org</div>
      <div className="sidebar-join__row">
        <input
          className="sidebar-join__input"
          type="text"
          maxLength={4}
          value={joinCode}
          onChange={(e) => {
            setJoinCode(e.target.value.toUpperCase())
            if (joinError) setJoinError('')
          }}
          placeholder="Code e.g. B4K9"
          aria-label="Enter organization code"
          disabled={joinLoading}
        />
        <button
          className="sidebar-join__go"
          type="submit"
          disabled={joinCode.trim().length < 4 || joinLoading}
        >
          {joinLoading ? '...' : 'Go'}
        </button>
      </div>
      {joinError && <div className="sidebar-join__error">{joinError}</div>}
    </form>
  )
}

export default JoinOrgForm
