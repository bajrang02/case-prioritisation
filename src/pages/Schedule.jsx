import { useMemo } from 'react'

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function Schedule({ cases, user }) {
  // Sort cases by nextHearing if available, otherwise filingDate. Filter out Disposed.
  const scheduleItems = useMemo(() => {
    return cases
      .filter(c => c.status !== 'Disposed')
      .sort((a, b) => {
        const dateA = new Date(a.nextHearing || a.filingDate).getTime()
        const dateB = new Date(b.nextHearing || b.filingDate).getTime()
        return dateA - dateB
      })
  }, [cases])

  return (
    <div>
      <div className="page-header">
        <h1>Schedule</h1>
        <p>Upcoming hearings and case milestones for {user.role === 'Judge' ? `Judge ${user.name}` : user.name}</p>
      </div>
      <div className="card">
        {scheduleItems.length === 0 ? (
          <p style={{ padding: 20, color: 'var(--muted)', textAlign: 'center' }}>No upcoming schedules.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Case ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {scheduleItems.map(c => (
                <tr key={c.id}>
                  <td className="bold" style={{ color: c.nextHearing ? 'var(--primary)' : 'inherit' }}>
                    {fmtDate(c.nextHearing || c.filingDate)}
                    {!c.nextHearing && <span style={{fontSize: '0.8rem', marginLeft: '6px', color: 'var(--muted)'}}> (Filing)</span>}
                  </td>
                  <td>{c.id}</td>
                  <td>{c.title}</td>
                  <td><span className={`badge st-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>{c.status}</span></td>
                  <td>{c.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
