import { useState } from 'react'
import { caseTypes, courts, judges } from '../data/sampleData'
import { scoreCases } from '../services/aiEngine'

export default function NewCase({ cases, setCases, showToast, navigate, user }) {
  const [form, setForm] = useState({ title: '', type: '', court: '', judge: '', petitioner: '', respondent: '', documents: 1, witnesses: 0, charges: 1, custody: false, rights: false, crossJur: false, publicInterest: 3, deadline: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.title || !form.type || !form.court || !form.judge || !form.petitioner || !form.respondent) { showToast('Fill all required fields', 'error'); return }
    const newCase = {
      id: `${form.type.substring(0, 2).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      title: form.title, type: form.type, court: form.court, judge: form.judge,
      filingDate: new Date().toISOString().split('T')[0], status: 'Filed',
      parties: { petitioner: form.petitioner, respondent: form.respondent },
      documents: form.documents, hearings: 0, witnesses: form.witnesses,
      custodyInvolved: form.custody, fundamentalRights: form.rights,
      publicInterest: form.publicInterest, crossJurisdiction: form.crossJur,
      charges: form.charges, precedents: 0, nextHearing: '', statutoryDeadline: form.deadline,
      lawyer: user?.id || ''
    }
    
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase)
      })
      if (res.ok) {
        setCases(scoreCases([...cases, newCase]))
        showToast(`Case ${newCase.id} filed!`, 'success')
        setTimeout(() => navigate('cases'), 800)
      } else {
        const err = await res.json()
        showToast(err.error || 'Failed to file case', 'error')
      }
    } catch(e) {
      showToast('Server error', 'error')
    }
  }

  return (
    <div>
      <div className="page-header"><h1>File New Case</h1><p>Register a new legal case</p></div>
      <div className="form-grid">
        <div className="card">
          <h3>Case Information</h3>
          <label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. State vs. Doe — Theft" />
          <label className="form-label">Type</label><select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}><option value="">Select...</option>{caseTypes.map(t => <option key={t}>{t}</option>)}</select>
          <label className="form-label">Court</label><select className="form-select" value={form.court} onChange={e => set('court', e.target.value)}><option value="">Select...</option>{courts.map(c => <option key={c}>{c}</option>)}</select>
          <label className="form-label">Judge</label><select className="form-select" value={form.judge} onChange={e => set('judge', e.target.value)}><option value="">Select...</option>{judges.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}</select>
        </div>
        <div className="card">
          <h3>Parties & Details</h3>
          <label className="form-label">Petitioner</label><input className="form-input" value={form.petitioner} onChange={e => set('petitioner', e.target.value)} placeholder="Petitioner name" />
          <label className="form-label">Respondent</label><input className="form-input" value={form.respondent} onChange={e => set('respondent', e.target.value)} placeholder="Respondent name" />
          <div className="row-3">
            <div><label className="form-label">Documents</label><input className="form-input" type="number" value={form.documents} onChange={e => set('documents', +e.target.value)} min={0} /></div>
            <div><label className="form-label">Witnesses</label><input className="form-input" type="number" value={form.witnesses} onChange={e => set('witnesses', +e.target.value)} min={0} /></div>
            <div><label className="form-label">Charges</label><input className="form-input" type="number" value={form.charges} onChange={e => set('charges', +e.target.value)} min={1} /></div>
          </div>
          <div className="toggle-group">
            <label><input type="checkbox" checked={form.custody} onChange={e => set('custody', e.target.checked)} /> Custody Involved</label>
            <label><input type="checkbox" checked={form.rights} onChange={e => set('rights', e.target.checked)} /> Fundamental Rights</label>
            <label><input type="checkbox" checked={form.crossJur} onChange={e => set('crossJur', e.target.checked)} /> Cross-Jurisdiction</label>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={submit}><i className="fas fa-paper-plane" /> File Case</button>
      </div>
    </div>
  )
}
