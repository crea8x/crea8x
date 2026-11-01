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
                        <div className="hero-badge">✨ AI-Powered Creative Platform</div>
                        <h1>
                            Where Creators<br />
                            <span>Build Together</span>
                        </h1>
                        <p>
                            Showcase your projects, discover talented creators, and let AI supercharge
                            your workflow. Crea<span className="logo-infinity">∞</span>X is the next-gen platform for builders who dare to create.
                        </p>
                        <div className="hero-actions">
                            {user ? (
                                <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">Start Creating →</Link>
                                    <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
                                </>
                            )}
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <h3>∞</h3>
                                <p>Possibilities</p>
                            </div>
                            <div className="hero-stat">
                                <h3>AI</h3>
                                <p>Powered</p>
                            </div>
                            <div className="hero-stat">
                                <h3>24/7</h3>
                                <p>Collaboration</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Why Crea<span className="logo-infinity">∞</span>X?</h2>
                        <p>Everything you need to showcase your work, connect with creators, and grow your skills.</p>
                    </div>
                    <div className="grid-3">
                        <div className="card feature-card">
                            <div className="feature-icon">🚀</div>
                            <h3>Project Showcase</h3>
                            <p>Build a stunning portfolio of your projects with live demos, source code links, and rich descriptions.</p>
                        </div>
                        <div className="card feature-card">
                            <div className="feature-icon">🤖</div>
                            <h3>AI-Powered Tools</h3>
                            <p>Generate project descriptions, bios, and get smart tag suggestions powered by Google Gemini AI.</p>
                        </div>
                        <div className="card feature-card">
                            <div className="feature-icon">🔍</div>
                            <h3>Smart Discovery</h3>
                            <p>Find creators with matching skills, get personalized project recommendations, and explore trending tech.</p>
                        </div>
                        <div className="card feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Skill Matching</h3>
                            <p>Our AI analyzes your skills and recommends collaborators with complementary expertise.</p>
                        </div>
                        <div className="card feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Skill Insights</h3>
                            <p>Get AI-driven analysis of your skill gaps and personalized learning recommendations.</p>
                        </div>
                        <div className="card feature-card">
                            <div className="feature-icon">💜</div>
                            <h3>Community</h3>
                            <p>Like projects, follow creators, and be part of a vibrant community of builders and innovators.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <div className="card-glass" style={{ padding: '60px 40px', maxWidth: '700px', margin: '0 auto', borderRadius: '24px' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>Ready to Create?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.05rem' }}>
                            Join the next generation of creators and start building your portfolio today.
                        </p>
                        {!user && (
                            <Link to="/register" className="btn btn-primary btn-lg">Get Started — It's Free →</Link>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Landing;
