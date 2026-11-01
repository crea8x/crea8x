import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, aiArchitectIdea, aiGenerateDescription, aiSuggestTags } from '../services/api';

const AddProject = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        stage: 'recruiting',
        thumbnail: '',
        liveUrl: '',
        repoUrl: '',
        tags: '',
        teamLinks: {
            discord: '',
            slack: '',
            meet: '',
            notes: '',
        },
    });

    const [rolesNeeded, setRolesNeeded] = useState([
        { title: '', skills: '', spots: 1 },
    ]);

    const [milestones, setMilestones] = useState([
        { title: 'Project kick-off & scope definition' },
        { title: 'MVP development & internal testing' },
        { title: 'Beta launch to community' },
    ]);

    const [showTeamLinks, setShowTeamLinks] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiArchitectLoading, setAiArchitectLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState({ desc: false, tags: false });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTeamLinkChange = (e) => {
        setFormData({
            ...formData,
            teamLinks: { ...formData.teamLinks, [e.target.name]: e.target.value },
        });
    };

    const handleRoleChange = (index, field, value) => {
        setRolesNeeded((prev) => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const addRoleRow = () => {
        setRolesNeeded((prev) => [...prev, { title: '', skills: '', spots: 1 }]);
    };

    const removeRoleRow = (index) => {
        setRolesNeeded((prev) => prev.filter((_, i) => i !== index));
    };

    const handleMilestoneChange = (index, value) => {
        setMilestones((prev) => {
            const updated = [...prev];
            updated[index].title = value;
            return updated;
        });
    };

    const addMilestoneRow = () => {
        setMilestones((prev) => [...prev, { title: '' }]);
    };

    const removeMilestoneRow = (index) => {
        setMilestones((prev) => prev.filter((_, i) => i !== index));
    };

    // ===== 1-CLICK AI ARCHITECT =====
    const handleAIArchitect = async () => {
        if (!formData.title) {
            setError('Please enter at least an Idea Title or concept first.');
            return;
        }
        setError('');
        setAiArchitectLoading(true);

        try {
            const res = await aiArchitectIdea({
                title: formData.title,
                prompt: formData.description,
            });

            const plan = res.data;

            // Auto-populate description
            if (plan.expandedDescription) {
                setFormData((prev) => ({
                    ...prev,
                    description: plan.expandedDescription,
                    tags: plan.suggestedTags ? plan.suggestedTags.join(', ') : prev.tags,
                }));
            }

            // Auto-populate roles
            if (plan.suggestedRoles?.length > 0) {
                setRolesNeeded(
                    plan.suggestedRoles.map((r) => ({
                        title: r.title,
                        skills: Array.isArray(r.skills) ? r.skills.join(', ') : r.skills || '',
                        spots: r.spots || 1,
                    }))
                );
            }

            // Auto-populate milestones
            if (plan.initialMilestones?.length > 0) {
                setMilestones(plan.initialMilestones.map((m) => ({ title: m })));
            }
        } catch (err) {
            console.error('AI Architect Error:', err);
            setError(err.response?.data?.message || 'AI architect failed');
        } finally {
            setAiArchitectLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const cleanRoles = rolesNeeded
                .filter((r) => r.title.trim())
                .map((r) => ({
                    title: r.title.trim(),
                    skills: r.skills ? r.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
                    spots: Number(r.spots) || 1,
                    filled: 0,
                }));

            const cleanMilestones = milestones
                .filter((m) => m.title.trim())
                .map((m) => ({ title: m.title.trim() }));

            const data = {
                ...formData,
                tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
                rolesNeeded: cleanRoles,
                milestones: cleanMilestones,
            };

            const res = await createProject(data);
            navigate(`/project/${res.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '760px' }}>
                {/* AI Architect Hero Box */}
                <div
                    className="card"
                    style={{
                        padding: '24px',
                        marginBottom: '32px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(6, 182, 212, 0.12))',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                >
                    <div className="ai-architect-banner">
                        <div>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>
                                🤖 AI Idea-to-Team Architect
                            </h2>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Type an idea title below, then let Gemini auto-generate your full tech stack, team roles, and milestones!
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-ai btn-lg"
                            onClick={handleAIArchitect}
                            disabled={aiArchitectLoading}
                        >
                            {aiArchitectLoading ? '✨ Architecting Plan...' : '✨ Auto-Plan With AI'}
                        </button>
                    </div>
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Share Your Idea 💡</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Post your project vision and recruit collaborators to build it with you.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid-2-1">
                        <div className="form-group">
                            <label className="form-label">Idea / Project Title *</label>
                            <input
                                name="title"
                                className="form-input"
                                placeholder="e.g. AI-Powered Freelancer Matchmaker"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Project Stage</label>
                            <select
                                name="stage"
                                className="form-input"
                                value={formData.stage}
                                onChange={handleChange}
                            >
                                <option value="idea">💡 Idea / Concept</option>
                                <option value="recruiting">👥 Recruiting Collaborators</option>
                                <option value="building">🔨 Building MVP</option>
                                <option value="launched">🚀 Launched</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description & Vision *</label>
                        <textarea
                            name="description"
                            className="form-input form-textarea"
                            placeholder="Explain the problem you are solving, your target audience, and why you want to build this..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            style={{ minHeight: '140px' }}
                        />
                    </div>

                    {/* Roles Needed Section */}
                    <div className="card" style={{ padding: '24px', marginBottom: '28px', background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Roles & Skills Needed 👥</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Positions open for contributors with matching skills.
                                </p>
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addRoleRow}>
                                + Add Position
                            </button>
                        </div>

                        {rolesNeeded.map((role, idx) => (
                            <div key={idx} className="role-form-row">
                                <input
                                    className="form-input"
                                    placeholder="Role Title (e.g. Frontend Dev)"
                                    value={role.title}
                                    onChange={(e) => handleRoleChange(idx, 'title', e.target.value)}
                                />
                                <input
                                    className="form-input"
                                    placeholder="Skills (e.g. React, Tailwind)"
                                    value={role.skills}
                                    onChange={(e) => handleRoleChange(idx, 'skills', e.target.value)}
                                />
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    className="form-input"
                                    placeholder="Spots"
                                    value={role.spots}
                                    onChange={(e) => handleRoleChange(idx, 'spots', e.target.value)}
                                />
                                {rolesNeeded.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRoleRow(idx)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem', padding: '4px 8px' }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Milestones Roadmap Section */}
                    <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Project Milestones 📋</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Key checkpoints your team will achieve together.
                                </p>
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addMilestoneRow}>
                                + Add Milestone
                            </button>
                        </div>

                        {milestones.map((m, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', width: '24px' }}>#{idx + 1}</span>
                                <input
                                    className="form-input"
                                    placeholder="e.g. Complete wireframes in Figma"
                                    value={m.title}
                                    onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                                />
                                {milestones.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeMilestoneRow(idx)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px 8px' }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Tags */}
                    <div className="form-group">
                        <label className="form-label">Tags (comma-separated)</label>
                        <input
                            name="tags"
                            className="form-input"
                            placeholder="AI, React, WebApp, OpenSource"
                            value={formData.tags}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Expandable Private Team Links */}
                    <div style={{ marginBottom: '28px' }}>
                        <button
                            type="button"
                            onClick={() => setShowTeamLinks(!showTeamLinks)}
                            className="btn btn-secondary btn-sm"
                            style={{ marginBottom: '12px' }}
                        >
                            {showTeamLinks ? '▲ Hide Private Team Links' : '🔒 Set Private Team Handoff Links (Discord / Slack / Meet)'}
                        </button>

                        {showTeamLinks && (
                            <div className="card" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                    These links are completely private and automatically unlock only for accepted collaborators!
                                </p>
                                <div className="form-group">
                                    <label className="form-label">Team Discord Invite URL</label>
                                    <input
                                        name="discord"
                                        className="form-input"
                                        placeholder="https://discord.gg/yourteam"
                                        value={formData.teamLinks.discord}
                                        onChange={handleTeamLinkChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Team Slack / WhatsApp URL</label>
                                    <input
                                        name="slack"
                                        className="form-input"
                                        placeholder="https://join.slack.com/..."
                                        value={formData.teamLinks.slack}
                                        onChange={handleTeamLinkChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Team Google Meet Link</label>
                                    <input
                                        name="meet"
                                        className="form-input"
                                        placeholder="https://meet.google.com/xyz"
                                        value={formData.teamLinks.meet}
                                        onChange={handleTeamLinkChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Live URL (optional)</label>
                            <input
                                name="liveUrl"
                                className="form-input"
                                placeholder="https://myproject.com"
                                value={formData.liveUrl}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Repository URL (optional)</label>
                            <input
                                name="repoUrl"
                                className="form-input"
                                placeholder="https://github.com/user/repo"
                                value={formData.repoUrl}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Thumbnail Image URL (optional)</label>
                        <input
                            name="thumbnail"
                            className="form-input"
                            placeholder="https://example.com/banner.png"
                            value={formData.thumbnail}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Publishing Idea...' : '🚀 Publish & Recruit Collaborators'}
                        </button>
                        <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProject;
