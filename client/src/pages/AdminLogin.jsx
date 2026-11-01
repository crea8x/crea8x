import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminLoginUser } from '../services/api';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ identifier: '', password: '' });
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
            const res = await adminLoginUser(formData);
            login(res.data);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Administrative authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div
                className="auth-card"
                style={{
                    maxWidth: '460px',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    boxShadow: '0 0 40px rgba(245, 158, 11, 0.12), 0 20px 60px rgba(0, 0, 0, 0.6)',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            margin: '0 auto 14px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(236, 72, 153, 0.2))',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.8rem',
                        }}
                    >
                        🛡️
                    </div>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                        Staff Operations Terminal
                    </div>

                    <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '4px 0 6px 0' }}>Crea<span className="logo-infinity">∞</span>X Staff Console</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                        Restricted portal for platform administrators and operators.
                    </p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Admin Username or Email</label>
                        <input
                            type="text"
                            name="identifier"
                            className="form-input"
                            placeholder="Maddy or admin@crea8x.com"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Admin Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner spinner-sm"></div> Verifying Credentials...
                            </>
                        ) : (
                            '🔐 Authenticate & Open Mission Control'
                        )}
                    </button>
                </form>

                <div
                    style={{
                        marginTop: '28px',
                        paddingTop: '20px',
                        borderTop: '1px solid var(--border-color)',
                        textAlign: 'center',
                        fontSize: '0.82rem',
                    }}
                >
                    <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Are you a creator or developer looking for the regular platform?
                    </div>
                    <Link
                        to="/login"
                        style={{ color: 'var(--accent-purple)', fontWeight: 600, textDecoration: 'none' }}
                    >
                        ← Return to Standard Creator Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

