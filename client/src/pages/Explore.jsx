import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'creators'

    // Creators state
    const [users, setUsers] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const [activeSkill, setActiveSkill] = useState('');

    // Projects state
    const [projects, setProjects] = useState([]);
    const [searchProject, setSearchProject] = useState('');
    const [activeStage, setActiveStage] = useState('recruiting');

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
                        Find projects looking for your skills, or discover talented creators to join your vision.
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
                        {/* Search */}
                        <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search projects by title, description, or needed skill..."
                                value={searchProject}
                                onChange={(e) => setSearchProject(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary">Search</button>
                        </form>

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
                        ) : projects.length === 0 ? (
                            <div className="card empty-state">
                                <h3>No projects found</h3>
                                <p>Try adjusting your search query or stage filter.</p>
                                <Link to="/project/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
                                    + Post the First Idea
                                </Link>
                            </div>
                        ) : (
                            <div className="grid-3">
                                {projects.map((p) => (
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
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span className={`stage-badge ${p.stage || 'recruiting'}`} style={{ fontSize: '0.7rem' }}>
                                                        {stageLabels[p.stage] || 'Recruiting'}
                                                    </span>
                                                    {p.rolesNeeded?.length > 0 && (
                                                        <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                                                            {p.rolesNeeded.length} open {p.rolesNeeded.length === 1 ? 'role' : 'roles'}
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
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* CREATORS TAB */}
                {activeTab === 'creators' && (
                    <>
                        {/* Search */}
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

                        {/* Skill Filter */}
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

                        {/* Results */}
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
