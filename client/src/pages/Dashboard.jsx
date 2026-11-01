import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjects, getRecommendations, aiSkillInsights, getMyApplications } from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [insights, setInsights] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projRes, recRes, appRes] = await Promise.all([
                    getProjects(),
                    getRecommendations(user._id),
                    getMyApplications(),
                ]);
                // Filter to only current user's projects
                const myProjects = projRes.data.filter(
                    (p) => (p.author?._id || p.author) === user._id
                );
                setProjects(myProjects);
                setRecommended(recRes.data);
                setMyApplications(appRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user._id]);

    const handleGetInsights = async () => {
        if (!user.skills?.length) return;
        setLoadingInsights(true);
        try {
            const res = await aiSkillInsights({ skills: user.skills });
            setInsights(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingInsights(false);
        }
    };

    if (loading) return <div className="page"><div className="spinner"></div></div>;

    const stageLabels = {
        idea: '💡 Idea',
        recruiting: '👥 Recruiting',
        building: '🔨 Building',
        launched: '🚀 Launched',
    };

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <h1>
                        Welcome back,{' '}
                        <span style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {user.fullName || user.username}
                        </span>{' '}
                        👋
                    </h1>
                    <p>Here's an overview of your creative collaborations and project journey.</p>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    <div className="card stat-card">
                        <div className="stat-value">{projects.length}</div>
                        <div className="stat-label">Your Projects</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{myApplications.length}</div>
                        <div className="stat-label">Applications Sent</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{user.skills?.length || 0}</div>
                        <div className="stat-label">Skills</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{recommended.length}</div>
                        <div className="stat-label">Matched Creators</div>
                    </div>
                </div>

                {/* My Applications (Collaboration Tracking) */}
                {myApplications.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>
                            🤝 Your Collaboration Applications ({myApplications.length})
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                            {myApplications.map((app) => (
                                <div key={app._id} className="card" style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <Link
                                            to={`/project/${app.project?._id}`}
                                            style={{ fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', color: 'inherit' }}
                                        >
                                            {app.project?.title || 'Untitled Project'}
                                        </Link>
                                        <span className={`app-status ${app.status}`}>{app.status}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                        Role applied for: <strong style={{ color: 'var(--accent-purple)' }}>{app.role}</strong>
                                    </div>
                                    {app.project?.author && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Creator: {app.project.author.fullName || app.project.author.username}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills & AI Insights */}
                {user.skills?.length > 0 && (
                    <div className="card" style={{ marginBottom: '40px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Skills Profile</h3>
                            <button className="btn btn-ai btn-sm" onClick={handleGetInsights} disabled={loadingInsights}>
                                {loadingInsights ? '✨ Analyzing...' : '✨ AI Skill Insights'}
                            </button>
                        </div>
                        <div className="skills-container">
                            {user.skills.map((skill, i) => (
                                <span key={skill} className={`skill-tag ${['', 'cyan', 'pink', 'green'][i % 4]}`}>{skill}</span>
                            ))}
                        </div>

                        {insights && (
                            <div className="card-glass" style={{ marginTop: '20px', padding: '20px', borderRadius: '12px' }}>
                                <h4 style={{ marginBottom: '12px', color: 'var(--accent-pink)' }}>🤖 AI Skill Insights</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>{insights.reasoning}</p>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Suggested Complementary Skills:</span>
                                    <div className="skills-container" style={{ marginTop: '8px' }}>
                                        {insights.suggestedSkills?.map((s) => (
                                            <span key={s} className="skill-tag green">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                                    🔥 In Demand: {insights.trendingCombination}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Your Projects */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Your Projects & Ideas</h2>
                        <Link to="/project/new" className="btn btn-primary btn-sm">+ Share New Idea</Link>
                    </div>
                    {projects.length === 0 ? (
                        <div className="card empty-state">
                            <h3>No projects yet</h3>
                            <p>Share your vision and start recruiting skilled collaborators to build it!</p>
                            <Link to="/project/new" className="btn btn-primary" style={{ marginTop: '16px' }}>Share Idea</Link>
                        </div>
                    ) : (
                        <div className="grid-3">
                            {projects.map((project) => (
                                <Link to={`/project/${project._id}`} key={project._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="card project-card">
                                        <div
                                            className="project-card-thumb"
                                            style={project.thumbnail ? { backgroundImage: `url(${project.thumbnail})` } : {}}
                                        >
                                            {!project.thumbnail && (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2rem', opacity: 0.3 }}>💡</div>
                                            )}
                                        </div>
                                        <div className="project-card-body">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span className={`stage-badge ${project.stage || 'recruiting'}`} style={{ fontSize: '0.7rem' }}>
                                                    {stageLabels[project.stage] || 'Recruiting'}
                                                </span>
                                                {project.rolesNeeded?.length > 0 && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                                                        {project.rolesNeeded.length} open {project.rolesNeeded.length === 1 ? 'role' : 'roles'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="project-card-title">{project.title}</div>
                                            <div className="project-card-desc">{project.description}</div>
                                            <div className="skills-container" style={{ marginTop: '12px' }}>
                                                {project.tags?.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="skill-tag">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recommended Collaborators */}
                {recommended.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>🎯 Recommended Collaborators For You</h2>
                        <div className="grid-3">
                            {recommended.map((rec) => (
                                <Link to={`/profile/${rec._id}`} key={rec._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="card user-card">
                                        <div className="user-avatar">
                                            {(rec.fullName || rec.username).charAt(0).toUpperCase()}
                                        </div>
                                        <h3>{rec.fullName || rec.username}</h3>
                                        <div className="user-handle">@{rec.username}</div>
                                        <div className="skills-container" style={{ justifyContent: 'center' }}>
                                            {rec.skills?.slice(0, 4).map((s, i) => (
                                                <span key={s} className={`skill-tag ${['', 'cyan', 'pink', 'green'][i % 4]}`}>{s}</span>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                                            {rec.matchingSkills} skill{rec.matchingSkills > 1 ? 's' : ''} in common
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
