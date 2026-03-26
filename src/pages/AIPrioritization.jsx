import { useState } from 'react'
import CaseDetailModal from '../components/CaseDetailModal'
import { renderMd } from '../components/CaseDetailModal'
import { analyzeCase, getJudgeRecommendation, compareCases, isConfigured, summarizeArguments } from '../services/groq'
import { scoreCases } from '../services/aiEngine'

const prClass = p => ({ Critical: 'p-critical', High: 'p-high', Medium: 'p-medium', Low: 'p-low' }[p] || '')

export default function AIPrioritization({ cases, setCases, showToast, user }) {
  const [selected, setSelected] = useState(null)
  const [compareResult, setCompareResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
  cases.forEach(c => counts[c.aiPriority]++)

  const doCompareTop = async () => {
    if (!isConfigured()) { showToast('Set VITE_GROQ_API_KEY in .env', 'error'); return }
    let top = cases.filter(c => c.aiPriority === 'Critical').slice(0, 3)
    if (top.length < 2) top = cases.slice(0, 3)
    setLoading(true); setCompareResult(null)
    try { const r = await compareCases(top); setCompareResult(r); showToast('Comparison done!', 'success') }
    catch (e) { showToast(e.message, 'error') }
    setLoading(false)
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
      <div className="page-header"><h1>AI Prioritization Engine</h1><p>Complexity analysis & urgency scoring</p></div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-icon bg-rose"><i className="fas fa-fire" /></div><div className="kpi-val">{counts.Critical}</div><div className="kpi-label">Critical</div></div>
        <div className="kpi-card"><div className="kpi-icon bg-amber"><i className="fas fa-exclamation" /></div><div className="kpi-val">{counts.High}</div><div className="kpi-label">High</div></div>
        <div className="kpi-card"><div className="kpi-icon bg-indigo"><i className="fas fa-minus-circle" /></div><div className="kpi-val">{counts.Medium}</div><div className="kpi-label">Medium</div></div>
        <div className="kpi-card"><div className="kpi-icon bg-emerald"><i className="fas fa-check-circle" /></div><div className="kpi-val">{counts.Low}</div><div className="kpi-label">Low</div></div>
      </div>
      <div className="card">
        <div className="card-head">
          <h3>Prioritized Queue</h3>
          <button className="btn btn-primary btn-sm" onClick={doCompareTop}><i className="fas fa-magic" /> Compare Top Cases</button>
        </div>
        {loading && <div className="ai-loading"><div className="spinner" /><span>Comparing...</span></div>}
        {compareResult && <div className="ai-result" style={{ marginBottom: 16 }}><div className="ai-md" dangerouslySetInnerHTML={{ __html: renderMd(compareResult) }} /></div>}
        <table className="table"><thead><tr><th>#</th><th>Case ID</th><th>Title</th><th>Complexity</th><th>Urgency</th><th>Combined</th><th>Priority</th><th>Type</th><th></th></tr></thead>
        <tbody>{cases.map((c, i) => (
          <tr key={c.id}>
            <td className="muted">{i + 1}</td>
            <td className="link" onClick={() => setSelected(c)}>{c.id}</td>
            <td>{c.title.substring(0, 35)}…</td>
            <td><div className="xai-tooltip" style={{ display: 'inline-block' }}><div className="score-bar-sm"><div className="score-fill" style={{ width: `${c.complexityScore}%` }} /></div> <span className="muted">{c.complexityScore}</span><div className="xai-popover"><b>AI Reason:</b> {c.compReason}</div></div></td>
            <td><div className="xai-tooltip" style={{ display: 'inline-block' }}><div className="score-bar-sm"><div className="score-fill" style={{ width: `${c.urgencyIndex}%` }} /></div> <span className="muted">{c.urgencyIndex}</span><div className="xai-popover"><b>AI Reason:</b> {c.urgReason}</div></div></td>
            <td className="bold">{c.combinedScore}</td>
            <td><span className={`badge ${prClass(c.aiPriority)}`}>{c.aiPriority}</span></td>
            <td>{c.type}</td>
            <td><button className="btn btn-outline btn-sm" onClick={() => setSelected(c)} title="View"><i className="fas fa-eye" /></button></td>
          </tr>
        ))}</tbody></table>
      </div>
      {selected && <CaseDetailModal c={selected} onClose={() => setSelected(null)} onAnalyze={analyzeCase} onJudgeRec={getJudgeRecommendation} onTakeCase={() => {}} user={user} onUpdate={updateCase} onSummarize={summarizeArguments} />}
    </div>
  )
}
