export default function TopHeader({ setPage, onLogout }) {
  const date = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  return (
    <header className="top-header">
      <div className="search-bar">
        <i className="fas fa-search" />
        <input placeholder="Search cases, judges, courts..." />
      </div>
      <div className="header-right">
        <span className="header-date">{date}</span>
        <button className="header-btn" onClick={() => setPage('settings')} title="Settings"><i className="fas fa-cog" /></button>
        <button className="header-btn" onClick={onLogout} title="Logout" style={{ color: 'var(--rose)' }}><i className="fas fa-sign-out-alt" /></button>
      </div>
    </header>
  )
}
