import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">Crea<span className="logo-infinity">∞</span>X</Link>
                <div className="navbar-links">
                    {user ? (
                        <>
                            <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                            <Link to="/explore" className={isActive('/explore')}>Explore</Link>
                            <Link to={`/profile/${user._id}`} className={isActive(`/profile/${user._id}`)}>Profile</Link>
                            <Link to="/project/new" className={isActive('/project/new')}>
                                <span className="btn btn-primary btn-sm">+ Project</span>
                            </Link>
                            <button onClick={handleLogout} className="navbar-link" style={{ background: 'none' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={isActive('/login')}>Login</Link>
                            <Link to="/register">
                                <span className="btn btn-primary btn-sm">Get Started</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
