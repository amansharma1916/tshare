import React, { useEffect } from 'react'
import './App.css'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
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
import Register from './components/auth/Register.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
import { endpoints } from './api/api.js'
import AppLayout from './components/layout/AppLayout.jsx'

// Layout wrapper for routes that need the sidebar/topbar
const LayoutRoute = ({ children }) => {
  return <AppLayout>{children}</AppLayout>
}

function App() {
  useEffect(() => {
    const controller = new AbortController()

    const wakeServer = async () => {
      try {
        await fetch(endpoints.wakeServer, {
          method: 'GET',
          signal: controller.signal,
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        // Fail silently to avoid blocking UI if the server is cold.
      }
    }

    wakeServer()

    return () => controller.abort()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page redirects to dashboard (which shows hero if not logged in) */}
        <Route path='/' element={<LayoutRoute><Dashboard /></LayoutRoute>} />

        {/* Auth pages (standalone, no layout) */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/admin/login' element={<AdminLogin />} />

        {/* App pages (inside layout) */}
        <Route path='/dashboard' element={<LayoutRoute><Dashboard /></LayoutRoute>} />
        <Route path='/share' element={<LayoutRoute><SharePage /></LayoutRoute>} />
        <Route path='/share-image' element={<LayoutRoute><ImageSharePage /></LayoutRoute>} />
        <Route path='/share-file' element={<LayoutRoute><FileSharePage /></LayoutRoute>} />
        <Route path='/receive' element={<LayoutRoute><RecievePage /></LayoutRoute>} />
        <Route path='/receive-text' element={<LayoutRoute><RecievePage fixedType="text" /></LayoutRoute>} />
        <Route path='/receive-image' element={<LayoutRoute><RecievePage fixedType="image" /></LayoutRoute>} />
        <Route path='/receive-file' element={<LayoutRoute><RecievePage fixedType="file" /></LayoutRoute>} />
        <Route path='/public-room' element={<LayoutRoute><PublicRoom /></LayoutRoute>} />
        <Route path='/admin/panel' element={<LayoutRoute><AdminPanel /></LayoutRoute>} />
        <Route path='/privacy-policy' element={<LayoutRoute><PrivacyPolicy /></LayoutRoute>} />
        <Route path='/terms-of-service' element={<LayoutRoute><TermsOfService /></LayoutRoute>} />
        <Route path='/about' element={<LayoutRoute><About /></LayoutRoute>} />
        <Route path='/contact' element={<LayoutRoute><Contact /></LayoutRoute>} />

        {/* Redirect old routes to new ones */}
        <Route path='/sharePage' element={<Navigate to="/share" replace />} />
        <Route path='/recievePage' element={<Navigate to="/receive" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App