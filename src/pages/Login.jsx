import { useState } from 'react'

export default function Login({ onLogin, showToast, onBack }) {
  const [isSignUP, setIsSignUp] = useState(false)
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('Lawyer')
  const [govId, setGovId] = useState('')
  const [profId, setProfId] = useState('')
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
          body: JSON.stringify({ id: user, pass, name: name || user, role, govId, profId })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        
        showToast('Registration successful! Awaiting Admin approval.', 'success')
        setIsSignUp(false)
        setUser('')
        setPass('')
        setName('')
        setGovId('')
        setProfId('')
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
      <div className="login-card" style={{ maxWidth: isSignUP ? 540 : 440, width: '90%', transition: 'max-width 0.3s ease' }}>
        <div className="login-header" style={{ position: 'relative' }}>
          {onBack && (
            <button 
              onClick={onBack} 
              style={{ position: 'absolute', top: 20, left: 24, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '1.2rem', padding: '10px' }}
              title="Back to Home"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
          )}
          <img src="/logo.png" alt="JurisFlow" className="logo-icon" style={{ width: 64, height: 64, margin: '0 auto 16px', display: 'block', objectFit: 'cover' }} />
          <h1 className="login-title">JurisFlow</h1>
          <p className="login-sub">Case Prioritization & Backlog Reduction</p>
        </div>
        <div className="login-body">
          {error && <div className="login-error">{error}</div>}
          
          <label className="form-label">Username</label>
          <input className="form-input" disabled={isLoading} value={user} onChange={e => setUser(e.target.value)} placeholder="Username" onKeyDown={e => e.key === 'Enter' && submit()} />
          
          <label className="form-label" style={{ marginTop: 14 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              className="form-input" 
              disabled={isLoading} 
              type={showPassword ? 'text' : 'password'} 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              placeholder="Password" 
              onKeyDown={e => e.key === 'Enter' && submit()} 
              style={{ paddingRight: 40 }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem' }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
            </button>
          </div>
          
          {isSignUP && (
            <div className="form-grid" style={{ marginTop: 14, gap: '16px' }}>
              <div>
                <label className="form-label" style={{ marginTop: 0 }}>Full Name</label>
                <input className="form-input" disabled={isLoading} value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" onKeyDown={e => e.key === 'Enter' && submit()} />
              </div>
              
              <div>
                <label className="form-label" style={{ marginTop: 0 }}>Role</label>
                <select className="form-select" disabled={isLoading} value={role} onChange={e => setRole(e.target.value)}>
                  <option value="Lawyer">Lawyer</option>
                  <option value="Judge">Judge</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ marginTop: 0 }}>Government ID Proof</label>
                <input className="form-input" disabled={isLoading} value={govId} onChange={e => setGovId(e.target.value)} placeholder="Aadhar / PAN / Passport" onKeyDown={e => e.key === 'Enter' && submit()} />
              </div>
              
              <div>
                {role === 'Judge' ? (
                  <>
                    <label className="form-label" style={{ marginTop: 0 }}>Judge ID Number</label>
                    <input className="form-input" disabled={isLoading} value={profId} onChange={e => setProfId(e.target.value)} placeholder="Judge Registration ID" onKeyDown={e => e.key === 'Enter' && submit()} />
                  </>
                ) : (
                  <>
                    <label className="form-label" style={{ marginTop: 0 }}>Bar Council ID</label>
                    <input className="form-input" disabled={isLoading} value={profId} onChange={e => setProfId(e.target.value)} placeholder="Lawyer Registration ID" onKeyDown={e => e.key === 'Enter' && submit()} />
                  </>
                )}
              </div>
            </div>
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
