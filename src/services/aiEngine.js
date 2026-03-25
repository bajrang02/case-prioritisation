const caseTypeComplexity = {
  Constitutional: 90, Criminal: 80, 'Cyber Crime': 75, Environmental: 70,
  Corporate: 65, Tax: 60, Labor: 55, Civil: 50, Property: 45, Family: 40
}

export function calculateComplexity(c) {
  let score = 0
  score += Math.min(c.documents / 200, 1) * 100 * 0.15
  score += (c.parties ? 2 : 1) / 3 * 100 * 0.10
  score += (caseTypeComplexity[c.type] || 50) * 0.20
  score += Math.min(c.precedents / 15, 1) * 100 * 0.10
  score += (c.crossJurisdiction ? 100 : 0) * 0.10
  score += Math.min(c.charges / 10, 1) * 100 * 0.15
  score += Math.min(c.witnesses / 30, 1) * 100 * 0.10
  score += Math.min(c.hearings / 20, 1) * 100 * 0.10
  return Math.round(Math.min(score, 100))
}

export function calculateUrgency(c) {
  let score = 0
  const now = new Date()
  const ageDays = Math.floor((now - new Date(c.filingDate)) / 86400000)
  score += Math.min(ageDays / 730, 1) * 100 * 0.20
  if (c.nextHearing) {
    const d = Math.floor((new Date(c.nextHearing) - now) / 86400000)
    score += (d <= 0 ? 100 : d <= 7 ? 90 : d <= 30 ? 60 : d <= 90 ? 30 : 10) * 0.20
  }
  score += (c.custodyInvolved ? 100 : 0) * 0.20
  score += (c.fundamentalRights ? 100 : 0) * 0.15
  score += Math.min(c.publicInterest / 5, 1) * 100 * 0.15
  if (c.statutoryDeadline) {
    const d = Math.floor((new Date(c.statutoryDeadline) - now) / 86400000)
    score += (d <= 0 ? 100 : d <= 30 ? 90 : d <= 90 ? 60 : d <= 180 ? 30 : 10) * 0.10
  }
  return Math.round(Math.min(score, 100))
}

export function classifyPriority(complexity, urgency) {
  const combined = complexity * 0.45 + urgency * 0.55
  if (combined >= 70) return 'Critical'
  if (combined >= 50) return 'High'
  if (combined >= 30) return 'Medium'
  return 'Low'
}

function getComplexityReason(c) {
  const r = []
  if (c.crossJurisdiction) r.push('cross-jurisdiction disputes')
  if (c.charges > 5) r.push('high charge count')
  if (c.documents > 50) r.push('heavy documentation volume')
  if (c.type === 'Constitutional' || c.type === 'Criminal') r.push('severe case classification')
  return r.length ? `Scored due to ${r.join(', ')}.` : 'Standard complexity profile.'
}

function getUrgencyReason(c, ageDays) {
  const r = []
  if (c.custodyInvolved) r.push('active custody status')
  if (c.fundamentalRights) r.push('fundamental rights risk')
  if (ageDays > 365) r.push('prolonged case age')
  if (c.publicInterest > 3) r.push('high public interest')
  return r.length ? `Elevated urgency based on ${r.join(' and ')}.` : 'Routine scheduling priority.'
}

export function scoreCases(cases) {
  const now = new Date()
  return cases.map(c => {
    const complexity = calculateComplexity(c)
    const urgency = calculateUrgency(c)
    const priority = classifyPriority(complexity, urgency)
    const combined = Math.round(complexity * 0.45 + urgency * 0.55)
    
    const ageDays = Math.floor((now - new Date(c.filingDate)) / 86400000)
    const reqReason = getComplexityReason(c)
    const urgReason = getUrgencyReason(c, ageDays)
    
    return { ...c, complexityScore: complexity, urgencyIndex: urgency, aiPriority: priority, combinedScore: combined, compReason: reqReason, urgReason: urgReason }

  }).sort((a, b) => b.combinedScore - a.combinedScore)
}
