import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjectById, toggleLike, deleteProject } from '../services/api';

const ProjectDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await getProjectById(id);
            setProject(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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

    if (loading) return <div className="page"><div className="spinner"></div></div>;
    if (!project) return <div className="page"><div className="container"><div className="card empty-state"><h3>Project not found</h3></div></div></div>;

    const isAuthor = user?._id === (project.author?._id || project.author);
    const isLiked = project.likes?.includes(user?._id);

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                {/* Thumbnail */}
                {project.thumbnail && (
                    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '32px', border: '1px solid var(--border-color)' }}>
                        <img src={project.thumbnail} alt={project.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                    </div>
                )}

                {/* Title & Author */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>{project.title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link to={`/profile/${project.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="project-card-author-avatar">
                                {(project.author?.fullName || project.author?.username || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{project.author?.fullName || project.author?.username}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{project.author?.username}</div>
                            </div>
                        </Link>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 'auto' }}>
                            {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <button className={`btn ${isLiked ? 'btn-primary' : 'btn-secondary'}`} onClick={handleLike}>
                        {isLiked ? '❤️' : '🤍'} {project.likes?.length || 0} {project.likes?.length === 1 ? 'Like' : 'Likes'}
                    </button>
                    {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                            🌐 Live Demo
                        </a>
                    )}
                    {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                            💻 Source Code
                        </a>
                    )}
                    {isAuthor && (
                        <button className="btn btn-danger btn-sm" onClick={handleDelete} style={{ marginLeft: 'auto' }}>
                            🗑️ Delete
                        </button>
                    )}
                </div>

                {/* Tags */}
                {project.tags?.length > 0 && (
                    <div className="skills-container" style={{ marginBottom: '32px' }}>
                        {project.tags.map((tag, i) => (
                            <span key={tag} className={`skill-tag ${['', 'cyan', 'pink', 'green'][i % 4]}`}>{tag}</span>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div className="card" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>About This Project</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                        {project.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
