import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, 'legal.sqlite')

// Initialize SQLite Database
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message)
  } else {
    console.log('Connected to the SQLite database.')
    initializeDB()
  }
})

function initializeDB() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      pass TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'pending' -- 'pending', 'approved', 'rejected'
    )`)

    // 2. Cases Table
    db.run(`CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      court TEXT NOT NULL,
      judge TEXT,
      filingDate TEXT,
      status TEXT,
      petitioner TEXT,
      respondent TEXT,
      documents INTEGER,
      hearings INTEGER,
      witnesses INTEGER,
      custodyInvolved BOOLEAN,
      fundamentalRights BOOLEAN,
      publicInterest INTEGER,
      crossJurisdiction BOOLEAN,
      charges INTEGER,
      precedents INTEGER,
      nextHearing TEXT,
      statutoryDeadline TEXT,
      complexityScore INTEGER,
      urgencyIndex INTEGER,
      combinedScore INTEGER,
      aiPriority TEXT,
      lawyer TEXT
    )`)

    // Seed defaults if empty
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (!err && row.count === 0) {
        console.log('Seeding initial users...')
        const stmt = db.prepare('INSERT INTO users (id, pass, name, role, status) VALUES (?, ?, ?, ?, ?)')
        stmt.run('Admin', 'Admin', 'Justice Admin', 'System Administrator', 'approved')
        stmt.run('judge', 'judge123', 'Hon. Judge', 'Judge', 'approved')
        stmt.run('lawyer', 'lawyer123', 'Advocate Smith', 'Lawyer', 'approved')
        stmt.finalize()
      }
    })

    db.get('SELECT COUNT(*) as count FROM cases', async (err, row) => {
      if (!err && row.count === 0) {
        console.log('Seeding initial cases from sample data...')
        try {
          // Import sample data cleanly
          const dataPath = path.resolve(__dirname, '../src/data/sampleData.js')
          if (fs.existsSync(dataPath)) {
            // Need to read and parse the sampleData because it uses ESM export which is hard to dynamic import easily sometimes without full path
            const { initialCases } = await import('file://' + dataPath.replace(/\\/g, '/'))
            
            // Also need to score them before inserting
            const { scoreCases } = await import('file://' + path.resolve(__dirname, '../src/services/aiEngine.js').replace(/\\/g, '/'))
            const scored = scoreCases(initialCases)

            const stmt = db.prepare(`INSERT INTO cases (id, title, type, court, judge, filingDate, status, petitioner, respondent, documents, hearings, witnesses, custodyInvolved, fundamentalRights, publicInterest, crossJurisdiction, charges, precedents, nextHearing, statutoryDeadline, complexityScore, urgencyIndex, combinedScore, aiPriority, lawyer) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

            for (const c of scored) {
              stmt.run(
                c.id, c.title, c.type, c.court, c.judge || '', c.filingDate, c.status, 
                c.parties.petitioner, c.parties.respondent, c.documents, c.hearings, c.witnesses, 
                c.custodyInvolved ? 1 : 0, c.fundamentalRights ? 1 : 0, c.publicInterest, 
                c.crossJurisdiction ? 1 : 0, c.charges, c.precedents, c.nextHearing, c.statutoryDeadline, 
                c.complexityScore, c.urgencyIndex, c.combinedScore, c.aiPriority, 'lawyer'
              )
            }
            stmt.finalize()
            console.log('Seeded cases successfully.')
          }
        } catch(e) {
          console.error('Failed to seed cases:', e.message)
        }
      }
    })
  })
}

// Promisified DB helpers
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}
