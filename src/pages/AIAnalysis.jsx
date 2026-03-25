import { useState } from 'react'
import { renderMd } from '../components/CaseDetailModal'
import { isConfigured, analyzeCase, getJudgeRecommendation, compareCases } from '../services/gemini'

export default function AIAnalysis({ cases, showToast }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [caseId, setCaseId] = useState('')
  const [judgeId, setJudgeId] = useState('')
  const [cmp1, setCmp1] = useState('')
  const [cmp2, setCmp2] = useState('')
  const [cmp3, setCmp3] = useState('')

  const configured = isConfigured()

  const run = async (fn) => {
    setLoading(true); setResult(null)
    try { const r = await fn(); setResult(r); showToast('Analysis complete!', 'success') }
    catch (e) { setResult(`Error: ${e.message}`); showToast(e.message, 'error') }
    setLoading(false)
  }

  const doAnalyze = () => {
    const c = cases.find(x => x.id === caseId)
    if (!c) { showToast('Select a case', 'error'); return }
    run(() => analyzeCase(c))
  }

  const doJudge = () => {
    const c = cases.find(x => x.id === judgeId)
    if (!c) { showToast('Select a case', 'error'); return }
    run(() => getJudgeRecommendation(c))
  }

  const doCompare = () => {
    const ids = [cmp1, cmp2, cmp3].filter(Boolean)
    if (ids.length < 2) { showToast('Select at least 2 cases', 'error'); return }
    const sel = ids.map(id => cases.find(c => c.id === id)).filter(Boolean)
    run(() => compareCases(sel))
  }

  const opts = cases.map(c => <option key={c.id} value={c.id}>{c.id} — {c.title.substring(0, 45)}</option>)

  return (
    <div>
      <div className="page-header"><h1>AI Case Analysis</h1><p>Gemini-powered deep analysis & recommendations</p></div>
      {!configured && <div className="alert alert-warn"><i className="fas fa-exclamation-triangle" /> API key not set — add <code>VITE_GEMINI_API_KEY</code> to your <code>.env</code> file and restart the dev server.</div>}
      <div className="ai-tools-grid">
        <div className="card">
          <h3><i className="fas fa-microscope" /> Analyze Case</h3>
          <p className="meta">Comprehensive AI analysis including risk, complexity, timeline, and precedents.</p>
          <select className="form-select" value={caseId} onChange={e => setCaseId(e.target.value)}><option value="">Select a case...</option>{opts}</select>
          <button className="btn btn-primary" onClick={doAnalyze} style={{ marginTop: 12 }}><i className="fas fa-robot" /> Analyze</button>
        </div>
        <div className="card">
          <h3><i className="fas fa-user-tie" /> Judge Recommendation</h3>
          <p className="meta">AI recommends the best judge based on specialization, workload, and efficiency.</p>
          <select className="form-select" value={judgeId} onChange={e => setJudgeId(e.target.value)}><option value="">Select a case...</option>{opts}</select>
          <button className="btn btn-primary" onClick={doJudge} style={{ marginTop: 12 }}><i className="fas fa-gavel" /> Recommend</button>
        </div>
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <h3><i className="fas fa-balance-scale-right" /> Compare & Prioritize</h3>
          <p className="meta">Select 2–3 cases to compare with Gemini.</p>
          <div className="compare-selects">
            <select className="form-select" value={cmp1} onChange={e => setCmp1(e.target.value)}><option value="">Case 1...</option>{opts}</select>
            <select className="form-select" value={cmp2} onChange={e => setCmp2(e.target.value)}><option value="">Case 2...</option>{opts}</select>
            <select className="form-select" value={cmp3} onChange={e => setCmp3(e.target.value)}><option value="">Case 3 (optional)...</option>{opts}</select>
          </div>
          <button className="btn btn-primary" onClick={doCompare} style={{ marginTop: 12 }}><i className="fas fa-chart-bar" /> Compare</button>
        </div>
      </div>
      {loading && <div className="card"><div className="ai-loading"><div className="spinner" /><span>Gemini is thinking...</span></div></div>}
      {result && <div className="card ai-result"><h3><i className="fas fa-robot" /> Result</h3><div className="ai-md" dangerouslySetInnerHTML={{ __html: renderMd(result) }} /></div>}
    </div>
  )
}
