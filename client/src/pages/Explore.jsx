import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, getProjects } from '../services/api';

const POPULAR_SKILLS = [
    'React', 'Node.js', 'Python', 'JavaScript', 'Machine Learning', 'UI/UX Design',
    'Flutter', 'MongoDB', 'TypeScript', 'Docker',
];

const STAGES = [
    { id: 'all', label: 'All Stages' },
    { id: 'recruiting', label: '👥 Recruiting Collaborators' },
    { id: 'idea', label: '💡 Idea Stage' },
    { id: 'building', label: '🔨 Building MVP' },
    { id: 'launched', label: '🚀 Launched' },
];

const Explore = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'creators'

    // Creators state
    const [users, setUsers] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [activeSkill, setActiveSkill] = useState('');

    // Projects state
    const [projects, setProjects] = useState([]);
    const [searchProject, setSearchProject] = useState('');
    const [activeStage, setActiveStage] = useState('all');
    const [onlyMatches, setOnlyMatches] = useState(false);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'creators') {
            fetchUsers();
        } else {
            fetchProjectsList();
        }
    }, [activeTab, activeSkill, activeStage]);

    const fetchUsers = async (query = '') => {
        setLoading(true);
        try {
            const params = {};
            if (query) params.search = query;
            if (activeSkill) params.skill = activeSkill;
            const res = await getUsers(params);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectsList = async (query = '') => {
        setLoading(true);
        try {
            const params = {};
            if (query) params.search = query;
            if (activeStage && activeStage !== 'all') params.stage = activeStage;
            const res = await getProjects(params);
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (activeTab === 'creators') {
            fetchUsers(searchUser);
        } else {
            fetchProjectsList(searchProject);
        }
    };

    // Calculate match score between user's skills and project needed skills
    const getMatchScore = (project) => {
        if (!user?.skills?.length) return null;
        const projectSkills = new Set();
        project.rolesNeeded?.forEach((r) => r.skills?.forEach((s) => projectSkills.add(s.toLowerCase())));
        project.tags?.forEach((t) => projectSkills.add(t.toLowerCase()));

        if (projectSkills.size === 0) return null;

        const matched = user.skills.filter((s) => projectSkills.has(s.toLowerCase()));
        if (matched.length === 0) return null;

        const percentage = Math.min(98, Math.max(50, Math.round((matched.length / Math.min(projectSkills.size, 3)) * 100)));
        return {
            percentage,
            matchedSkills: matched.slice(0, 2),
        };
    };

    const displayedProjects = onlyMatches
        ? projects
              .map((p) => ({ ...p, match: getMatchScore(p) }))
              .filter((p) => p.match !== null)
              .sort((a, b) => b.match.percentage - a.match.percentage)
        : projects;

    const stageLabels = {
        idea: '💡 Idea',
        recruiting: '👥 Recruiting',
        building: '🔨 Building',
        launched: '🚀 Launched',
    };

    return (
        <div className="page">
            <div className="container">
                <div className="section-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Explore Crea8X</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Find projects seeking your skills, or discover top creators to build your next big vision.
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <button
                        className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        💡 Projects & Collaboration Ideas ({projects.length})
                    </button>
                    <button
                        className={`btn ${activeTab === 'creators' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('creators')}
                    >
                        👥 Creators & Skills ({users.length})
                    </button>
                </div>

                {/* PROJECTS TAB */}
                {activeTab === 'projects' && (
                    <>
                        {/* Search & Match Toggle */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <form onSubmit={handleSearch} className="search-bar" style={{ flex: 1, minWidth: '280px', margin: 0 }}>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search by title, description, or needed skill..."
                                    value={searchProject}
                                    onChange={(e) => setSearchProject(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary">Search</button>
                            </form>

                            {user?.skills?.length > 0 && (
                                <button
                                    type="button"
                                    className={`btn ${onlyMatches ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setOnlyMatches(!onlyMatches)}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    ⭐ Best Matches for My Skills
                                </button>
                            )}
                        </div>

                        {/* Stage Filter */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                            {STAGES.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    className="skill-tag"
                                    style={{
                                        cursor: 'pointer',
                                        background: activeStage === s.id ? 'var(--accent-purple)' : undefined,
                                        color: activeStage === s.id ? 'white' : undefined,
                                    }}
                                    onClick={() => setActiveStage(s.id)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Results */}
                        {loading ? (
                            <div className="spinner"></div>
                        ) : displayedProjects.length === 0 ? (
                            <div className="card empty-state">
                                <h3>No projects match your filter</h3>
                                <p>Try adjusting your search query, stage filter, or toggling off "Best Matches".</p>
                                <Link to="/project/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
                                    + Post a New Idea
                                </Link>
                            </div>
                        ) : (
                            <div className="grid-3">
                                {displayedProjects.map((p) => {
                                    const match = getMatchScore(p);
                                    return (
                                        <Link to={`/project/${p._id}`} key={p._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className="card project-card">
                                                <div
                                                    className="project-card-thumb"
                                                    style={p.thumbnail ? { backgroundImage: `url(${p.thumbnail})` } : {}}
                                                >
                                                    {!p.thumbnail && (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2rem', opacity: 0.3 }}>💡</div>
                                                    )}
                                                </div>
                                                <div className="project-card-body">
                                                    {/* Badges: Stage & Match Score */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                                        <span className={`stage-badge ${p.stage || 'recruiting'}`} style={{ fontSize: '0.7rem' }}>
                                                            {stageLabels[p.stage] || 'Recruiting'}
                                                        </span>
                                                        {match && (
                                                            <span
                                                                style={{
                                                                    fontSize: '0.72rem',
                                                                    background: 'rgba(16, 185, 129, 0.15)',
                                                                    color: '#34d399',
                                                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '9999px',
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                ⭐ {match.percentage}% Match
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="project-card-title">{p.title}</div>
                                                    <div className="project-card-desc">{p.description}</div>

                                                    {/* Open Roles Preview */}
                                                    {p.rolesNeeded?.length > 0 && (
                                                        <div style={{ marginTop: '10px' }}>
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Seeking:</div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                {p.rolesNeeded.slice(0, 2).map((r, i) => (
                                                                    <span key={i} className="skill-tag green" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                                                                        {r.title}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="skills-container" style={{ marginTop: '12px' }}>
                                                        {p.tags?.slice(0, 3).map((tag) => (
                                                            <span key={tag} className="skill-tag">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* CREATORS TAB */}
                {activeTab === 'creators' && (
                    <>
                        <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search creators by name, handle, or skill..."
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary">Search</button>
                        </form>

                        <div className="skills-container" style={{ marginBottom: '32px' }}>
                            <button
                                className="skill-tag"
                                style={{
                                    cursor: 'pointer',
                                    background: !activeSkill ? 'var(--accent-purple)' : undefined,
                                    color: !activeSkill ? 'white' : undefined,
                                }}
                                onClick={() => setActiveSkill('')}
                            >
                                All Skills
                            </button>
                            {POPULAR_SKILLS.map((skill) => (
                                <button
                                    key={skill}
                                    className="skill-tag"
                                    style={{
                                        cursor: 'pointer',
                                        background: activeSkill === skill ? 'var(--accent-purple)' : undefined,
                                        color: activeSkill === skill ? 'white' : undefined,
                                    }}
                                    onClick={() => setActiveSkill(activeSkill === skill ? '' : skill)}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="spinner"></div>
                        ) : users.length === 0 ? (
                            <div className="card empty-state">
                                <h3>No creators found</h3>
                                <p>Try adjusting your search or skill filters.</p>
                            </div>
                        ) : (
                            <div className="grid-3">
                                {users.map((u) => (
                                    <Link to={`/profile/${u._id}`} key={u._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="card user-card">
                                            <div className="user-avatar">
                                                {(u.fullName || u.username).charAt(0).toUpperCase()}
                                            </div>
                                            <h3>{u.fullName || u.username}</h3>
                                            <div className="user-handle">@{u.username}</div>
                                            {u.bio && (
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {u.bio}
                                                </p>
                                            )}
                                            <div className="skills-container" style={{ justifyContent: 'center' }}>
                                                {u.skills?.slice(0, 5).map((s, i) => (
                                                    <span key={s} className={`skill-tag ${['', 'cyan', 'pink', 'green'][i % 4]}`}>{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Explore;
