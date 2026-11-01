import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../services/api';

const POPULAR_SKILLS = [
    'React', 'Node.js', 'Python', 'JavaScript', 'Machine Learning', 'UI/UX Design',
    'Flutter', 'MongoDB', 'TypeScript', 'Docker',
];

const Explore = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [activeSkill, setActiveSkill] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [activeSkill]);

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

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    return (
        <div className="page">
            <div className="container">
                <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
                    <h2>Explore Creators</h2>
                    <p>Discover talented creators filtered by skills and expertise.</p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="search-bar">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name or username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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
                        All
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
                        <p>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid-3">
                        {users.map((u) => (
                            <Link to={`/profile/${u._id}`} key={u._id}>
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
            </div>
        </div>
    );
};

export default Explore;
