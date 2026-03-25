export default function Sidebar({ page, setPage, collapsed, setCollapsed, user }) {
  const isAdmin = user?.id === 'Admin'
  const canAddCase = user?.role === 'Lawyer'

  const mainItems = isAdmin 
    ? [ { id: 'dashboard', icon: 'fa-users-cog', label: 'User Management' } ]
    : [
        { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
        { id: 'cases', icon: 'fa-folder-open', label: 'Cases' },
        { id: 'schedule', icon: 'fa-calendar-alt', label: 'Schedule' },
        ...(user?.role === 'Judge' ? [{ id: 'prioritization', icon: 'fa-robot', label: 'AI Prioritization' }] : []),
        ...(canAddCase ? [{ id: 'newcase', icon: 'fa-plus-circle', label: 'File New Case' }] : []),
        ...(user?.role !== 'Lawyer' ? [{ id: 'ai-analysis', icon: 'fa-magic', label: 'AI Analysis' }] : [])
      ]

  const nav = [
    { section: isAdmin ? 'Administration' : 'Main', items: mainItems },
    { section: 'System', items: [ { id: 'settings', icon: 'fa-cog', label: 'Settings' } ]}
  ]

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo" onClick={() => { setCollapsed(false); setPage('dashboard'); }}>
          <img src="/logo.png" alt="JurisFlow" className="logo-icon" style={{ objectFit: 'cover' }} />
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-title">JurisFlow</span>
              <span className="logo-sub">Case Engine</span>
            </div>
          )}
        </div>
        {!collapsed && <button className="collapse-btn" onClick={(e) => { e.stopPropagation(); setCollapsed(true); }}><i className="fas fa-chevron-left" /></button>}
      </div>
      <nav className="sidebar-nav">
        {nav.map(s => (
          <div key={s.section} className="nav-section">
            {!collapsed && <span className="nav-section-title">{s.section}</span>}
            {s.items.map(it => (
              <a key={it.id} className={`nav-item${page === it.id ? ' active' : ''}`} onClick={() => setPage(it.id)} title={it.label}>
                <i className={`fas ${it.icon}`} />{!collapsed && <span>{it.label}</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-avatar"><i className="fas fa-user-tie" /></div>
        {!collapsed && <div className="user-info"><span className="user-name">{user?.name}</span><span className="user-role">{user?.role}</span></div>}
      </div>
    </aside>
  )
}
