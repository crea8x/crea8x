import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [openNotifs, setOpenNotifs] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const notifRef = useRef(null);
    const navRef = useRef(null);

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate('/');
    };

    const fetchNotifs = async () => {
        if (!user) return;
        try {
            const res = await getNotifications();
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifs();
        // Refresh notifications every 30 seconds
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Close notifications and mobile menu when navigating
    useEffect(() => {
        setMobileMenuOpen(false);
        setOpenNotifs(false);
    }, [location.pathname]);

    // Close notifications or menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setOpenNotifs(false);
            }
            if (navRef.current && !navRef.current.contains(e.target)) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.read) {
            try {
                await markNotificationRead(notif._id);
                setUnreadCount((prev) => Math.max(0, prev - 1));
                setNotifications((prev) =>
                    prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
                );
            } catch (err) {
                console.error(err);
            }
        }
        setOpenNotifs(false);
        setMobileMenuOpen(false);
        if (notif.project?._id || notif.project) {
            navigate(`/project/${notif.project._id || notif.project}`);
        }
    };

    const isActive = (path) => (location.pathname === path ? 'navbar-link active' : 'navbar-link');

    return (
        <nav className="navbar" ref={navRef}>
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
                    Crea<span className="logo-infinity">∞</span>X
                </Link>

                {/* Navigation Links (Desktop horizontal, Mobile slide-down drawer) */}
                <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    {user ? (
                        <>
                            <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMobileMenuOpen(false)}>
                                Dashboard
                            </Link>
                            <Link to="/explore" className={isActive('/explore')} onClick={() => setMobileMenuOpen(false)}>
                                Explore
                            </Link>
                            <Link to={`/profile/${user._id}`} className={isActive(`/profile/${user._id}`)} onClick={() => setMobileMenuOpen(false)}>
                                Profile
                            </Link>
                            <Link to="/project/new" className={isActive('/project/new')} onClick={() => setMobileMenuOpen(false)}>
                                <span className="btn btn-primary btn-sm">+ Idea</span>
                            </Link>
                            <button onClick={handleLogout} className="navbar-link" style={{ background: 'none' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/explore" className={isActive('/explore')} onClick={() => setMobileMenuOpen(false)}>
                                Explore
                            </Link>
                            <Link to="/login" className={isActive('/login')} onClick={() => setMobileMenuOpen(false)}>
                                Login
                            </Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                <span className="btn btn-primary btn-sm">Get Started</span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Navbar Controls (Notifications & Mobile Hamburger Button) */}
                <div className="navbar-controls">
                    {user && (
                        <div className="notification-container" ref={notifRef}>
                            <button
                                type="button"
                                className="notification-trigger"
                                onClick={() => setOpenNotifs(!openNotifs)}
                                title="Notifications"
                                aria-label="Notifications"
                            >
                                🔔
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                )}
                            </button>

                            {openNotifs && (
                                <div className="notification-dropdown">
                                    <div className="notification-header">
                                        <h4>Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--accent-purple)',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n._id}
                                                    className={`notification-item ${!n.read ? 'unread' : ''}`}
                                                    onClick={() => handleNotificationClick(n)}
                                                >
                                                    <div>{n.message}</div>
                                                    <div className="notification-time">
                                                        {new Date(n.createdAt).toLocaleDateString([], {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="button"
                        className="mobile-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
