import React, { createContext, useContext, useState, useEffect } from 'react'

const LayoutContext = createContext({
  insideLayout: false,
  isOffline: false,
  setOffline: () => {}
})

export const useLayout = () => useContext(LayoutContext)

export const LayoutProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(() => {
    // If navigator is not available (e.g., SSR), assume online
    if (typeof navigator === 'undefined') return false
    return !navigator.onLine
  })

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <LayoutContext.Provider value={{ insideLayout: true, isOffline, setOffline: setIsOffline }}>
      {children}
    </LayoutContext.Provider>
  )
}

export default LayoutContext