import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div>
                <h1 style={{ fontSize: '6rem', fontWeight: 900, background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
                    404
                </h1>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Page Not Found</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/" className="btn btn-primary">← Back to Home</Link>
            </div>
        </div>
    );
};

export default NotFound;
