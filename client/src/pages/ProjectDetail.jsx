import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getProjectById,
    toggleLike,
    deleteProject,
    applyToProject,
    inviteCreatorToProject,
    getRecommendedCreatorsForProject,
    getProjectApplications,
    updateApplicationStatus,
    addProjectMilestone,
    toggleProjectMilestone,
    deleteProjectMilestone,
    getProjectComments,
    addProjectComment,
    deleteProjectComment,
} from '../services/api';

const ProjectDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);

    // AI Matchmaker Recommendations state (for Author)
    const [recommendedCreators, setRecommendedCreators] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [inviteStatus, setInviteStatus] = useState({});

    // Comments & Q/A state
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    // New Milestone state
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

    // Apply Modal state
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [applyMessage, setApplyMessage] = useState('');
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyError, setApplyError] = useState('');
    const [applySuccess, setApplySuccess] = useState('');

    useEffect(() => {
        fetchProject();
        fetchComments();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await getProjectById(id);
            setProject(res.data);
            if (user && (res.data.author?._id || res.data.author) === user._id) {
                fetchApplications();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        setLoadingApps(true);
        try {
            const res = await getProjectApplications(id);
            setApplications(res.data);
        } catch (err) {
            console.error('Failed to load applications:', err);
        } finally {
            setLoadingApps(false);
        }
    };

    const fetchCreatorRecommendations = async () => {
        setShowRecommendations(true);
        setLoadingRecommendations(true);
        try {
            const res = await getRecommendedCreatorsForProject(id);
            setRecommendedCreators(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const handleInvite = async (creatorId, defaultRole) => {
        try {
            await inviteCreatorToProject({
                projectId: id,
                userId: creatorId,
                role: defaultRole || project.rolesNeeded?.[0]?.title || 'Collaborator',
            });
            setInviteStatus((prev) => ({ ...prev, [creatorId]: 'invited' }));
        } catch (err) {
            console.error(err);
            setInviteStatus((prev) => ({ ...prev, [creatorId]: 'error' }));
        }
    };

    const fetchComments = async () => {
        try {
            const res = await getProjectComments(id);
            setComments(res.data || []);
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    };

    const handleLike = async () => {
        try {
            const res = await toggleLike(id);
            setProject(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await deleteProject(id);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        setApplyError('');
        setApplySuccess('');
        setApplyLoading(true);

        try {
            await applyToProject(id, {
                role: selectedRole,
                message: applyMessage,
            });
            setApplySuccess('🎉 Application submitted! The project creator has been notified.');
            setTimeout(() => {
                setShowApplyModal(false);
                setApplySuccess('');
                setApplyMessage('');
            }, 2000);
        } catch (err) {
            setApplyError(err.response?.data?.message || 'Failed to submit application');
        } finally {
            setApplyLoading(false);
        }
    };

    const handleApplicationDecision = async (appId, status) => {
        try {
            await updateApplicationStatus(appId, { status });
            fetchApplications();
            fetchProject();
        } catch (err) {
            console.error('Decision error:', err);
        }
    };

    // Milestone Actions
    const handleAddMilestone = async (e) => {
        e.preventDefault();
        if (!newMilestoneTitle.trim()) return;
        try {
            const res = await addProjectMilestone(id, { title: newMilestoneTitle.trim() });
            setProject((prev) => ({ ...prev, milestones: res.data }));
            setNewMilestoneTitle('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleMilestone = async (milestoneId) => {
        try {
            const res = await toggleProjectMilestone(id, milestoneId);
            setProject((prev) => ({ ...prev, milestones: res.data }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteMilestone = async (milestoneId) => {
        try {
            const res = await deleteProjectMilestone(id, milestoneId);
            setProject((prev) => ({ ...prev, milestones: res.data }));
        } catch (err) {
            console.error(err);
        }
    };

    // Comment Actions
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            const res = await addProjectComment(id, { content: newComment.trim() });
            setComments((prev) => [...prev, res.data]);
            setNewComment('');
        } catch (err) {
            console.error(err);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteProjectComment(id, commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="page"><div className="spinner"></div></div>;
    if (!project) {
        return (
            <div className="page">
                <div className="container">
                    <div className="card empty-state">
                        <h3>Project not found</h3>
                    </div>
                </div>
            </div>
        );
    }

    const isAuthor = user?._id === (project.author?._id || project.author);
    const isLiked = project.likes?.includes(user?._id);
    const isTeamMember = project.team?.some(
        (m) => (m.user?._id || m.user) === user?._id
    );

    const hasTeamLinks =
        project.teamLinks &&
        (project.teamLinks.discord || project.teamLinks.slack || project.teamLinks.meet || project.teamLinks.notes);

    const stageLabels = {
        idea: '💡 Idea Stage',
        recruiting: '👥 Recruiting Collaborators',
        building: '🔨 Building MVP',
        launched: '🚀 Launched',
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '840px' }}>
                {/* Thumbnail */}
                {project.thumbnail && (
                    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '28px', border: '1px solid var(--border-color)' }}>
                        <img src={project.thumbnail} alt={project.title} style={{ width: '100%', maxHeight: '380px', objectFit: 'cover' }} />
                    </div>
                )}

                {/* Stage Badge & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <span className={`stage-badge ${project.stage || 'recruiting'}`}>
                        {stageLabels[project.stage] || '👥 Recruiting'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Created {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>

                {/* Title */}
                <h1 className="project-detail-title">{project.title}</h1>

                {/* Author Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Link to={`/profile/${project.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="project-card-author-avatar">
                            {(project.author?.fullName || project.author?.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{project.author?.fullName || project.author?.username}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{project.author?.username} · Project Creator</div>
                        </div>
                    </Link>
                </div>

                {/* Action Buttons */}
                <div className="project-detail-actions">
                    <button className={`btn ${isLiked ? 'btn-primary' : 'btn-secondary'}`} onClick={handleLike}>
                        {isLiked ? '❤️' : '🤍'} {project.likes?.length || 0} {project.likes?.length === 1 ? 'Like' : 'Likes'}
                    </button>

                    {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                            🌐 Live Demo
                        </a>
                    )}
                    {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                            💻 Source Code
                        </a>
                    )}

                    {!isAuthor && !isTeamMember && user && (
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setSelectedRole(project.rolesNeeded?.[0]?.title || 'Collaborator');
                                setShowApplyModal(true);
                            }}
                        >
                            🤝 Apply to Join Team
                        </button>
                    )}

                    {isTeamMember && !isAuthor && (
                        <span className="app-status accepted" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            ✓ You are on this team
                        </span>
                    )}

                    {isAuthor && (
                        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                            🗑️ Delete Project
                        </button>
                    )}
                </div>

                {/* Tags */}
                {project.tags?.length > 0 && (
                    <div className="skills-container" style={{ marginBottom: '28px' }}>
                        {project.tags.map((tag, i) => (
                            <span key={tag} className={`skill-tag ${['', 'cyan', 'pink', 'green'][i % 4]}`}>{tag}</span>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
                    <h3 style={{ marginBottom: '14px', fontSize: '1.2rem', fontWeight: 700 }}>About This Project</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                        {project.description}
                    </p>
                </div>

                {/* PRIVATE TEAM WORKSPACE */}
                {(isAuthor || isTeamMember) ? (
                    hasTeamLinks && (
                        <div
                            className="card"
                            style={{
                                padding: '24px',
                                marginBottom: '32px',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                            }}
                        >
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: '#34d399' }}>
                                🔓 Team Workspace & Communication
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Exclusive channels for accepted team members to collaborate and build.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {project.teamLinks.discord && (
                                    <a href={project.teamLinks.discord} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                        💬 Discord Server
                                    </a>
                                )}
                                {project.teamLinks.slack && (
                                    <a href={project.teamLinks.slack} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                        💼 Slack / Chat
                                    </a>
                                )}
                                {project.teamLinks.meet && (
                                    <a href={project.teamLinks.meet} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                        📹 Google Meet
                                    </a>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    <div className="card" style={{ padding: '16px 20px', marginBottom: '32px', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                            🔒 <strong>Private Team Handoff:</strong> Discord & meeting links unlock automatically for accepted contributors.
                        </span>
                    </div>
                )}

                {/* Roles Needed Section */}
                <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Roles & Skills Needed 👥</h3>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {project.rolesNeeded?.length || 0} Open Roles
                            </span>
                        </div>
                        {isAuthor && (
                            <button
                                type="button"
                                className="btn btn-ai btn-sm"
                                onClick={fetchCreatorRecommendations}
                                disabled={loadingRecommendations}
                            >
                                {loadingRecommendations ? '✨ Scouting...' : '🤖 AI Match Candidates'}
                            </button>
                        )}
                    </div>

                    {!project.rolesNeeded?.length ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No specific roles listed for this project.</p>
                    ) : (
                        <div className="role-grid">
                            {project.rolesNeeded.map((r, i) => (
                                <div key={i} className="role-card">
                                    <div className="role-card-header">
                                        <div className="role-card-title">{r.title}</div>
                                        <div className="role-card-spots">
                                            {r.filled || 0}/{r.spots || 1} Filled
                                        </div>
                                    </div>
                                    {r.skills?.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                            {r.skills.map((s) => (
                                                <span key={s} className="skill-tag" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {!isAuthor && !isTeamMember && user && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            style={{ marginTop: '8px' }}
                                            onClick={() => {
                                                setSelectedRole(r.title);
                                                setShowApplyModal(true);
                                            }}
                                        >
                                            Apply for this role →
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* AI RECOMMENDED CREATORS (Proactive Recruitment) */}
                    {showRecommendations && (
                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-purple)' }}>
                                🎯 AI Suggested Creators For Your Roles
                            </h4>
                            {loadingRecommendations ? (
                                <div className="spinner spinner-sm"></div>
                            ) : recommendedCreators.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No unteamed creators with matching skills found currently.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                                    {recommendedCreators.map((cand) => (
                                        <div key={cand._id} style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <Link to={`/profile/${cand._id}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: 'inherit', textDecoration: 'none' }}>
                                                    {cand.fullName || cand.username}
                                                </Link>
                                                <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                                                    ⭐ {cand.matchScore}%
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                                                {cand.matchedSkills?.map((s) => (
                                                    <span key={s} className="skill-tag green" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                style={{ width: '100%', fontSize: '0.75rem' }}
                                                disabled={inviteStatus[cand._id] === 'invited'}
                                                onClick={() => handleInvite(cand._id, cand.matchedSkills?.[0])}
                                            >
                                                {inviteStatus[cand._id] === 'invited' ? '✓ Invited!' : '✉️ Send Invite'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Team Members Section */}
                <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Team Members ({project.team?.length || 1})</h3>
                    <div className="team-list">
                        {project.team?.map((member, i) => (
                            <Link
                                key={i}
                                to={`/profile/${member.user?._id || member.user}`}
                                className="team-chip"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="project-card-author-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                                    {(member.user?.fullName || member.user?.username || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{member.user?.fullName || member.user?.username}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>({member.role})</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* COLLABORATIVE MILESTONES */}
                <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>📋 Milestones & Tasks</h3>
                    {project.milestones?.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No milestones created yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {project.milestones?.map((m) => (
                                <div
                                    key={m._id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 14px',
                                        background: 'var(--bg-input)',
                                        borderRadius: 'var(--radius-sm)',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={m.completed}
                                        disabled={!isAuthor && !isTeamMember}
                                        onChange={() => handleToggleMilestone(m._id)}
                                        style={{ width: '18px', height: '18px', cursor: (isAuthor || isTeamMember) ? 'pointer' : 'default' }}
                                    />
                                    <span
                                        style={{
                                            fontSize: '0.92rem',
                                            textDecoration: m.completed ? 'line-through' : 'none',
                                            color: m.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                            flex: 1,
                                        }}
                                    >
                                        {m.title}
                                    </span>
                                    {isAuthor && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteMilestone(m._id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {(isAuthor || isTeamMember) && (
                        <form onSubmit={handleAddMilestone} className="milestone-form">
                            <input
                                className="form-input"
                                placeholder="Add a new milestone or deliverable..."
                                value={newMilestoneTitle}
                                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                            />
                            <button type="submit" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                                + Add Task
                            </button>
                        </form>
                    )}
                </div>

                {/* Q&A / COMMUNITY DISCUSSION */}
                <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>💬 Questions & Discussion ({comments.length})</h3>

                    {/* Comment form */}
                    {user ? (
                        <form onSubmit={handleAddComment} style={{ marginBottom: '24px' }}>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Ask a question about the project vision, scope, or tech stack..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                style={{ minHeight: '80px', marginBottom: '10px' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={commentLoading || !newComment.trim()}>
                                    {commentLoading ? 'Posting...' : 'Post Question / Comment'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                            <Link to="/login" style={{ color: 'var(--accent-purple)' }}>Sign in</Link> to ask questions or discuss this project.
                        </p>
                    )}

                    {/* Comments list */}
                    {comments.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>
                            No questions asked yet. Be the first to start the conversation!
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {comments.map((c) => (
                                <div key={c._id} style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <Link to={`/profile/${c.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                                            <div className="project-card-author-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                                                {(c.author?.fullName || c.author?.username || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.author?.fullName || c.author?.username}</span>
                                        </Link>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {(user?._id === c.author?._id || isAuthor) && (
                                                <button
                                                    onClick={() => handleDeleteComment(c._id)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {c.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AUTHOR ONLY: Manage Applications */}
                {isAuthor && (
                    <div className="card" style={{ padding: '28px', border: '1px solid var(--accent-purple)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Applications to Join ({applications.length})</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Review creators who applied to contribute to your idea.
                                </p>
                            </div>
                            {loadingApps && <div className="spinner spinner-sm"></div>}
                        </div>

                        {applications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                No applications received yet.
                            </div>
                        ) : (
                            <div>
                                {applications.map((app) => (
                                    <div key={app._id} className="application-card">
                                        <div className="application-header">
                                            <Link
                                                to={`/profile/${app.applicant?._id}`}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}
                                            >
                                                <div className="project-card-author-avatar" style={{ width: '36px', height: '36px' }}>
                                                    {(app.applicant?.fullName || app.applicant?.username || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{app.applicant?.fullName || app.applicant?.username}</div>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{app.applicant?.username}</div>
                                                </div>
                                            </Link>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="skill-tag" style={{ fontSize: '0.75rem' }}>
                                                    Role: {app.role} {app.origin === 'invite' ? '(Invited)' : ''}
                                                </span>
                                                <span className={`app-status ${app.status}`}>{app.status}</span>
                                            </div>
                                        </div>

                                        {app.applicant?.skills?.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                                                {app.applicant.skills.map((s) => (
                                                    <span key={s} className="skill-tag" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {app.message && (
                                            <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '12px' }}>
                                                "{app.message}"
                                            </div>
                                        )}

                                        {app.status === 'pending' && app.origin === 'application' && (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleApplicationDecision(app._id, 'accepted')}
                                                >
                                                    ✓ Accept & Add to Team
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleApplicationDecision(app._id, 'rejected')}
                                                >
                                                    ✕ Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Apply to Join Modal */}
                {showApplyModal && (
                    <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Join Project: {project.title}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                                Send a request to the project creator explaining how your skills can help bring this idea to life.
                            </p>

                            {applyError && <div className="alert alert-error">{applyError}</div>}
                            {applySuccess && <div className="alert alert-success">{applySuccess}</div>}

                            <form onSubmit={handleApplySubmit}>
                                <div className="form-group">
                                    <label className="form-label">Role You Wish to Take *</label>
                                    {project.rolesNeeded?.length > 0 ? (
                                        <select
                                            className="form-input"
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            required
                                        >
                                            {project.rolesNeeded.map((r, idx) => (
                                                <option key={idx} value={r.title}>
                                                    {r.title} ({r.spots - r.filled} spots left)
                                                </option>
                                            ))}
                                            <option value="Other Collaborator">Other / General Collaborator</option>
                                        </select>
                                    ) : (
                                        <input
                                            className="form-input"
                                            placeholder="e.g. Frontend Developer, Designer"
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            required
                                        />
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Pitch / Message (optional)</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        placeholder="Hi! I have experience with React and Tailwind, and I'd love to help build the MVP..."
                                        value={applyMessage}
                                        onChange={(e) => setApplyMessage(e.target.value)}
                                        style={{ minHeight: '100px' }}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                        disabled={applyLoading}
                                    >
                                        {applyLoading ? 'Sending Application...' : '🚀 Submit Request'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowApplyModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetail;
