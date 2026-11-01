import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await loginUser(formData);
            login(res.data);
            if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your Crea8X account</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
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
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? <><div className="spinner spinner-sm"></div> Signing In...</> : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <div>
                        Don't have an account? <Link to="/register">Create One</Link>
                    </div>
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                        <Link to="/admin/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                            🛡️ Staff Operations Portal →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
