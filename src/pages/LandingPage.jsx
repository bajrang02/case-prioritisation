import './LandingPage.css'

export default function LandingPage({ onGoToLogin }) {
  return (
    <div className="landing-page">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon"><i className="fas fa-gavel"></i></div>
          <span>JurisFlow</span>
        </div>
        <button className="btn btn-outline glow-btn-sm" onClick={onGoToLogin}>Sign In</button>
      </nav>

      <main className="landing-main">
        <div className="hero-section">
          <div className="hero-badge">🚀 Next-Gen Legal Intelligence</div>
          <h1 className="hero-title">Eliminate Backlog.<br/>Accelerate <span className="text-gradient">Justice.</span></h1>
          <p className="hero-subtitle">
            JurisFlow is an AI-native legal case management framework designed to automatically score priority, analyze risks, and route cases efficiently to the right judges.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary glow-btn" onClick={onGoToLogin}>
              Launch Platform <i className="fas fa-arrow-right"></i>
            </button>
            <a href="#features" className="btn btn-outline secondary-btn">
              Explore Features
            </a>
          </div>
        </div>

        <div id="features" className="features-section">
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-robot"></i></div>
            <h3>AI Prioritization</h3>
            <p>Automatically score cases on complexity and urgency using our proprietary AI models to ensure critical cases are heard first.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-magic"></i></div>
            <h3>Intelligent Analysis</h3>
            <p>Extract arguments, precedents, and generate comprehensive legal summaries instantly, saving hundreds of hours of manual review.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-users-cog"></i></div>
            <h3>Role-Based Insights</h3>
            <p>Tailored workflows for Judges, Lawyers, and Clerks ensuring strict data privacy, seamless filing, and efficient access controls.</p>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>© 2026 JurisFlow. Empowering the Hackathon Builders.</p>
      </footer>
    </div>
  )
}
