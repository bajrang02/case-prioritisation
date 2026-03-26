import { useState } from 'react'
import './LandingPage.css'

export default function LandingPage({ onGoToLogin }) {
  const [expanded, setExpanded] = useState(null)

  const capabilities = [
    {
      id: 'prioritization',
      icon: 'fa-brain',
      shortName: 'Prioritize',
      title: 'Intelligent Prioritization',
      desc: 'Automatically scores cases based on urgency, complexity, and public interest to optimize court schedules.',
      detail: 'Our AI engine analyzes 50+ parameters including statutory deadlines, fundamental rights, and custody status to generate a real-time priority score for every case.'
    },
    {
      id: 'analysis',
      icon: 'fa-file-alt',
      shortName: 'Analyze',
      title: 'Explainable AI Analysis',
      desc: "Understand the 'Why' behind every priority score with transparent, data-driven reasoning and tooltips.",
      detail: 'Moving beyond "black box" AI, we specify exactly which factors contributed to a case score, citing specific statutory provisions and case characteristics.'
    },
    {
      id: 'verification',
      icon: 'fa-shield-alt',
      shortName: 'Verify',
      title: 'Secure Verification',
      desc: 'Advanced identity verification for Lawyers and Judges ensures a trusted legal ecosystem.',
      detail: 'Multi-factor authentication paired with Bar Council and Judicial ID verification ensures that only authorized officers of the court can access sensitive case data.'
    },
    {
      id: 'insights',
      icon: 'fa-chart-line',
      shortName: 'Insights',
      title: 'Performance Insight',
      desc: 'Visualize courtroom efficiency metrics and identify bottlenecks in the judicial pipeline.',
      detail: 'Real-time analytics help chief justices and administrators allocate resources effectively and measure the impact of AI-assisted throughput.'
    }
  ]

  const scrollToCapabilities = () => {
    const el = document.getElementById('capabilities')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon"><i className="fas fa-gavel" /></div>
          <span>JurisFlow</span>
        </div>
        <div className="nav-actions">
          <button className="btn btn-outline glow-btn-sm" onClick={onGoToLogin}>Sign In</button>
        </div>
      </header>

      <main className="landing-content">
        <section className="hero-section">
          <div className="hero-overlay" />
          <div className="hero-container">
            <span className="hero-tag">Next-Gen Judicial Intelligence</span>
            <h1 className="hero-title">Transforming Justice with <span className="highlight">Precision AI</span></h1>
            <p className="hero-desc">
              JurisFlow streamlines case management, prioritizes critical litigation, and empowers 
              legal professionals with explainable artificial intelligence.
            </p>
            <div className="hero-btns">
              <button className="btn btn-primary hero-btn-main" onClick={onGoToLogin}>
                Enter Courtroom <i className="fas fa-chevron-right" />
              </button>
              <button className="btn btn-outline hero-btn-sub" onClick={scrollToCapabilities}>
                Explore Features
              </button>
            </div>
          </div>
          <div className="scroll-hint" onClick={scrollToCapabilities} style={{cursor: 'pointer'}}>
            <span>SCROLL TO EXPLORE</span>
            <i className="fas fa-chevron-down" />
          </div>
        </section>

        <section id="capabilities" className="capabilities-section">
          <h2 className="section-title">Core Capabilities</h2>
          <p className="section-subtitle">Cutting-edge tools for the modern judiciary</p>
          
          <div className="capabilities-grid">
            {capabilities.map(cap => (
              <div 
                key={cap.id} 
                className={`capability-card ${expanded === cap.id ? 'active' : 'icon-only'}`}
                onClick={() => setExpanded(expanded === cap.id ? null : cap.id)}
              >
                <div className="cap-body">
                  <div className="cap-icon-box">
                    <i className={`fas ${cap.icon}`} />
                  </div>
                  {!expanded && <div className="cap-short-name">{cap.shortName}</div>}
                </div>
                
                <div className={`cap-content ${expanded === cap.id ? 'active' : ''}`}>
                  <h3 className="cap-title">{cap.title}</h3>
                  <p className="cap-desc">{cap.desc}</p>
                  <div className={`cap-detail-box ${expanded === cap.id ? 'show' : ''}`}>
                    <p className="cap-detail">{cap.detail}</p>
                  </div>
                </div>

                {expanded === cap.id && (
                  <div className="cap-toggle">
                    <i className="fas fa-times" />
                  </div>
                )}
                
                {!expanded && <div className="cap-hint">Click icon to expand</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-card">
            <div className="cta-content">
              <h3>Ready to revolutionize your courtroom?</h3>
              <p>Join hundreds of legal professionals using JurisFlow to enhance judicial efficiency.</p>
              <button className="btn btn-primary cta-btn" onClick={onGoToLogin}>Get Started Now <i className="fas fa-arrow-right" /></button>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-icon"><i className="fas fa-gavel" /></div>
            <span>JurisFlow</span>
          </div>
          <div className="footer-links">
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 JurisFlow Judicial Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
