import React, { useEffect } from 'react'
import './App.css'
import { Routes, Route, BrowserRouter, Navigate, useNavigate, useLocation } from 'react-router-dom'
import SharePage from './components/SharePage.jsx'
import ImageSharePage from './components/ImageSharePage.jsx'
import FileSharePage from './components/FileSharePage.jsx'
import RecievePage from './components/RecievePage.jsx'
import AdminLogin from './components/AdminLogin.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import PublicRoom from './components/publicArea/PublicRoom.jsx'
import PrivacyPolicy from './components/pages/PrivacyPage.jsx'
import TermsOfService from './components/pages/TermsOfService.jsx'
import About from './components/pages/About.jsx'
import Contact from './components/pages/Contact.jsx'
import Login from './components/auth/Login.jsx'
import AuthOptions from './components/auth/AuthOptions.jsx'
import Register from './components/auth/Register.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
import LandingPage from './components/landing/LandingPage.jsx'
import { endpoints } from './api/api.js'
import AppLayout from './components/layout/AppLayout.jsx'
import BuyPremium from './components/premium/BuyPremium.jsx'
import PremiumLogin from './components/premium/PremiumLogin.jsx'
import PremiumDashboard from './components/premium/PremiumDashboard.jsx'
import OrgLayout from './components/org/OrgLayout.jsx'
import OrgAuth from './components/org/OrgAuth.jsx'
import OrgDashboard from './components/org-preview/OrgDashboard.jsx'
import OrgSubmitPage from './components/org/OrgSubmitPage.jsx'
import OrgUploadPage from './components/org/OrgUploadPage.jsx'
import { SeoManager } from './seo/useSeo.js'

// Layout wrapper for routes that need the sidebar/topbar
const LayoutRoute = ({ children }) => {
  return <AppLayout>{children}</AppLayout>
}

// Applies per-route title/meta/JSON-LD on every navigation.
const RouteSeo = () => {
  const location = useLocation()
  return <SeoManager pathname={location.pathname} />
}

// Component to handle refresh redirect - only runs once on initial load
const RefreshRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if the page was refreshed (reloaded) - only on initial mount
    const navigationEntries = performance.getEntriesByType('navigation')
    const isRefresh = navigationEntries.length > 0 && navigationEntries[0].type === 'reload'

    if (isRefresh && window.location.pathname !== '/' && !window.location.pathname.startsWith('/org/')) {
      navigate('/', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

function App() {
  useEffect(() => {
    const controller = new AbortController()

    const wakeServer = async () => {
      try {
        await fetch(endpoints.wakeServer, {
          method: 'POST',
          signal: controller.signal,
          keepalive: true,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        // Fail silently to avoid blocking UI if the server is cold.
      }
    }

    const recordVisit = async () => {
      try {
        await fetch(endpoints.visit, {
          method: 'POST',
          signal: controller.signal,
          keepalive: true,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        // Fail silently to avoid blocking UI if the server is cold.
      }
    }

    wakeServer()
    recordVisit()

    return () => controller.abort()
  }, [])

  return (
    <BrowserRouter>
      <RefreshRedirect />
      <RouteSeo />
      <Routes>
        {/* Landing page */}
        <Route path='/' element={<LayoutRoute><LandingPage /></LayoutRoute>} />

        {/* Auth pages (inside layout) */}
        <Route path='/auth' element={<LayoutRoute><AuthOptions /></LayoutRoute>} />
        <Route path='/login' element={<LayoutRoute><Login /></LayoutRoute>} />
        <Route path='/register' element={<LayoutRoute><Register /></LayoutRoute>} />
        <Route path='/admin/login' element={<LayoutRoute><AdminLogin /></LayoutRoute>} />

        {/* App pages (inside layout) */}
        <Route path='/dashboard' element={<LayoutRoute><Dashboard /></LayoutRoute>} />
        <Route path='/buy' element={<LayoutRoute><BuyPremium /></LayoutRoute>} />
        <Route path='/premium/login' element={<LayoutRoute><PremiumLogin /></LayoutRoute>} />
        <Route path='/premium/dashboard' element={<LayoutRoute><PremiumDashboard /></LayoutRoute>} />
        <Route path='/share' element={<LayoutRoute><SharePage /></LayoutRoute>} />
        <Route path='/share-image' element={<LayoutRoute><ImageSharePage /></LayoutRoute>} />
        <Route path='/share-file' element={<LayoutRoute><FileSharePage /></LayoutRoute>} />

        {/* Single unified receive page — auto-detects content type from API */}
        <Route path='/receive' element={<LayoutRoute><RecievePage /></LayoutRoute>} />
        <Route path='/public-room' element={<LayoutRoute><PublicRoom /></LayoutRoute>} />
        <Route path='/admin/panel' element={<LayoutRoute><AdminPanel /></LayoutRoute>} />
        <Route path='/privacy-policy' element={<LayoutRoute><PrivacyPolicy /></LayoutRoute>} />
        <Route path='/terms-of-service' element={<LayoutRoute><TermsOfService /></LayoutRoute>} />
        <Route path='/about' element={<LayoutRoute><About /></LayoutRoute>} />
        <Route path='/contact' element={<LayoutRoute><Contact /></LayoutRoute>} />

        {/* Org module: unified auth page (same AppLayout as other pages) */}
        <Route path='/org/register' element={<LayoutRoute><OrgAuth /></LayoutRoute>} />
        <Route path='/org/login' element={<LayoutRoute><OrgAuth /></LayoutRoute>} />
        <Route path='/org/dashboard' element={<OrgLayout><OrgDashboard /></OrgLayout>} />
        <Route path='/org/submit/:code' element={<OrgSubmitPage />} />
        <Route path='/org/upload/:code' element={<OrgUploadPage />} />

        {/* Redirect old routes to unified receive page */}
        <Route path='/sharePage' element={<Navigate to="/share" replace />} />
        <Route path='/recievePage' element={<Navigate to="/receive" replace />} />
        <Route path='/receive-text' element={<Navigate to="/receive" replace />} />
        <Route path='/receive-image' element={<Navigate to="/receive" replace />} />
        <Route path='/receive-file' element={<Navigate to="/receive" replace />} />

        {/* Catch-all: redirect to landing page */}
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
