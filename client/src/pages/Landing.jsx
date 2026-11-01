import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user } = useAuth();

    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">💡 Where Ideas Find Their People</div>
                        <h1>
                            Ideas Meet Skills.<br />
                            <span>People Build Together.</span>
                        </h1>
                        <p>
                            Have a vision for a project but lack the team or technical expertise? Or have skills and want to build something meaningful?
                            <strong> Crea<span className="logo-infinity">∞</span>X</strong> bridges the gap between visionaries and skilled builders.
                        </p>
                        <div className="hero-actions">
                            {user ? (
                                <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">Join Crea8X Free →</Link>
                                    <Link to="/explore" className="btn btn-secondary btn-lg">Explore Ideas & Creators</Link>
                                </>
                            )}
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <h3>100%</h3>
                                <p>Collaborative</p>
                            </div>
                            <div className="hero-stat">
                                <h3>AI</h3>
                                <p>Architected</p>
                            </div>
                            <div className="hero-stat">
                                <h3>∞</h3>
                                <p>Possibilities</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>How Crea<span className="logo-infinity">∞</span>X Works</h2>
                        <p>From an initial raw concept to a fully launched MVP team in four simple steps.</p>
                    </div>

                    <div className="grid-2">
                        <div className="card step-card">
                            <div style={{ fontSize: '2.4rem', background: 'rgba(139, 92, 246, 0.15)', padding: '16px', borderRadius: '16px', lineHeight: 1, flexShrink: 0 }}>
                                💡
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>1. Share Your Idea</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                                    Post a brief description of what you want to build. Use our built-in <strong>Gemini AI Architect</strong> to automatically scope open roles, required tech stacks, and MVP milestones.
                                </p>
                            </div>
                        </div>

                        <div className="card step-card">
                            <div style={{ fontSize: '2.4rem', background: 'rgba(6, 182, 212, 0.15)', padding: '16px', borderRadius: '16px', lineHeight: 1, flexShrink: 0 }}>
                                🎯
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>2. Discover Relevant Skills</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                                    Our matching engine analyzes required skills and surfaces registered creators with matching expertise. Creators see live <strong>% Skill Match Badges</strong> on projects seeking their talents.
                                </p>
                            </div>
                        </div>

                        <div className="card step-card">
                            <div style={{ fontSize: '2.4rem', background: 'rgba(236, 72, 153, 0.15)', padding: '16px', borderRadius: '16px', lineHeight: 1, flexShrink: 0 }}>
                                🤝
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>3. Get Connected</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                                    Interested creators apply to join open positions with a short pitch. Project creators review applicants and approve teammates with a single click, sending instant notifications.
                                </p>
                            </div>
                        </div>

                        <div className="card step-card">
                            <div style={{ fontSize: '2.4rem', background: 'rgba(16, 185, 129, 0.15)', padding: '16px', borderRadius: '16px', lineHeight: 1, flexShrink: 0 }}>
                                🚀
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>4. Collaborate & Build</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                                    Unlock private Discord/Slack team channels, track milestone checklists together, and earn verified <strong>"Shipped on Crea8x"</strong> portfolio badges on your profiles.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Engineered For Builders</h2>
                        <p>Everything you need to turn raw concepts into real-world software.</p>
                    </div>
                    <div className="grid-3">
                        <div className="card feature-card">
                            <div className="feature-icon">🤖</div>
                            <h3>AI Idea-to-Team Architect</h3>
                            <p>One-click Gemini AI converts plain-English ideas into complete startup specs with open roles, tech stacks, and milestones.</p>
                        </div>
                        <div className="card feature-card">
                            <div className="feature-icon">⭐</div>
                            <h3>Personalized Match Scores</h3>
                            <p>Instantly spot projects seeking your exact skills with real-time percentage match indicators.</p>
                        </div>
                        <div className="card feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3>Private Team Workspaces</h3>
                            <p>Handoff channels (Discord, Slack, Meet) remain locked until an applicant is accepted onto the team.</p>
                        </div>
                        <div className="card feature-card">
                            <div className="feature-icon">📋</div>
                            <h3>Collaborative Milestones</h3>
                            <p>Interactive shared checklists keep your project aligned from early wireframes to production launch.</p>
                        </div>
                        <div className="card feature-card">
                            <div className="feature-icon">💬</div>
                            <h3>Community Q&A</h3>
                            <p>Public discussion threads allow interested builders to ask questions and clarify vision before joining.</p>
                        </div>
                        <div className="card feature-card">
                            <div className="feature-icon">🏆</div>
                            <h3>Verified Contributor Credits</h3>
                            <p>Build an undeniable portfolio. Shipped projects are permanently credited to all contributing team members.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <div className="card-glass cta-card">
                        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '16px' }}>
                            The missing piece isn't another resource.<br />It's the right people.
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.05rem', lineHeight: 1.7 }}>
                            Join Crea8x today to share your idea or find an ambitious team to build with.
                        </p>
                        {!user ? (
                            <Link to="/register" className="btn btn-primary btn-lg">Start Building Free →</Link>
                        ) : (
                            <Link to="/project/new" className="btn btn-primary btn-lg">+ Share an Idea Now →</Link>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Landing;
