import { useState, useEffect } from 'react'
import { LandingPage } from './components/LandingPage'
import { AuthModal } from './components/AuthModal'
import { StudentDashboard } from './components/student/StudentDashboard'
import { EducationModules } from './components/student/EducationModules'
import { QAForum } from './components/student/QAForum'
import { Resources } from './components/student/Resources'
import { Community } from './components/student/Community'
import { HealthcareDashboard } from './components/healthcare/HealthcareDashboard'
import { Chatbot } from './components/Chatbot'
import { Toaster } from './components/ui/sonner'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Feedback } from './components/Feedback'
import { projectId, publicAnonKey } from './utils/supabase/info'

interface AppUser {
  type: 'student' | 'healthcare' | 'admin'
  name: string
  username: string
  id: string
  email: string
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [currentPage, setCurrentPage] = useState('landing')
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Initialize default data on first load
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-565696a6/init-data`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        })
      } catch (error) {
        console.error('Failed to initialize data:', error)
      }
    }
    initializeData()
  }, [])

  const handleLogin = (userData: AppUser) => {
    console.log('User logged in:', userData)
    setUser(userData)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('landing')
  }

  const handleNavigation = (page: string) => {
    if (!user && page !== 'landing' && page !== 'about' && page !== 'contact') {
      setShowAuthModal(true)
      return
    }
    setCurrentPage(page)
  }

  const handleServiceClick = (service: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setCurrentPage(service)
  }

  // Render appropriate page based on user type and current page
  const renderPage = () => {
    console.log('Rendering page - currentPage:', currentPage, 'user:', user)
    
    // Handle public pages
    if (currentPage === 'about') {
      return <About onBack={() => setCurrentPage('landing')} />
    }
    if (currentPage === 'contact') {
      return <Contact onBack={() => setCurrentPage('landing')} />
    }
    if (currentPage === 'feedback') {
      // Allow opening feedback page for both guests and logged-in users.
      return <Feedback onBack={() => (user ? setCurrentPage('dashboard') : setCurrentPage('landing'))} user={user} />
    }
    
    if (!user) {
      return (
        <LandingPage 
          onLoginClick={() => setShowAuthModal(true)}
          onServiceClick={handleServiceClick}
          onAboutClick={() => setCurrentPage('about')}
          onContactClick={() => setCurrentPage('contact')}
          onFeedbackClick={() => setCurrentPage('feedback')}
        />
      )
    }

    console.log('User type check - user.type:', user.type)

    // Normalize user type for comparison (case-insensitive)
    const userType = user.type?.toLowerCase()

    // Student pages
    if (userType === 'student') {
      switch (currentPage) {
        case 'education':
          return <EducationModules onBack={() => setCurrentPage('dashboard')} user={user} />
        case 'qa':
          return <QAForum onBack={() => setCurrentPage('dashboard')} user={user} />
        case 'community':
          return <Community onBack={() => setCurrentPage('dashboard')} user={user} />
        case 'resources':
          return <Resources onBack={() => setCurrentPage('dashboard')} />
        case 'feedback':
          return <Feedback onBack={() => setCurrentPage('dashboard')} user={user} />
        default:
          return (
            <StudentDashboard 
              user={user}
              onLogout={handleLogout}
              onNavigate={handleNavigation}
            />
          )
      }
    }

    // Healthcare professional pages
    if (userType === 'healthcare' || userType === 'healthcare_professional' || userType === 'healthcare professional') {
      console.log('Rendering Healthcare Dashboard')
      if (currentPage === 'feedback') {
        return <Feedback onBack={() => setCurrentPage('dashboard')} user={user} />
      }
      return (
        <HealthcareDashboard 
          user={user}
          onLogout={handleLogout}
        />
      )
    }

    // Admin pages
    if (userType === 'admin') {
      return (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl mb-4">Admin Dashboard</h1>
            <p className="text-gray-600">Admin dashboard coming soon...</p>
            <button 
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Logout
            </button>
          </div>
        </div>
      )
    }

    // Fallback for unrecognized user types
    console.error('Unrecognized user type:', user.type)
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl mb-4">Error: Unknown User Type</h1>
          <p className="text-gray-600 mb-4">User type "{user.type}" is not recognized.</p>
          <p className="text-gray-500 mb-4">Expected: "student", "healthcare", or "admin"</p>
          <button 
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="size-full">
      {renderPage()}
      
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      {/* Chatbot - Always visible */}
      <Chatbot />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}