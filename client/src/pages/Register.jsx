import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';

const SKILL_OPTIONS = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB',
    'Express', 'Django', 'Flutter', 'Java', 'C++', 'Machine Learning',
    'UI/UX Design', 'Figma', 'HTML/CSS', 'Firebase', 'AWS', 'Docker',
    'Next.js', 'Vue.js', 'Angular', 'PostgreSQL', 'GraphQL', 'Rust',
    'Go', 'Swift', 'Kotlin', 'TensorFlow', 'Data Science', 'DevOps',
];

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        skills: [],
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSkill = (skill) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter((s) => s !== skill)
                : [...prev.skills, skill],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await registerUser(formData);
            login(res.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '520px' }}>
                <h1 className="auth-title">Join Crea8X</h1>
                <p className="auth-subtitle">Create your account and start building</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Username *</label>
                            <input
                                type="text"
                                name="username"
                                className="form-input"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password *</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Min 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Select Your Skills</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '8px 0' }}>
                            {SKILL_OPTIONS.map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    className={`skill-tag ${formData.skills.includes(skill) ? '' : ''}`}
                                    style={{
                                        cursor: 'pointer',
                                        background: formData.skills.includes(skill) ? 'var(--accent-purple)' : 'rgba(139, 92, 246, 0.15)',
                                        color: formData.skills.includes(skill) ? 'white' : 'var(--accent-purple)',
                                        border: formData.skills.includes(skill) ? '1px solid var(--accent-purple)' : '1px solid rgba(139,92,246,0.2)',
                                    }}
                                    onClick={() => toggleSkill(skill)}
                                >
                                    {formData.skills.includes(skill) ? '✓ ' : ''}{skill}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? <><div className="spinner spinner-sm"></div> Creating Account...</> : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
