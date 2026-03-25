import { useState } from 'react'

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function Schedule({ cases, user, navigate }) {
  // sort by next hearing date (nearest first, blanks at the end)
  const sorted = [...cases].sort((a, b) => {
    if (!a.nextHearing) return 1;
    if (!b.nextHearing) return -1;
    return new Date(a.nextHearing) - new Date(b.nextHearing);
  })

  return (
    <div>
      <div className="page-header">
        <h1>My Schedule</h1>
        <p>Track your upcoming case hearings and status</p>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Upcoming Hearings</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Case ID</th>
              <th>Title</th>
              <th>Court & Judge</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => {
              const isPast = c.nextHearing && new Date(c.nextHearing) < new Date();
              return (
                <tr key={c.id}>
                  <td className={isPast ? 'meta' : 'bold'}>
                    {c.nextHearing ? (
                      <><i className="fas fa-calendar-day" style={{marginRight:8, color: isPast ? 'inherit': 'var(--primary)'}} />{fmtDate(c.nextHearing)}</>
                    ) : 'Pending Scheduling'}
                  </td>
                  <td className="link" onClick={() => navigate('cases')}>{c.id}</td>
                  <td>{c.title}</td>
                  <td>{c.court}</td>
                  <td><span className={`badge st-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>{c.status}</span></td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  No active cases in your schedule.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
