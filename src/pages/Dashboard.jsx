import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const prClass = p => ({ Critical: 'p-critical', High: 'p-high', Medium: 'p-medium', Low: 'p-low' }[p] || '')

export default function Dashboard({ cases, navigate, user, pendingUsers, setPendingUsers, showToast }) {
  const prRef = useRef(null)
  const tyRef = useRef(null)
  const charts = useRef([])

  const [approvedUsers, setApprovedUsers] = useState([])
  const [chartFilter, setChartFilter] = useState(null)

  // Fetch approved users if admin
  useEffect(() => {
    if (user?.id === 'Admin') {
      fetch('/api/users').then(r => r.json()).then(setApprovedUsers).catch(console.error)
    }
  }, [user, pendingUsers])

  const pending = cases.filter(c => c.status !== 'Disposed').length
  const critical = cases.filter(c => c.aiPriority === 'Critical').length
  const avg = cases.length ? Math.round(cases.reduce((s, c) => s + c.complexityScore, 0) / cases.length) : 0
  const hoursSaved = cases.filter(c => c.status === 'Disposed').length * 4.5
  const disposedCount = cases.filter(c => c.status === 'Disposed').length
  const pendingHearings = cases.filter(c => c.nextHearing && new Date(c.nextHearing) > new Date()).length

  const approveUser = async (pUser) => {
    try {
      const res = await fetch('/api/users/approve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pUser.id, action: 'approve' })
      })
      if (res.ok) {
        setPendingUsers(pendingUsers.filter(u => u.id !== pUser.id))
        showToast(`Approved ${pUser.name}'s account`, 'success')
      }
    } catch(e) {}
  }

  const rejectUser = async (pUser) => {
    // ... logic left unchanged
    try {
      const res = await fetch('/api/users/approve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pUser.id, action: 'reject' })
      })
      if (res.ok) {
        setPendingUsers(pendingUsers.filter(u => u.id !== pUser.id))
        showToast(`Rejected ${pUser.name}'s request`, 'info')
      }
    } catch(e) {}
  }

  const removeUser = async (aUser) => {
    if(!confirm(`Are you sure you want to remove ${aUser.name}?`)) return
    try {
      const res = await fetch(`/api/users/${aUser.id}`, { method: 'DELETE' })
      if (res.ok) {
        setApprovedUsers(approvedUsers.filter(u => u.id !== aUser.id))
        showToast(`Removed ${aUser.name} from system`, 'info')
      }
    } catch(e) {}
  }

  useEffect(() => {
    if (user?.id === 'Admin') return // don't render case charts for admin

    charts.current.forEach(c => c.destroy())
    charts.current = []

    const pCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
    cases.forEach(c => pCounts[c.aiPriority]++)
    if (prRef.current) {
      charts.current.push(new Chart(prRef.current, {
        type: 'doughnut',
        data: { labels: Object.keys(pCounts), datasets: [{ data: Object.values(pCounts), backgroundColor: ['#f43f5e', '#f59e0b', '#6366f1', '#10b981'], borderWidth: 0 }] },
        options: { 
          responsive: true, maintainAspectRatio: false, 
          plugins: { legend: { position: 'right', labels: { color: '#94a3b8', usePointStyle: true } } }, cutout: '65%',
          onClick: (evt, active) => {
            if (active.length > 0) {
              const label = Object.keys(pCounts)[active[0].index]
              setChartFilter(prev => prev === label ? null : label)
            } else {
              setChartFilter(null)
            }
          }
        }
      }))
    }

    const tCounts = {}
    cases.forEach(c => tCounts[c.type] = (tCounts[c.type] || 0) + 1)
    if (tyRef.current) {
      charts.current.push(new Chart(tyRef.current, {
        type: 'bar',
        data: { labels: Object.keys(tCounts), datasets: [{ data: Object.values(tCounts), backgroundColor: ['#6366f1','#06b6d4','#f59e0b','#10b981','#f43f5e','#8b5cf6','#fb923c','#14b8a6','#e879f9','#fbbf24'], borderWidth: 0, borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: '#64748b', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } } } }
      }))
    }

    return () => charts.current.forEach(c => c.destroy())
  }, [cases, user])

  const top = cases.filter(c => chartFilter ? c.aiPriority === chartFilter : (c.aiPriority === 'Critical' || c.aiPriority === 'High')).slice(0, 8)

  if (user?.id === 'Admin') {
    return (
      <div>
        <div className="page-header"><h1>User Management</h1><p>System Administration Dashboard</p></div>
        
        {pendingUsers.length > 0 && (
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="card-head"><h3><i className="fas fa-users-cog"></i> Pending Approvals</h3></div>
            <table className="table">
              <thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Action</th></tr></thead>
              <tbody>
                {pendingUsers.map(u => (
                  <tr key={u.id}>
                    <td className="bold">{u.id}</td>
                    <td>{u.name}</td>
                    <td><span className="badge p-medium">{u.role}</span></td>
                    <td>
                      <button className="btn btn-success btn-sm" style={{ marginRight: 8 }} onClick={() => approveUser(u)}>Approve</button>
                      <button className="btn btn-outline btn-sm" onClick={() => rejectUser(u)}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card">
          <div className="card-head"><h3><i className="fas fa-users"></i> Approved System Users</h3></div>
          <table className="table">
            <thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Action</th></tr></thead>
            <tbody>
              {approvedUsers.map(u => (
                <tr key={u.id}>
                  <td className="bold">{u.id}</td>
                  <td>{u.name}</td>
                  <td><span className="badge p-low">{u.role}</span></td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }} onClick={() => removeUser(u)}><i className="fas fa-trash-alt" /> Remove</button>
                  </td>
                </tr>
              ))}
              {approvedUsers.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>No other users in the system.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header"><h1>Dashboard</h1><p>AI-Powered Legal Case Overview</p></div>
      
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => navigate('cases')} style={{ cursor: 'pointer' }} title="View all cases">
          <div className="kpi-icon bg-indigo"><i className="fas fa-folder-open" /></div>
          <div className="kpi-info"><div className="kpi-val">{cases.length}</div><div className="kpi-label">{user?.role === 'Lawyer' ? 'My Filed Cases' : 'Total Cases'}</div></div>
        </div>
        
        {user?.role === 'Judge' ? (
          <>
            <div className="kpi-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))', border: '1px solid var(--emerald)' }} title="Impact Metric">
              <div className="kpi-icon bg-emerald" style={{ boxShadow: '0 0 12px var(--emerald)' }}><i className="fas fa-bolt" /></div>
              <div className="kpi-info"><div className="kpi-val" style={{ color: 'var(--emerald)' }}>{hoursSaved} hrs</div><div className="kpi-label">Est. Judicial Hours Saved</div></div>
            </div>
            <div className="kpi-card" onClick={() => navigate('prioritization')} style={{ cursor: 'pointer' }} title="View critical cases">
              <div className="kpi-icon bg-rose"><i className="fas fa-exclamation-triangle" /></div>
              <div className="kpi-info"><div className="kpi-val">{critical}</div><div className="kpi-label">Critical</div></div>
            </div>
            <div className="kpi-card" onClick={() => navigate('prioritization')} style={{ cursor: 'pointer' }} title="View AI Prioritization">
              <div className="kpi-icon bg-amber"><i className="fas fa-brain" /></div>
              <div className="kpi-info"><div className="kpi-val">{avg}</div><div className="kpi-label">Avg Complexity</div></div>
            </div>
          </>
        ) : (
          <>
            <div className="kpi-card" title="Upcoming Hearings">
              <div className="kpi-icon bg-amber"><i className="fas fa-calendar-alt" /></div>
              <div className="kpi-info"><div className="kpi-val">{pendingHearings}</div><div className="kpi-label">Upcoming Hearings</div></div>
            </div>
            <div className="kpi-card" title="Disposed Cases">
              <div className="kpi-icon bg-emerald"><i className="fas fa-check-circle" /></div>
              <div className="kpi-info"><div className="kpi-val">{disposedCount}</div><div className="kpi-label">Disposed Cases</div></div>
            </div>
            <div className="kpi-card" title="Active Litigations">
              <div className="kpi-icon bg-rose"><i className="fas fa-balance-scale" /></div>
              <div className="kpi-info"><div className="kpi-val">{pending}</div><div className="kpi-label">Active Litigations</div></div>
            </div>
          </>
        )}
      </div>
      {cases.length > 0 ? (
        <>
          <div className="charts-grid">
            <div className="card"><h3>Priority Distribution <span className="meta" style={{fontSize:'0.8rem', marginLeft: 8}}>(Click pie piece to filter list)</span></h3><div className="chart-box"><canvas ref={prRef} /></div></div>
            <div className="card"><h3>Cases by Type</h3><div className="chart-box"><canvas ref={tyRef} /></div></div>
          </div>
          <div className="card">
            <div className="card-head"><h3>{chartFilter ? `${chartFilter} Priority Cases` : 'High Priority Cases'}</h3><button className="btn btn-outline btn-sm" onClick={() => { setChartFilter(null); navigate('cases') }}>View All</button></div>
            <table className="table"><thead><tr><th>Case ID</th><th>Title</th><th>Type</th><th>Priority</th><th>Score</th><th>Next Hearing</th><th>Status</th></tr></thead>
            <tbody>{top.map(c => <tr key={c.id}><td className="link">{c.id}</td><td>{c.title.substring(0, 40)}…</td><td>{c.type}</td><td><span className={`badge ${prClass(c.aiPriority)}`}>{c.aiPriority}</span></td><td>{c.combinedScore}</td><td>{fmtDate(c.nextHearing)}</td><td><span className={`badge st-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>{c.status}</span></td></tr>)}</tbody></table>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
          <i className="fas fa-folder-open" style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}></i>
          <h3>No Cases Found</h3>
          <p>There are no active cases to display on the dashboard at this time.</p>
          {user?.role === 'Lawyer' && (
            <div style={{ marginTop: 24 }}>
              <button className="btn btn-primary" onClick={() => navigate('newcase')}>
                <i className="fas fa-plus-circle"></i> File Your First Case
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
