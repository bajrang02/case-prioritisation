import { useState } from 'react'
import CaseDetailModal from '../components/CaseDetailModal'
import { caseTypes, statuses } from '../data/sampleData'
import { scoreCases } from '../services/aiEngine'
import { analyzeCase, getJudgeRecommendation, summarizeArguments } from '../services/gemini'

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const prClass = p => ({ Critical: 'p-critical', High: 'p-high', Medium: 'p-medium', Low: 'p-low' }[p] || '')

export default function Cases({ cases, setCases, showToast, user }) {
  const [search, setSearch] = useState('')
  const [typeF, setTypeF] = useState('')
  const [statusF, setStatusF] = useState('')
  const [prioF, setPrioF] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = cases.filter(c => {
    if (typeF && c.type !== typeF) return false
    if (statusF && c.status !== statusF) return false
    if (prioF && c.aiPriority !== prioF) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const takeCase = async id => {
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Progress', nextHearing: '' })
      })
      if (res.ok) {
        const updated = cases.map(c => c.id === id ? { ...c, status: 'In Progress' } : c)
        setCases(scoreCases(updated))
        showToast(`Case ${id} taken — status updated to In Progress`, 'success')
      }
    } catch(e) { showToast('Failed to connect to server', 'error') }
  }

  const updateCase = async updatedData => {
    try {
      const res = await fetch(`/api/cases/${updatedData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updatedData.status, nextHearing: updatedData.nextHearing })
      })
      if (res.ok) {
        const updatedList = cases.map(c => c.id === updatedData.id ? updatedData : c)
        setCases(scoreCases(updatedList))
        showToast('Decision saved successfully.', 'success')
      }
    } catch(e) { showToast('Failed to connect to server', 'error') }
  }
  return (
    <div>
      <div className="page-header"><h1>Case Management</h1><p>Browse, filter, and manage all cases</p></div>
      <div className="filter-bar">
        <div className="search-bar" style={{ maxWidth: 280 }}><i className="fas fa-search" /><input placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="form-select" value={typeF} onChange={e => setTypeF(e.target.value)}><option value="">All Types</option>{caseTypes.map(t => <option key={t}>{t}</option>)}</select>
        <select className="form-select" value={statusF} onChange={e => setStatusF(e.target.value)}><option value="">All Statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select>
        <select className="form-select" value={prioF} onChange={e => setPrioF(e.target.value)}><option value="">All Priorities</option>{['Critical','High','Medium','Low'].map(p => <option key={p}>{p}</option>)}</select>
      </div>
      <p className="meta">{filtered.length} of {cases.length} cases</p>
      <div className="cases-grid">
        {filtered.map(c => (
          <div key={c.id} className="case-card" onClick={() => setSelected(c)}>
            <div className="case-card-top"><span className="case-id">{c.id}</span><span className={`badge ${prClass(c.aiPriority)}`}>{c.aiPriority}</span></div>
            <div className="case-card-title">{c.title}</div>
            <div className="case-card-meta"><span><i className="fas fa-gavel" /> {c.type}</span><span><i className="fas fa-calendar" /> {fmtDate(c.filingDate)}</span></div>
            <div className="case-card-scores">
              <div className="xai-tooltip"><span className="score-label">Complexity</span><div className="score-bar"><div className="score-fill" style={{ width: `${c.complexityScore}%` }} /></div><span className="score-val">{c.complexityScore}</span><div className="xai-popover"><b>AI Reason:</b> {c.compReason || 'Standard complexity.'}</div></div>
              <div className="xai-tooltip"><span className="score-label">Urgency</span><div className="score-bar"><div className="score-fill" style={{ width: `${c.urgencyIndex}%` }} /></div><span className="score-val">{c.urgencyIndex}</span><div className="xai-popover"><b>AI Reason:</b> {c.urgReason || 'Standard urgency.'}</div></div>
            </div>
          </div>
        ))}
      </div>
      {selected && <CaseDetailModal c={selected} onClose={() => setSelected(null)} onAnalyze={analyzeCase} onJudgeRec={getJudgeRecommendation} onTakeCase={user?.role === 'Judge' || user?.role === 'System Administrator' ? takeCase : null} user={user} onUpdate={updateCase} onSummarize={summarizeArguments} />}
    </div>
  )
}
