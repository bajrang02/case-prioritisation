export default function Settings({ showToast, onLogout, user, theme, setTheme }) {
  const themes = [
    { id: 'justice', name: 'Supreme Justice', icon: 'fa-balance-scale' },
    { id: 'dark', name: 'Dark Slate', icon: 'fa-moon' },
    { id: 'light', name: 'Clean Light', icon: 'fa-sun' },
    { id: 'ocean', name: 'Ocean Blue', icon: 'fa-water' },
    { id: 'crimson', name: 'Crimson Night', icon: 'fa-fire' },
    { id: 'forest', name: 'Forest Elegance', icon: 'fa-leaf' },
    { id: 'royal', name: 'Royal Purple', icon: 'fa-crown' }
  ]

  const changeTheme = (t) => {
    setTheme(t)
    showToast(`Theme changed to ${themes.find(x => x.id === t).name}`, 'success')
  }

  return (
    <div>
      <div className="page-header"><h1>Settings</h1><p>System preferences</p></div>
      <div className="form-grid">
        <div className="card" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
          <div>
            <h3 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><i className="fas fa-shield-alt" style={{ color: 'var(--rose)' }} /> Account Security</h3>
            <p className="meta" style={{ marginBottom: 0, textTransform: 'none' }}>Log out of the LegalAI system to protect your session</p>
          </div>
          <button className="btn btn-outline" onClick={onLogout} style={{ color: 'var(--rose)', borderColor: 'rgba(244,63,94,0.3)' }}><i className="fas fa-sign-out-alt" /> Logout</button>
        </div>
        
        <div className="card">
          <h3>Profile</h3>
          <label className="form-label">Name</label><input className="form-input" defaultValue={user?.name || ''} />
          <label className="form-label">Email</label><input className="form-input" defaultValue={`${user?.id || 'user'}@legalai.gov.in`} />
          <label className="form-label">Role</label><input className="form-input" value={user?.role || ''} disabled style={{ opacity: 0.5 }} />
          <button className="btn btn-primary" onClick={() => showToast('Profile saved', 'success')} style={{ marginTop: 12 }}><i className="fas fa-save" /> Save</button>
        </div>
        
        <div className="card">
          <h3>Appearance</h3>
          <label className="form-label">System Theme</label>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            {themes.map(t => (
              <button 
                key={t.id} 
                className={`btn ${theme === t.id ? 'btn-primary' : 'btn-outline'}`} 
                onClick={() => changeTheme(t.id)}
              >
                <i className={`fas ${t.icon}`} /> {t.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3>AI Engine Settings</h3>
          <label className="form-label">Complexity Weight: 45%</label>
          <input type="range" min={0} max={100} defaultValue={45} style={{ width: '100%' }} />
          <label className="form-label">Urgency Weight: 55%</label>
          <input type="range" min={0} max={100} defaultValue={55} style={{ width: '100%' }} />
          <button className="btn btn-primary" onClick={() => showToast('AI config saved', 'success')} style={{ marginTop: 12 }}><i className="fas fa-save" /> Save</button>
        </div>
      </div>
    </div>
  )
}
