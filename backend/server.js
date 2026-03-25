import express from 'express'
import cors from 'cors'
import { query, run } from './db.js'


const app = express()
app.use(cors({
  origin: 'https://jurisflow-3an7.onrender.com',
  credentials: true
}))
app.use(express.json())

// === AUTH & USERS API ===
app.post('/api/auth/login', async (req, res) => {
  const { user, pass } = req.body
  try {
    const rows = await query('SELECT * FROM users WHERE id = ?', [user])
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials or pending approval' })

    const u = rows[0]
    if (u.pass !== pass) return res.status(401).json({ error: 'Invalid credentials or pending approval' })
    if (u.status === 'pending') return res.status(401).json({ error: 'Account is pending Admin approval' })
    if (u.status === 'rejected') return res.status(401).json({ error: 'Account was rejected' })

    res.json({ id: u.id, name: u.name, role: u.role })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/auth/signup', async (req, res) => {
  const { id, pass, name, role } = req.body
  try {
    const existing = await query('SELECT * FROM users WHERE id = ?', [id])
    if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' })

    await run('INSERT INTO users (id, pass, name, role, status) VALUES (?, ?, ?, ?, ?)', [id, pass, name, role, 'pending'])
    res.json({ success: true, message: 'Registration successful! Awaiting Admin approval.' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/users/pending', async (req, res) => {
  try {
    const rows = await query(`SELECT id, name, role, status FROM users WHERE status = 'pending'`)
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/users/approve', async (req, res) => {
  const { id, action } = req.body // action: 'approve' or 'reject'
  const newStatus = action === 'approve' ? 'approved' : 'rejected'
  try {
    await run('UPDATE users SET status = ? WHERE id = ?', [newStatus, id])
    res.json({ success: true, status: newStatus })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const rows = await query(`SELECT id, name, role, status FROM users WHERE status = 'approved' AND id != 'Admin'`)
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    if (req.params.id === 'Admin') return res.status(403).json({ error: 'Cannot remove system admin' })
    await run('DELETE FROM users WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// === CASES API ===
app.get('/api/cases', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM cases')
    // Parse the boolean and JSON-like fields back into proper structures for the frontend
    const cases = rows.map(c => ({
      ...c,
      custodyInvolved: Boolean(c.custodyInvolved),
      fundamentalRights: Boolean(c.fundamentalRights),
      crossJurisdiction: Boolean(c.crossJurisdiction),
      parties: { petitioner: c.petitioner, respondent: c.respondent }
    }))
    res.json(cases)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/cases', async (req, res) => {
  const c = req.body
  try {
    await run(
      `INSERT INTO cases (id, title, type, court, judge, lawyerId, filingDate, status, petitioner, respondent, documents, hearings, witnesses, custodyInvolved, fundamentalRights, publicInterest, crossJurisdiction, charges, precedents, nextHearing, statutoryDeadline, complexityScore, urgencyIndex, combinedScore, aiPriority) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        c.id, c.title, c.type, c.court, c.judge || '', c.lawyerId || '', c.filingDate, c.status,
        c.parties?.petitioner || '', c.parties?.respondent || '', c.documents || 0, c.hearings || 0, c.witnesses || 0,
        c.custodyInvolved ? 1 : 0, c.fundamentalRights ? 1 : 0, c.publicInterest || 1,
        c.crossJurisdiction ? 1 : 0, c.charges || 1, c.precedents || 0, c.nextHearing || '', c.statutoryDeadline || '',
        c.complexityScore || 0, c.urgencyIndex || 0, c.combinedScore || 0, c.aiPriority || 'Low'
      ]
    )
    res.json({ success: true, case: c })
  } catch (e) {
    console.error('Insert error:', e)
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/cases/:id', async (req, res) => {
  const { status, nextHearing } = req.body
  try {
    await run('UPDATE cases SET status = ?, nextHearing = ? WHERE id = ?', [status, nextHearing, req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/cases/:id/take', async (req, res) => {
  const { judgeId } = req.body
  try {
    await run('UPDATE cases SET judge = ?, status = ? WHERE id = ?', [judgeId, 'In Progress', req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Legal Backend Server running on http://localhost:${PORT}`)
})
