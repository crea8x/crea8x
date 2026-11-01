import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, aiGenerateDescription, aiSuggestTags } from '../services/api';

const AddProject = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        stage: 'recruiting',
        thumbnail: '',
        liveUrl: '',
        repoUrl: '',
        tags: '',
    });

    const [rolesNeeded, setRolesNeeded] = useState([
        { title: '', skills: '', spots: 1 },
    ]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState({ desc: false, tags: false });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Clean up roles
            const cleanRoles = rolesNeeded
                .filter((r) => r.title.trim())
                .map((r) => ({
                    title: r.title.trim(),
                    skills: r.skills ? r.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
                    spots: Number(r.spots) || 1,
                    filled: 0,
                }));

            const data = {
                ...formData,
                tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
                rolesNeeded: cleanRoles,
            };

            const res = await createProject(data);
            navigate(`/project/${res.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const handleAIDescription = async () => {
        if (!formData.title) return;
        setAiLoading({ ...aiLoading, desc: true });
        try {
            const tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
            const res = await aiGenerateDescription({ title: formData.title, tags });
            setFormData((prev) => ({ ...prev, description: res.data.description }));
        } catch (err) {
            console.error(err);
        } finally {
            setAiLoading({ ...aiLoading, desc: false });
        }
    };

    const handleAITags = async () => {
        if (!formData.title) return;
        setAiLoading({ ...aiLoading, tags: true });
        try {
            const res = await aiSuggestTags({ title: formData.title, description: formData.description });
            setFormData((prev) => ({ ...prev, tags: res.data.tags.join(', ') }));
        } catch (err) {
            console.error(err);
        } finally {
            setAiLoading({ ...aiLoading, tags: false });
        }
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '720px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Share Your Idea 💡</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Post your project vision and find the talented collaborators needed to build it.
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Idea / Project Title *</label>
                            <input
                                name="title"
                                className="form-input"
                                placeholder="e.g. AI-Powered Music Collab Platform"
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
                                <option value="recruiting">👥 Recruiting Team</option>
                                <option value="building">🔨 Building MVP</option>
                                <option value="launched">🚀 Launched</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label">Description & Vision *</label>
                            <button
                                type="button"
                                className="btn btn-ai btn-sm"
                                onClick={handleAIDescription}
                                disabled={aiLoading.desc || !formData.title}
                            >
                                {aiLoading.desc ? '✨ Generating...' : '✨ AI Polish Description'}
                            </button>
                        </div>
                        <textarea
                            name="description"
                            className="form-input form-textarea"
                            placeholder="Describe what you want to build, the problem it solves, and why you're excited about it..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            style={{ minHeight: '140px' }}
                        />
                        {aiLoading.desc && <div className="ai-shimmer" style={{ marginTop: '8px' }}></div>}
                    </div>

                    {/* Roles Needed Section */}
                    <div className="card" style={{ padding: '20px', marginBottom: '24px', background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Roles & Skills Needed 🤝</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Specify who you need so creators with matching skills can find and apply to join.
                                </p>
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={addRoleRow}>
                                + Add Role
                            </button>
                        </div>

                        {rolesNeeded.map((role, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 2fr 1fr auto',
                                    gap: '12px',
                                    alignItems: 'center',
                                    marginBottom: '12px',
                                }}
                            >
                                <div>
                                    <input
                                        className="form-input"
                                        placeholder="Role Title (e.g. Frontend Dev)"
                                        value={role.title}
                                        onChange={(e) => handleRoleChange(idx, 'title', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <input
                                        className="form-input"
                                        placeholder="Skills (e.g. React, Tailwind)"
                                        value={role.skills}
                                        onChange={(e) => handleRoleChange(idx, 'skills', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        className="form-input"
                                        placeholder="Spots"
                                        value={role.spots}
                                        onChange={(e) => handleRoleChange(idx, 'spots', e.target.value)}
                                        title="Number of openings"
                                    />
                                </div>
                                <div>
                                    {rolesNeeded.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRoleRow(idx)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '1.1rem',
                                                padding: '4px 8px',
                                            }}
                                            title="Remove role"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label">General Tags (comma-separated)</label>
                            <button
                                type="button"
                                className="btn btn-ai btn-sm"
                                onClick={handleAITags}
                                disabled={aiLoading.tags || !formData.title}
                            >
                                {aiLoading.tags ? '✨ Suggesting...' : '✨ AI Suggest Tags'}
                            </button>
                        </div>
                        <input
                            name="tags"
                            className="form-input"
                            placeholder="AI, WebApp, OpenSource, HealthTech"
                            value={formData.tags}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Live Demo URL (optional)</label>
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
                        <label className="form-label">Cover / Thumbnail Image URL (optional)</label>
                        <input
                            name="thumbnail"
                            className="form-input"
                            placeholder="https://example.com/banner.png"
                            value={formData.thumbnail}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Publishing Idea...' : '🚀 Publish & Find Collaborators'}
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
