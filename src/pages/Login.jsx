import { useState } from 'react'

export default function Login({ onLogin, showToast }) {
  const [isSignUP, setIsSignUp] = useState(false)
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('Lawyer')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const submit = async () => {
    if (!user || !pass) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (isSignUP) {
        const res = await fetch('/api/auth/signup', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user, pass, name: name || user, role })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        
        showToast('Registration successful! Awaiting Admin approval.', 'success')
        setIsSignUp(false)
        setUser('')
        setPass('')
        setName('')
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, pass })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        
        onLogin(data) // { id, name, role }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card" style={{ maxWidth: 440, width: '90%' }}>
        <div className="login-header">
          <img src="/logo.png" alt="JurisFlow" className="logo-icon" style={{ width: 64, height: 64, margin: '0 auto 16px', display: 'block', objectFit: 'cover' }} />
          <h1 className="login-title">JurisFlow</h1>
          <p className="login-sub">Case Prioritization & Backlog Reduction</p>
        </div>
        <div className="login-body">
          {error && <div className="login-error">{error}</div>}
          
          <label className="form-label">Username</label>
          <input className="form-input" disabled={isLoading} value={user} onChange={e => setUser(e.target.value)} placeholder="Username" onKeyDown={e => e.key === 'Enter' && submit()} />
          
          <label className="form-label" style={{ marginTop: 14 }}>Password</label>
          <input className="form-input" disabled={isLoading} type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" onKeyDown={e => e.key === 'Enter' && submit()} />
          
          {isSignUP && (
            <>
              <label className="form-label" style={{ marginTop: 14 }}>Full Name</label>
              <input className="form-input" disabled={isLoading} value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" onKeyDown={e => e.key === 'Enter' && submit()} />
              
              <label className="form-label" style={{ marginTop: 14 }}>Role</label>
              <select className="form-select" disabled={isLoading} value={role} onChange={e => setRole(e.target.value)}>
                <option value="Lawyer">Lawyer</option>
                <option value="Judge">Judge</option>
              </select>
            </>
          )}

          <button className="btn btn-primary login-btn" disabled={isLoading} onClick={submit}>
            {isLoading ? <i className="fas fa-circle-notch fa-spin" /> : <i className={isSignUP ? "fas fa-user-plus" : "fas fa-sign-in-alt"} />}
            {" "}{isSignUP ? "Sign Up" : "Sign In"}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a style={{ color: 'var(--primary)', fontSize: '0.85rem' }} onClick={() => { if(!isLoading) { setIsSignUp(!isSignUP); setError(''); } }}>
              {isSignUP ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
