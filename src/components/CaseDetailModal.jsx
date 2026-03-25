import { useState } from 'react'
import { judges } from '../data/sampleData'

const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const prClass = p => ({ Critical: 'p-critical', High: 'p-high', Medium: 'p-medium', Low: 'p-low' }[p] || '')
const stClass = s => s.toLowerCase().replace(/\s+/g, '-')

export default function CaseDetailModal({ c, onClose, onAnalyze, onJudgeRec, onTakeCase, user, onUpdate, onSummarize }) {
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState({ status: c.status, nextHearing: c.nextHearing || '', complexityScore: c.complexityScore })
  const judge = judges.find(j => j.id === c.judge)

  const handleAi = async (fn, label) => {
    setLoading(true); setAiResult(null)
    try { const r = await fn(c); setAiResult(r) }
    catch (e) { setAiResult(`Error: ${e.message}`) }
    setLoading(false)
  }

  const saveDecision = () => {
    if (onUpdate) onUpdate({ ...c, status: edit.status, nextHearing: edit.nextHearing, complexityScore: Number(edit.complexityScore) })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{c.id} — {c.title}</h3>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times" /></button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div>
              <h4>Case Information</h4>
              <p><strong>Type:</strong> {c.type}</p>
              <p><strong>Court:</strong> {c.court}</p>
              <p><strong>Judge:</strong> {judge?.name || 'N/A'}</p>
              <p><strong>Filed:</strong> {fmtDate(c.filingDate)}</p>
              <p><strong>Status:</strong> <span className={`badge st-${stClass(c.status)}`}>{c.status}</span></p>
              <p><strong>Next Hearing:</strong> {fmtDate(c.nextHearing)}</p>
            </div>
            <div>
              <h4>AI Scores</h4>
              <p><strong>Priority:</strong> <span className={`badge ${prClass(c.aiPriority)}`}>{c.aiPriority}</span></p>
              <p><strong>Combined:</strong> {c.combinedScore}/100</p>
              <div className="score-row"><span>Complexity: {c.complexityScore}</span><div className="score-bar"><div className="score-fill" style={{ width: `${c.complexityScore}%` }} /></div></div>
              <div className="score-row"><span>Urgency: {c.urgencyIndex}</span><div className="score-bar"><div className="score-fill" style={{ width: `${c.urgencyIndex}%` }} /></div></div>
            </div>
          </div>
          <hr />
          
          {user?.role === 'Judge' && c.judge === user.id && c.status !== 'Filed' && (
            <div className="card" style={{ marginBottom: 24, padding: 20, border: '1px solid var(--primary)' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: 16 }}><i className="fas fa-gavel" /> Judge Decision Panel</h4>
              <div className="form-grid" style={{ gap: 16 }}>
                <div>
                  <label className="form-label" style={{ marginTop: 0 }}>Update Status</label>
                  <select className="form-select" value={edit.status} onChange={e => setEdit({...edit, status: e.target.value})}>
                    <option>Filed</option><option>Hearing Scheduled</option><option>In Progress</option><option>Adjourned</option><option>Disposed</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ marginTop: 0 }}>Next Hearing Date</label>
                  <input type="date" className="form-input" value={edit.nextHearing} onChange={e => setEdit({...edit, nextHearing: e.target.value})} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ marginTop: 0 }}>Points of Criticality (Override AI Complexity: 0-100)</label>
                  <input type="number" min="0" max="100" className="form-input" value={edit.complexityScore} onChange={e => setEdit({...edit, complexityScore: e.target.value})} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={saveDecision}><i className="fas fa-check" /> Save Decision & Score</button>
            </div>
          )}

          <div className="detail-grid">
            <div>
              <h4>Parties</h4>
              <p><strong>Petitioner:</strong> {c.parties.petitioner}</p>
              <p><strong>Respondent:</strong> {c.parties.respondent}</p>
            </div>
            <div>
              <h4>Metrics</h4>
              <p>Documents: {c.documents} | Hearings: {c.hearings}</p>
              <p>Witnesses: {c.witnesses} | Charges: {c.charges}</p>
            </div>
          </div>
          {loading && <div className="ai-loading"><div className="spinner" /><span>Puter AI is analyzing...</span></div>}
          {aiResult && <div className="ai-result"><h4><i className="fas fa-robot" /> Puter AI Analysis</h4><div className="ai-md" dangerouslySetInnerHTML={{ __html: renderMd(aiResult) }} /></div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => handleAi(onAnalyze)}><i className="fas fa-robot" /> AI Analyze</button>
          <button className="btn btn-primary" onClick={() => handleAi(onSummarize)} style={{ background: 'linear-gradient(135deg, #10B981, #059669)', shadow: 'none' }}><i className="fas fa-list-ul" /> Summarize Arguments</button>
          <button className="btn btn-outline" onClick={() => handleAi(onJudgeRec)}><i className="fas fa-user-tie" /> Judge Rec.</button>
          {onTakeCase && <button className="btn btn-success" onClick={() => { onTakeCase(c.id); onClose() }}><i className="fas fa-hand-paper" /> Take Case</button>}
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export function renderMd(text) {
  if (!text) return ''
  let t = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  t = t.replace(/^### (.+)$/gm, '<h5>$1</h5>')
  t = t.replace(/^## (.+)$/gm, '<h4>$1</h4>')
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>')
  t = t.replace(/^- (.+)$/gm, '<li>$1</li>')
  t = t.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
  t = t.replace(/\n\n/g, '</p><p>')
  t = t.replace(/\n/g, '<br>')
  return `<p>${t}</p>`
}
