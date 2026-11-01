import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getAdminStats,
    getAdminUsers,
    updateAdminUserRole,
    toggleAdminUserStatus,
    deleteAdminUser,
    getAdminProjects,
    toggleAdminProjectFeatured,
    updateAdminProjectStage,
    deleteAdminProject,
    broadcastAdminAnnouncement,
    getAdminComments,
    deleteAdminComment,
} from '../services/api';

const Admin = () => {
    const { user: currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'projects' | 'broadcast' | 'comments'
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Users Tab State
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Projects Tab State
    const [projects, setProjects] = useState([]);
    const [projectSearch, setProjectSearch] = useState('');
    const [projectStageFilter, setProjectStageFilter] = useState('all');
    const [projectFeaturedFilter, setProjectFeaturedFilter] = useState('all');
    const [loadingProjects, setLoadingProjects] = useState(false);

    // Comments Tab State
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Broadcast Form State
    const [broadcastForm, setBroadcastForm] = useState({
        title: '',
        message: '',
        urgency: 'info', // 'info' | 'alert' | 'celebration'
    });
    const [broadcastLoading, setBroadcastLoading] = useState(false);

    // Feedback
    const [feedback, setFeedback] = useState({ type: '', text: '' });
    const [actionLoading, setActionLoading] = useState({});

    const showFeedback = (type, text) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'projects') fetchProjects();
        if (activeTab === 'comments') fetchComments();
    }, [activeTab]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await getAdminStats();
            setStats(res.data);
        } catch (err) {
            console.error(err);
            showFeedback('error', 'Failed to fetch platform metrics.');
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const params = {};
            if (userSearch) params.search = userSearch;
            if (userRoleFilter !== 'all') params.role = userRoleFilter;
            if (userStatusFilter !== 'all') params.status = userStatusFilter;
            const res = await getAdminUsers(params);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            showFeedback('error', 'Failed to load creators list.');
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchProjects = async () => {
        setLoadingProjects(true);
        try {
            const params = {};
            if (projectSearch) params.search = projectSearch;
            if (projectStageFilter !== 'all') params.stage = projectStageFilter;
            if (projectFeaturedFilter !== 'all') params.featured = projectFeaturedFilter;
            const res = await getAdminProjects(params);
            setProjects(res.data);
        } catch (err) {
            console.error(err);
            showFeedback('error', 'Failed to load projects list.');
        } finally {
            setLoadingProjects(false);
        }
    };

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const res = await getAdminComments();
            setComments(res.data);
        } catch (err) {
            console.error(err);
            showFeedback('error', 'Failed to load community discussions.');
        } finally {
            setLoadingComments(false);
        }
    };

    // User Operations
    const handleToggleRole = async (u) => {
        const newRole = u.role === 'admin' ? 'member' : 'admin';
        if (u._id === currentUser._id) {
            alert('You cannot change your own role.');
            return;
        }
        setActionLoading((prev) => ({ ...prev, [u._id]: true }));
        try {
            const res = await updateAdminUserRole(u._id, newRole);
            setUsers((prev) => prev.map((item) => (item._id === u._id ? { ...item, role: res.data.role } : item)));
            showFeedback('success', `Updated @${u.username}'s role to ${newRole.toUpperCase()}.`);
            fetchStats();
        } catch (err) {
            showFeedback('error', err.response?.data?.message || 'Failed to update role.');
        } finally {
            setActionLoading((prev) => ({ ...prev, [u._id]: false }));
        }
    };

    const handleToggleStatus = async (u) => {
        if (u._id === currentUser._id) {
            alert('You cannot suspend your own account.');
            return;
        }
        const actionName = u.status === 'suspended' ? 'reactivate' : 'suspend';
        if (!window.confirm(`Are you sure you want to ${actionName} @${u.username}?`)) return;

        setActionLoading((prev) => ({ ...prev, [u._id]: true }));
        try {
            const res = await toggleAdminUserStatus(u._id);
            setUsers((prev) => prev.map((item) => (item._id === u._id ? { ...item, status: res.data.status } : item)));
            showFeedback('success', res.data.message);
            fetchStats();
        } catch (err) {
            showFeedback('error', err.response?.data?.message || 'Failed to update status.');
        } finally {
            setActionLoading((prev) => ({ ...prev, [u._id]: false }));
        }
    };

    const handleDeleteUser = async (u) => {
        if (u._id === currentUser._id) {
            alert('You cannot delete your own account.');
            return;
        }
        if (!window.confirm(`⚠️ DANGER: Permanently delete creator @${u.username} and all their projects, applications, and comments?`)) {
            return;
        }
        setActionLoading((prev) => ({ ...prev, [u._id]: true }));
        try {
            const res = await deleteAdminUser(u._id);
            setUsers((prev) => prev.filter((item) => item._id !== u._id));
            showFeedback('success', res.data.message);
            fetchStats();
        } catch (err) {
            showFeedback('error', err.response?.data?.message || 'Failed to delete user.');
        } finally {
            setActionLoading((prev) => ({ ...prev, [u._id]: false }));
        }
    };

    // Project Operations
    const handleToggleFeatured = async (p) => {
        setActionLoading((prev) => ({ ...prev, [p._id]: true }));
        try {
            const res = await toggleAdminProjectFeatured(p._id);
            setProjects((prev) => prev.map((item) => (item._id === p._id ? { ...item, featured: res.data.featured } : item)));
            showFeedback('success', res.data.message);
            fetchStats();
        } catch (err) {
            showFeedback('error', err.response?.data?.message || 'Failed to toggle featured.');
        } finally {
            setActionLoading((prev) => ({ ...prev, [p._id]: false }));
        }
    };

    const handleUpdateStage = async (p, newStage) => {
        setActionLoading((prev) => ({ ...prev, [p._id]: true }));
        try {
            const res = await updateAdminProjectStage(p._id, newStage);
            setProjects((prev) => prev.map((item) => (item._id === p._id ? { ...item, stage: res.data.stage } : item)));
            showFeedback('success', `Updated stage to "${newStage.toUpperCase()}".`);
            fetchStats();
        } catch (err) {
            showFeedback('error', err.response?.data?.message || 'Failed to update stage.');
        } finally {
            setActionLoading((prev) => ({ ...prev, [p._id]: false }));
        }
    };

    const handleDeleteProject = async (p) => {
        if (!window.confirm(`⚠️ Delete project "${p.title}" permanently? This removes all associated team applications and Q&A.`)) {
            return;
        }
        setActionLoading((prev) => ({ ...prev, [p._id]: true }));
        try {
            const res = await deleteAdminProject(p._id);
            setProjects((prev) => prev.filter((item) => item._id !== p._id));
            showFeedback('success', res.data.message);
            fetchStats();
        } catch (err) {
            showFeedback('error', err.response?.data?.message || 'Failed to delete project.');
        } finally {
            setActionLoading((prev) => ({ ...prev, [p._id]: false }));
        }
    };

    // Broadcast Operations
    const handleBroadcastSubmit = async (e) => {
        e.preventDefault();
        if (!broadcastForm.message.trim()) return;
        setBroadcastLoading(true);
        try {
            const res = await broadcastAdminAnnouncement(broadcastForm);
            showFeedback('success', res.data.message);
            setBroadcastForm({ title: '', message: '', urgency: 'info' });
        } catch (err) {
            showFeedback('error', err.response?.data?.message || 'Broadcast failed.');
        } finally {
            setBroadcastLoading(false);
        }
    };

    // Comment Operations
    const handleDeleteComment = async (c) => {
        if (!window.confirm('Delete this public comment?')) return;
        try {
            await deleteAdminComment(c._id);
            setComments((prev) => prev.filter((item) => item._id !== c._id));
            showFeedback('success', 'Comment removed.');
            fetchStats();
        } catch (err) {
            showFeedback('error', 'Failed to delete comment.');
        }
    };

    return (
        <div className="page">
            <div className="container">
                {/* Header Banner */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
                            🛡️ Platform Operations Center
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 800, margin: 0 }}>
                            Crea<span className="logo-infinity">∞</span>X Administration
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
                            Manage creators, moderate startup projects, dispatch platform announcements, and oversee collaboration metrics.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 12px', borderRadius: '9999px', fontWeight: 600 }}>
                            ● API Online
                        </span>
                        <button className="btn btn-secondary btn-sm" onClick={fetchStats} title="Refresh data">
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Feedback Toast Banner */}
                {feedback.text && (
                    <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '20px' }}>
                        {feedback.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview & Health
                    </button>
                    <button
                        className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Creators ({stats?.users?.total || 0})
                    </button>
                    <button
                        className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        💡 Projects ({stats?.projects?.total || 0})
                    </button>
                    <button
                        className={`btn ${activeTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('broadcast')}
                    >
                        📢 Broadcast Push
                    </button>
                    <button
                        className={`btn ${activeTab === 'comments' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('comments')}
                    >
                        💬 Discussions ({stats?.discussions?.totalComments || 0})
                    </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <>
                        {loadingStats || !stats ? (
                            <div className="spinner"></div>
                        ) : (
                            <div>
                                {/* Primary Metrics Grid */}
                                <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
                                    <div className="card stat-card">
                                        <div className="stat-value">{stats.users.total}</div>
                                        <div className="stat-label">Total Creators</div>
                                        <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '4px' }}>
                                            {stats.users.active} Active · {stats.users.admins} Admins
                                        </div>
                                    </div>

                                    <div className="card stat-card">
                                        <div className="stat-value">{stats.projects.total}</div>
                                        <div className="stat-label">Ideas & Projects</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', marginTop: '4px' }}>
                                            {stats.projects.featured} Featured Picks ⭐
                                        </div>
                                    </div>

                                    <div className="card stat-card">
                                        <div className="stat-value">{stats.collaborations.totalApplications}</div>
                                        <div className="stat-label">Applications Sent</div>
                                        <div style={{ fontSize: '0.72rem', color: '#fbbf24', marginTop: '4px' }}>
                                            {stats.collaborations.pending} Pending Review
                                        </div>
                                    </div>

                                    <div className="card stat-card">
                                        <div className="stat-value">{stats.collaborations.acceptanceRate}%</div>
                                        <div className="stat-label">Team Acceptance Rate</div>
                                        <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '4px' }}>
                                            {stats.collaborations.accepted} Teammates Joined
                                        </div>
                                    </div>

                                    <div className="card stat-card">
                                        <div className="stat-value">{stats.discussions.totalComments}</div>
                                        <div className="stat-label">Q&A Questions</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Community Discussions
                                        </div>
                                    </div>

                                    <div className="card stat-card">
                                        <div className="stat-value" style={{ color: '#34d399' }}>100%</div>
                                        <div className="stat-label">System Health</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Node {stats.system.nodeVersion}
                                        </div>
                                    </div>
                                </div>

                                {/* Project Stage Breakdown Cards */}
                                <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
                                        🚀 Projects Pipeline Distribution
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
                                        <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>
                                                {stats.projects.stages.idea}
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>💡 Concept & Ideation</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Early stage proposals</div>
                                        </div>

                                        <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                                                {stats.projects.stages.recruiting}
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>👥 Recruiting Collaborators</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actively seeking talent</div>
                                        </div>

                                        <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>
                                                {stats.projects.stages.building}
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>🔨 Building MVP</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In active development</div>
                                        </div>

                                        <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc' }}>
                                                {stats.projects.stages.launched}
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>🚀 Shipped & Live</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Production products</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Signups & Submissions */}
                                <div className="grid-2">
                                    <div className="card" style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Newest Creators</h3>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('users')}>
                                                View All →
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {stats.users.recent?.map((u) => (
                                                <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div className="project-card-author-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                                                            {(u.fullName || u.username).charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.fullName || u.username}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username} · {u.email}</div>
                                                        </div>
                                                    </div>
                                                    <span className={`status-badge ${u.status || 'active'}`}>{u.status || 'active'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card" style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Latest Ideas Submitted</h3>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('projects')}>
                                                View All →
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {stats.projects.recent?.map((p) => (
                                                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                                                    <div>
                                                        <Link to={`/project/${p._id}`} style={{ fontWeight: 600, fontSize: '0.9rem', color: 'inherit', textDecoration: 'none' }}>
                                                            {p.title}
                                                        </Link>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            by @{p.author?.username || 'unknown'}
                                                        </div>
                                                    </div>
                                                    <span className={`stage-badge ${p.stage || 'recruiting'}`} style={{ fontSize: '0.65rem' }}>
                                                        {p.stage}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* TAB 2: USER MANAGEMENT */}
                {activeTab === 'users' && (
                    <div>
                        {/* Search and Filters */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    fetchUsers();
                                }}
                                className="search-bar"
                                style={{ flex: 1, minWidth: 'min(100%, 280px)', margin: 0 }}
                            >
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search creators by username, email, or full name..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary">Search</button>
                            </form>

                            {/* Status Filter */}
                            <select
                                className="form-input"
                                style={{ width: 'auto', minWidth: '130px' }}
                                value={userStatusFilter}
                                onChange={(e) => {
                                    setUserStatusFilter(e.target.value);
                                    setTimeout(fetchUsers, 0);
                                }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="suspended">Suspended Only</option>
                            </select>

                            {/* Role Filter */}
                            <select
                                className="form-input"
                                style={{ width: 'auto', minWidth: '130px' }}
                                value={userRoleFilter}
                                onChange={(e) => {
                                    setUserRoleFilter(e.target.value);
                                    setTimeout(fetchUsers, 0);
                                }}
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admins Only</option>
                                <option value="member">Members Only</option>
                            </select>
                        </div>

                        {loadingUsers ? (
                            <div className="spinner"></div>
                        ) : users.length === 0 ? (
                            <div className="card empty-state">
                                <h3>No creators match this filter</h3>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {users.map((u) => {
                                    const isSelf = u._id === currentUser._id;
                                    return (
                                        <div key={u._id} className="admin-card-row">
                                            {/* Creator Bio Info */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', minWidth: 'min(100%, 280px)' }}>
                                                <div className="project-card-author-avatar" style={{ width: '42px', height: '42px', fontSize: '1rem' }}>
                                                    {(u.fullName || u.username).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <Link to={`/profile/${u._id}`} style={{ fontWeight: 700, fontSize: '1rem', color: 'inherit', textDecoration: 'none' }}>
                                                            {u.fullName || u.username}
                                                        </Link>
                                                        <span className={`admin-badge ${u.role}`}>{u.role}</span>
                                                        <span className={`status-badge ${u.status || 'active'}`}>{u.status || 'active'}</span>
                                                        {isSelf && (
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                                                                (You)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                        @{u.username} · {u.email} · Joined {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    {u.skills?.length > 0 && (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                                            {u.skills.slice(0, 4).map((s) => (
                                                                <span key={s} className="skill-tag" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleToggleRole(u)}
                                                    disabled={isSelf || actionLoading[u._id]}
                                                    title={u.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                                                >
                                                    {u.role === 'admin' ? '⬇ Make Member' : '⭐ Make Admin'}
                                                </button>

                                                <button
                                                    className={`btn btn-sm ${u.status === 'suspended' ? 'btn-primary' : 'btn-secondary'}`}
                                                    onClick={() => handleToggleStatus(u)}
                                                    disabled={isSelf || actionLoading[u._id]}
                                                    title={u.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                                                >
                                                    {u.status === 'suspended' ? '🔓 Unsuspend' : '🔒 Suspend'}
                                                </button>

                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteUser(u)}
                                                    disabled={isSelf || actionLoading[u._id]}
                                                    title="Permanently Delete Creator"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: PROJECT MODERATION */}
                {activeTab === 'projects' && (
                    <div>
                        {/* Search and Filters */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    fetchProjects();
                                }}
                                className="search-bar"
                                style={{ flex: 1, minWidth: 'min(100%, 280px)', margin: 0 }}
                            >
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search ideas by title, tag, or description..."
                                    value={projectSearch}
                                    onChange={(e) => setProjectSearch(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary">Search</button>
                            </form>

                            {/* Stage Filter */}
                            <select
                                className="form-input"
                                style={{ width: 'auto', minWidth: '140px' }}
                                value={projectStageFilter}
                                onChange={(e) => {
                                    setProjectStageFilter(e.target.value);
                                    setTimeout(fetchProjects, 0);
                                }}
                            >
                                <option value="all">All Stages</option>
                                <option value="idea">💡 Idea Concept</option>
                                <option value="recruiting">👥 Recruiting</option>
                                <option value="building">🔨 Building MVP</option>
                                <option value="launched">🚀 Launched</option>
                            </select>

                            {/* Featured Filter */}
                            <select
                                className="form-input"
                                style={{ width: 'auto', minWidth: '140px' }}
                                value={projectFeaturedFilter}
                                onChange={(e) => {
                                    setProjectFeaturedFilter(e.target.value);
                                    setTimeout(fetchProjects, 0);
                                }}
                            >
                                <option value="all">Featured & All</option>
                                <option value="true">⭐ Featured Only</option>
                                <option value="false">Standard Only</option>
                            </select>
                        </div>

                        {loadingProjects ? (
                            <div className="spinner"></div>
                        ) : projects.length === 0 ? (
                            <div className="card empty-state">
                                <h3>No projects found</h3>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {projects.map((p) => (
                                    <div key={p._id} className="admin-card-row">
                                        <div style={{ minWidth: 'min(100%, 320px)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                                <Link to={`/project/${p._id}`} style={{ fontWeight: 700, fontSize: '1.1rem', color: 'inherit', textDecoration: 'none' }}>
                                                    {p.title}
                                                </Link>
                                                {p.featured && (
                                                    <span className="featured-star-badge">⭐ Staff Pick</span>
                                                )}
                                                <span className={`stage-badge ${p.stage || 'recruiting'}`} style={{ fontSize: '0.68rem' }}>
                                                    {p.stage}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                                by @{p.author?.username || 'unknown'} ({p.author?.email}) · Created {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · ❤️ {p.likes?.length || 0} Likes
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {p.description}
                                            </p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {p.rolesNeeded?.map((r, idx) => (
                                                    <span key={idx} className="skill-tag green" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                                        {r.title} ({r.filled}/{r.spots})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {/* Stage quick switcher */}
                                            <select
                                                className="form-input"
                                                style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 10px' }}
                                                value={p.stage || 'recruiting'}
                                                onChange={(e) => handleUpdateStage(p, e.target.value)}
                                                disabled={actionLoading[p._id]}
                                            >
                                                <option value="idea">💡 Idea</option>
                                                <option value="recruiting">👥 Recruiting</option>
                                                <option value="building">🔨 Building</option>
                                                <option value="launched">🚀 Launched</option>
                                            </select>

                                            {/* Feature Toggle */}
                                            <button
                                                className={`btn btn-sm ${p.featured ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => handleToggleFeatured(p)}
                                                disabled={actionLoading[p._id]}
                                                title={p.featured ? 'Remove from Featured' : 'Feature on homepage'}
                                            >
                                                {p.featured ? '⭐ Featured' : '☆ Feature'}
                                            </button>

                                            {/* View Link */}
                                            <Link to={`/project/${p._id}`} className="btn btn-secondary btn-sm" target="_blank">
                                                Inspect ↗
                                            </Link>

                                            {/* Delete Project */}
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteProject(p)}
                                                disabled={actionLoading[p._id]}
                                                title="Delete this project"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: BROADCAST ANNOUNCEMENT */}
                {activeTab === 'broadcast' && (
                    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                        <div className="card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '2rem' }}>📢</div>
                                <div>
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                                        Platform Broadcast Notification
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                                        Send an in-app system notification instantly to all registered active creators.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleBroadcastSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Announcement Title / Header (optional)</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. Winter Hackathon 2026 is Live!"
                                        value={broadcastForm.title}
                                        onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Urgency & Style</label>
                                    <select
                                        className="form-input"
                                        value={broadcastForm.urgency}
                                        onChange={(e) => setBroadcastForm({ ...broadcastForm, urgency: e.target.value })}
                                    >
                                        <option value="info">📢 General Announcement</option>
                                        <option value="alert">🚨 Urgent Alert / Maintenance</option>
                                        <option value="celebration">🎉 Celebration / Milestone</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Message Content *</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        placeholder="Type your message to all creators here..."
                                        rows={4}
                                        value={broadcastForm.message}
                                        onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                                        required
                                    />
                                </div>

                                <div style={{ background: 'var(--bg-input)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    ℹ️ This notification will immediately appear in the Notification Bell dropdown for all <strong>{stats?.users?.active || 0} active creators</strong> on Crea8x.
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    style={{ width: '100%' }}
                                    disabled={broadcastLoading || !broadcastForm.message.trim()}
                                >
                                    {broadcastLoading ? 'Dispatching Broadcast...' : '🚀 Dispatch to All Creators'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* TAB 5: COMMENT MODERATION */}
                {activeTab === 'comments' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                                    Public Q&A & Comments Moderation
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                                    Review and remove flagged questions or inappropriate discussion entries.
                                </p>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={fetchComments}>
                                🔄 Refresh Comments
                            </button>
                        </div>

                        {loadingComments ? (
                            <div className="spinner"></div>
                        ) : comments.length === 0 ? (
                            <div className="card empty-state">
                                <h3>No comments or questions recorded</h3>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {comments.map((c) => (
                                    <div key={c._id} className="admin-card-row">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                <div className="project-card-author-avatar" style={{ width: '28px', height: '28px', fontSize: '0.72rem' }}>
                                                    {(c.author?.fullName || c.author?.username || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                                    {c.author?.fullName || c.author?.username || 'Deleted User'}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    @{c.author?.username} · {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {c.project && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>
                                                        on project <Link to={`/project/${c.project._id}`} style={{ fontWeight: 700, color: 'inherit' }}>"{c.project.title}"</Link>
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                                                {c.content}
                                            </p>
                                        </div>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteComment(c)}
                                            title="Delete comment"
                                        >
                                            🗑️ Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
