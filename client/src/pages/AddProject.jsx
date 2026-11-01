import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, aiGenerateDescription, aiSuggestTags } from '../services/api';

const AddProject = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail: '',
        liveUrl: '',
        repoUrl: '',
        tags: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState({ desc: false, tags: false });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = {
                ...formData,
                tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
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
            <div className="container" style={{ maxWidth: '680px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Create New Project</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Showcase your work to the Crea8X community.</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Project Title *</label>
                        <input
                            name="title"
                            className="form-input"
                            placeholder="My Awesome Project"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label">Description *</label>
                            <button type="button" className="btn btn-ai btn-sm" onClick={handleAIDescription} disabled={aiLoading.desc || !formData.title}>
                                {aiLoading.desc ? '✨ Generating...' : '✨ AI Generate'}
                            </button>
                        </div>
                        <textarea
                            name="description"
                            className="form-input form-textarea"
                            placeholder="Describe your project..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            style={{ minHeight: '150px' }}
                        />
                        {aiLoading.desc && <div className="ai-shimmer" style={{ marginTop: '8px' }}></div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Thumbnail URL</label>
                        <input
                            name="thumbnail"
                            className="form-input"
                            placeholder="https://example.com/image.png"
                            value={formData.thumbnail}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Live URL</label>
                            <input
                                name="liveUrl"
                                className="form-input"
                                placeholder="https://myproject.vercel.app"
                                value={formData.liveUrl}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Repository URL</label>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label">Tags (comma-separated)</label>
                            <button type="button" className="btn btn-ai btn-sm" onClick={handleAITags} disabled={aiLoading.tags || !formData.title}>
                                {aiLoading.tags ? '✨ Suggesting...' : '✨ AI Suggest Tags'}
                            </button>
                        </div>
                        <input
                            name="tags"
                            className="form-input"
                            placeholder="React, Node.js, MongoDB"
                            value={formData.tags}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Publishing...' : '🚀 Publish Project'}
                        </button>
                        <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProject;
