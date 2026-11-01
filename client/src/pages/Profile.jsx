import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserById, getProjects, updateUser, aiGenerateBio } from '../services/api';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser, updateUserData } = useAuth();
    const [profile, setProfile] = useState(null);
    const [projects, setProjects] = useState([]);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generatingBio, setGeneratingBio] = useState(false);

    const isOwn = currentUser?._id === id;

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const [userRes, projRes] = await Promise.all([
                getUserById(id),
                getProjects(),
            ]);
            setProfile(userRes.data);
            const userProjects = projRes.data.filter(
                (p) => (p.author?._id || p.author) === id
            );
            setProjects(userProjects);
            setEditForm({
                fullName: userRes.data.fullName || '',
                bio: userRes.data.bio || '',
                skills: userRes.data.skills?.join(', ') || '',
                github: userRes.data.socialLinks?.github || '',
                linkedin: userRes.data.socialLinks?.linkedin || '',
                portfolio: userRes.data.socialLinks?.portfolio || '',
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = {
                fullName: editForm.fullName,
                bio: editForm.bio,
                skills: editForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
                socialLinks: {
                    github: editForm.github,
                    linkedin: editForm.linkedin,
                    portfolio: editForm.portfolio,
                },
            };
            const res = await updateUser(id, data);
            setProfile(res.data);
            updateUserData(res.data);
            setEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleAIBio = async () => {
        const skills = editForm.skills.split(',').map((s) => s.trim()).filter(Boolean);
        if (!skills.length) return;
        setGeneratingBio(true);
        try {
            const res = await aiGenerateBio({ fullName: editForm.fullName, skills });
            setEditForm((prev) => ({ ...prev, bio: res.data.bio }));
        } catch (err) {
            console.error(err);
        } finally {
            setGeneratingBio(false);
        }
    };

    if (loading) return <div className="page"><div className="spinner"></div></div>;
    if (!profile) return <div className="page"><div className="container"><div className="card empty-state"><h3>User not found</h3></div></div></div>;

    return (
        <div className="page">
            <div className="container">
                {/* Profile Header */}
                <div className="card profile-header">
                    <div className="profile-avatar-lg">
                        {(profile.fullName || profile.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h1>{profile.fullName || profile.username}</h1>
                        <div className="profile-handle">@{profile.username}</div>
                        {profile.bio && <div className="profile-bio">{profile.bio}</div>}
                        <div className="skills-container" style={{ marginBottom: '16px' }}>
                            {profile.skills?.map((s, i) => (
                                <span key={s} className={`skill-tag ${['', 'cyan', 'pink', 'green'][i % 4]}`}>{s}</span>
                            ))}
                        </div>
                        <div className="profile-social-links">
                            {profile.socialLinks?.github && (
                                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link">GitHub</a>
                            )}
                            {profile.socialLinks?.linkedin && (
                                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">LinkedIn</a>
                            )}
                            {profile.socialLinks?.portfolio && (
                                <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="social-link">Portfolio</a>
                            )}
                        </div>
                        {isOwn && !editing && (
                            <button className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }} onClick={() => setEditing(true)}>Edit Profile</button>
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                {editing && (
                    <div className="modal-overlay" onClick={() => setEditing(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h2>Edit Profile</h2>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="form-label">Bio</label>
                                    <button className="btn btn-ai btn-sm" onClick={handleAIBio} disabled={generatingBio} style={{ marginBottom: '8px' }}>
                                        {generatingBio ? '✨ Generating...' : '✨ AI Generate'}
                                    </button>
                                </div>
                                <textarea className="form-input form-textarea" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell the world about yourself..." />
                                {generatingBio && <div className="ai-shimmer" style={{ marginTop: '8px' }}></div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Skills (comma-separated)</label>
                                <input className="form-input" value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} placeholder="React, Node.js, Python" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">GitHub URL</label>
                                <input className="form-input" value={editForm.github} onChange={(e) => setEditForm({ ...editForm, github: e.target.value })} placeholder="https://github.com/username" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">LinkedIn URL</label>
                                <input className="form-input" value={editForm.linkedin} onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Portfolio URL</label>
                                <input className="form-input" value={editForm.portfolio} onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })} placeholder="https://yoursite.com" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Projects */}
                <div style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>{isOwn ? 'Your' : `${profile.fullName || profile.username}'s`} Projects</h2>
                        {isOwn && <Link to="/project/new" className="btn btn-primary btn-sm">+ New Project</Link>}
                    </div>
                    {projects.length === 0 ? (
                        <div className="card empty-state">
                            <h3>No projects yet</h3>
                            <p>{isOwn ? 'Start showcasing your work!' : 'This creator hasn\'t added any projects yet.'}</p>
                        </div>
                    ) : (
                        <div className="grid-3">
                            {projects.map((project) => (
                                <Link to={`/project/${project._id}`} key={project._id}>
                                    <div className="card project-card">
                                        <div className="project-card-thumb" style={project.thumbnail ? { backgroundImage: `url(${project.thumbnail})` } : {}}>
                                            {!project.thumbnail && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2rem', opacity: 0.3 }}>🖼️</div>}
                                        </div>
                                        <div className="project-card-body">
                                            <div className="project-card-title">{project.title}</div>
                                            <div className="project-card-desc">{project.description}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="skills-container">
                                                    {project.tags?.slice(0, 3).map((tag) => <span key={tag} className="skill-tag">{tag}</span>)}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>❤️ {project.likes?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
