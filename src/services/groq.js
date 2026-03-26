import { judges } from '../data/sampleData'

const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const MODEL = 'llama-3.3-70b-versatile'
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'

export function isConfigured() {
  return !!(API_KEY && API_KEY.startsWith('gsk_'))
}

async function callGroq(messages) {
  if (!isConfigured()) {
    throw new Error('Groq API key not configured or invalid. Please add VITE_GROQ_API_KEY to your .env file.')
  }

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || `Groq API Error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response from AI.'
}

export async function analyzeCase(c) {
  const judge = judges.find(j => j.id === c.judge)
  const prompt = `You are an expert Indian legal AI assistant. Analyze this case:

Case ID: ${c.id}
Title: ${c.title}
Type: ${c.type}
Court: ${c.court}
Judge: ${judge?.name || 'Unassigned'}
Filed: ${c.filingDate}
Status: ${c.status}
Petitioner: ${c.parties.petitioner}
Respondent: ${c.parties.respondent}
Documents: ${c.documents} | Hearings: ${c.hearings} | Witnesses: ${c.witnesses} | Charges: ${c.charges}
Custody: ${c.custodyInvolved ? 'Yes' : 'No'} | Fundamental Rights: ${c.fundamentalRights ? 'Yes' : 'No'}
Public Interest: ${c.publicInterest}/5 | Cross-Jurisdiction: ${c.crossJurisdiction ? 'Yes' : 'No'}
Complexity: ${c.complexityScore || 'N/A'}/100 | Urgency: ${c.urgencyIndex || 'N/A'}/100 | Priority: ${c.aiPriority || 'N/A'}

Provide:
## Case Summary
## Legal Complexity Analysis
## Risk Assessment
## Priority Recommendation
## Estimated Timeline
## Key Legal Issues
## Precedent Suggestions
## Recommended Next Steps

Keep concise, focus on Indian legal context.`

  return callGroq([{ role: 'user', content: prompt }])
}

export async function getJudgeRecommendation(c) {
  const judgeList = judges.map(j => `- ${j.name} | ${j.court} | ${j.specialization} | Load: ${j.caseLoad}/${j.maxLoad} | Efficiency: ${j.efficiency}%`).join('\n')
  const prompt = `Recommend the best judge for this case:

Case: ${c.title}
Type: ${c.type}
Court: ${c.court}
Complexity: ${c.complexityScore || 'N/A'}/100

Available Judges:
${judgeList}

Provide:
## Top Recommendation
## Alternative Option
## Selection Criteria
## Considerations

Focus on specialization match and workload balance.`

  return callGroq([{ role: 'user', content: prompt }])
}

export async function compareCases(cases) {
  const desc = cases.map((c, i) => `Case ${i + 1}: ${c.id} — ${c.title}\n  Type: ${c.type} | Complexity: ${c.complexityScore} | Urgency: ${c.urgencyIndex} | Priority: ${c.aiPriority}`).join('\n\n')
  const prompt = `Compare and rank these cases by priority:

${desc}

Provide:
## Priority Order
## Comparative Analysis
## Critical Factors
## Action Items`

  return callGroq([{ role: 'user', content: prompt }])
}

export async function summarizeArguments(c) {
  const prompt = `Summarize the key arguments for petitioner (${c.parties.petitioner}) and respondent (${c.parties.respondent}) in case ${c.id}: ${c.title}. Provide a neutral, 3-bullet summary for each side.`
  return callGroq([{ role: 'user', content: prompt }])
}

export async function askJudgeChatbot(history, cases) {
  const caseContext = cases.map(c => `ID: ${c.id} - ${c.title} (${c.status})`).join('\n')
  
  const messages = [
    {
      role: 'system',
      content: `You are a strict legal assistant chatbot exclusively for the Judge Panel. 
Your ONLY purpose is to answer questions related to the following cases context.
If a user asks anything unrelated to the cases or legal analysis of these cases, you MUST politely refuse and state your limitations.

Available Cases Context:
${caseContext}`
    }
  ]

  // Map history to OpenAI format
  history.forEach(h => {
    messages.push({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.text
    })
  })

  return callGroq(messages)
}
