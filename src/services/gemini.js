import { judges } from '../data/sampleData'

export function isConfigured() {
  return typeof window !== 'undefined' && typeof window.puter !== 'undefined'
}

async function callAI(prompt) {
  if (!isConfigured()) throw new Error('Puter.js is not loaded.')
  
  try {
    const response = await window.puter.ai.chat(prompt)
    if (typeof response === 'string') return response
    return response?.message?.content || response.toString()
  } catch (error) {
    throw new Error('Puter AI Error: ' + error.message)
  }
}

export async function analyzeCase(c) {
  const judge = judges.find(j => j.id === c.judge)
  return callAI(
    `You are an expert Indian legal AI assistant. Analyze this case:\n\n` +
    `Case ID: ${c.id}\nTitle: ${c.title}\nType: ${c.type}\nCourt: ${c.court}\n` +
    `Judge: ${judge?.name || 'Unassigned'}\nFiled: ${c.filingDate}\nStatus: ${c.status}\n` +
    `Petitioner: ${c.parties.petitioner}\nRespondent: ${c.parties.respondent}\n` +
    `Documents: ${c.documents} | Hearings: ${c.hearings} | Witnesses: ${c.witnesses} | Charges: ${c.charges}\n` +
    `Custody: ${c.custodyInvolved ? 'Yes' : 'No'} | Fundamental Rights: ${c.fundamentalRights ? 'Yes' : 'No'}\n` +
    `Public Interest: ${c.publicInterest}/5 | Cross-Jurisdiction: ${c.crossJurisdiction ? 'Yes' : 'No'}\n` +
    `Complexity: ${c.complexityScore || 'N/A'}/100 | Urgency: ${c.urgencyIndex || 'N/A'}/100 | Priority: ${c.aiPriority || 'N/A'}\n\n` +
    `Provide:\n## Case Summary\n## Legal Complexity Analysis\n## Risk Assessment\n## Priority Recommendation\n## Estimated Timeline\n## Key Legal Issues\n## Precedent Suggestions\n## Recommended Next Steps\n\nKeep concise, focus on Indian legal context.`
  )
}

export async function getJudgeRecommendation(c) {
  const judgeList = judges.map(j => `- ${j.name} | ${j.court} | ${j.specialization} | Load: ${j.caseLoad}/${j.maxLoad} | Efficiency: ${j.efficiency}%`).join('\n')
  return callAI(
    `Recommend the best judge for this case:\n\nCase: ${c.title}\nType: ${c.type}\nCourt: ${c.court}\nComplexity: ${c.complexityScore || 'N/A'}/100\n\n` +
    `Available Judges:\n${judgeList}\n\n` +
    `Provide:\n## Top Recommendation\n## Alternative Option\n## Selection Criteria\n## Considerations\n\nFocus on specialization match and workload balance.`
  )
}

export async function compareCases(cases) {
  const desc = cases.map((c, i) => `Case ${i + 1}: ${c.id} — ${c.title}\n  Type: ${c.type} | Complexity: ${c.complexityScore} | Urgency: ${c.urgencyIndex} | Priority: ${c.aiPriority}`).join('\n\n')
  return callAI(
    `Compare and rank these cases by priority:\n\n${desc}\n\n` +
    `Provide:\n## Priority Order\n## Comparative Analysis\n## Critical Factors\n## Action Items`
  )
}

export async function summarizeArguments(c) {
  return callAI(
    `Summarize the key arguments for petitioner (${c.parties.petitioner}) and respondent (${c.parties.respondent}) in case ${c.id}: ${c.title}. Provide a neutral, 3-bullet summary for each side.`
  )
}

export async function askJudgeChatbot(history, cases) {
  const caseContext = cases.map(c => `ID: ${c.id} - ${c.title} (${c.status})`).join('\n')
  
  const formattedHistory = history.map(h => `${h.role === 'model' ? 'AI' : 'User'}: ${h.text}`).join('\n')
  
  const prompt = `You are a strict legal assistant chatbot exclusively for the Judge Panel. 
Your ONLY purpose is to answer questions related to the following cases context.
If a user asks anything unrelated to the cases or legal analysis of these cases, you MUST politely refuse and state your limitations.

Available Cases Context:
${caseContext}

Conversation History:
${formattedHistory}

Respond to the last User message. Remember, refuse off-topic inquiries.`

  return callAI(prompt)
}
