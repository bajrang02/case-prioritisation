import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import AIPrioritization from './pages/AIPrioritization'
import AIAnalysis from './pages/AIAnalysis'
import NewCase from './pages/NewCase'
import Settings from './pages/Settings'
import Schedule from './pages/Schedule'
import Chatbot from './components/Chatbot'
import { scoreCases } from './services/aiEngine'

export default function App() {
  const [user, setUser] = useState(null)
  const [pendingUsers, setPendingUsers] = useState([])
  const [page, setPage] = useState('dashboard')
  const [cases, setCases] = useState([])
  const [collapsed, setCollapsed] = useState(false)
  const [toast, setToast] = useState(null)
  const [theme, setTheme] = useState(localStorage.getItem('jf-theme') || 'justice')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('jf-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!user) {
      setCases([])
      setIsLoading(false)
      return
    }
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/cases?userId=${user.id}&userRole=${user.role}`)
        if (res.ok) {
          const data = await res.json()
          setCases(data)
        }
      } catch (err) {
        console.error('Failed to fetch cases:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user])

  // Fetch pending users periodically if Admin is logged in
  useEffect(() => {
    if (user?.id === 'Admin') {
      const getPending = async () => {
        try {
          const res = await fetch('/api/users/pending')
          if (res.ok) setPendingUsers(await res.json())
        } catch(e) {}
      }
      getPending()
      const intv = setInterval(getPending, 10000)
      return () => clearInterval(intv)
    }
  }, [user])

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const refreshCases = async () => {
    try {
      if (!user) return;
      const res = await fetch(`/api/cases?userId=${user.id}&userRole=${user.role}`)
      if (res.ok) {
        const data = await res.json()
        setCases(scoreCases(data)) // re-apply scoring locally if config changed
      }
    } catch(e) {}
  }

  const handleLogout = () => {
    setUser(null)
    setPage('dashboard')
  }

  if (isLoading) return (
    <div className="skeleton-container">
      <div className="skeleton-sidebar"></div>
      <div className="skeleton-main">
        <div className="skeleton-header"></div>
        <div className="skeleton-content">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    </div>
  )

  if (!user) return <Login onLogin={setUser} showToast={showToast} />

  const pages = {
    dashboard: <Dashboard cases={cases} navigate={setPage} user={user} pendingUsers={pendingUsers} setPendingUsers={setPendingUsers} showToast={showToast} />,
    cases: <Cases cases={cases} setCases={setCases} showToast={showToast} user={user} />,
    prioritization: <AIPrioritization cases={cases} showToast={showToast} user={user} setCases={setCases} />,
    'ai-analysis': <AIAnalysis cases={cases} showToast={showToast} />,
    newcase: <NewCase cases={cases} setCases={setCases} showToast={showToast} navigate={setPage} user={user} />,
    schedule: <Schedule cases={cases} user={user} navigate={setPage} showToast={showToast} setCases={setCases} />,
    settings: <Settings showToast={showToast} refreshCases={refreshCases} onLogout={handleLogout} user={user} theme={theme} setTheme={setTheme} />
  }

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} user={user} />
      <main className="main-content">
        <TopHeader setPage={setPage} onLogout={handleLogout} />
        <div className="page-content">
          {pages[page] || pages.dashboard}
        </div>
      </main>
      {user.role === 'Judge' && <Chatbot cases={cases} />}
      {toast && <div className={`toast toast-${toast.type}`}><i className={`fas fa-${toast.type === 'success' ? 'check-circle' : toast.type === 'error' ? 'exclamation-circle' : 'info-circle'}`} />{toast.msg}</div>}
    </div>
  )
}
