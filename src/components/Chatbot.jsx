import { useState, useRef, useEffect } from 'react'
import { askJudgeChatbot } from '../services/gemini'

export default function Chatbot({ cases }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'model', text: 'Hello, Judge. I am here to assist you with inquiries regarding the ongoing cases. What would you like to know?' }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || isLoading) return
    const userMsg = input
    setInput('')
    const newHistory = [...messages, { role: 'user', text: userMsg }]
    setMessages(newHistory)
    setIsLoading(true)

    try {
      const response = await askJudgeChatbot(newHistory, cases)
      setMessages([...newHistory, { role: 'model', text: response }])
    } catch (err) {
      setMessages([...newHistory, { role: 'model', text: 'Error: ' + err.message }])
    }
    setIsLoading(false)
  }

  if (!isOpen) {
    return (
      <button 
        className="btn btn-primary" 
        style={{ position: 'fixed', bottom: 32, right: 32, borderRadius: '50%', width: 64, height: 64, boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)', zIndex: 1000 }}
        onClick={() => setIsOpen(true)}
      >
        <i className="fas fa-comment-dots" style={{ fontSize: 24, margin: 0 }} />
      </button>
    )
  }

  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, width: 380, height: 500, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 10 }}><i className="fas fa-robot" style={{ color: 'var(--primary)' }}></i> AI Case Assistant</h3>
        <button className="btn btn-outline btn-sm" style={{ padding: '6px 10px', minWidth: 0 }} onClick={() => setIsOpen(false)}><i className="fas fa-times" style={{ margin: 0 }} /></button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: m.role === 'user' ? 'linear-gradient(135deg, var(--primary), #ea580c)' : 'rgba(255,255,255,0.05)', color: m.role === 'user' ? '#fff' : 'var(--text)', padding: '12px 16px', borderRadius: 16, borderBottomRightRadius: m.role === 'user' ? 4 : 16, borderBottomLeftRadius: m.role === 'model' ? 4 : 16, fontSize: '0.9rem', lineHeight: 1.5, border: m.role === 'model' ? '1px solid var(--border)' : 'none' }}>
            {m.text}
          </div>
        ))}
        {isLoading && <div style={{ alignSelf: 'flex-start', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, borderBottomLeftRadius: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
          <div className="dot-typing" style={{ width: 6, height: 6, background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1s infinite alternate' }} />
          <div className="dot-typing" style={{ width: 6, height: 6, background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1s infinite alternate 0.2s' }} />
          <div className="dot-typing" style={{ width: 6, height: 6, background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1s infinite alternate 0.4s' }} />
        </div>}
        <div ref={endRef} />
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, background: 'rgba(0,0,0,0.2)' }}>
        <input 
          className="form-input" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask a question..." 
          style={{ padding: '10px 16px', borderRadius: 20 }}
          disabled={isLoading}
        />
        <button className="btn btn-primary" style={{ borderRadius: '50%', width: 42, height: 42, padding: 0, minWidth: 42 }} onClick={send} disabled={isLoading}>
          <i className="fas fa-paper-plane" style={{ margin: 0, fontSize: '0.9rem' }} />
        </button>
      </div>
    </div>
  )
}
