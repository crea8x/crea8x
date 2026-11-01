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
    const notifRef = useRef(null);

    const handleLogout = () => {
        logout();
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

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setOpenNotifs(false);
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
        if (notif.project?._id || notif.project) {
            navigate(`/project/${notif.project._id || notif.project}`);
        }
    };

    const isActive = (path) => (location.pathname === path ? 'navbar-link active' : 'navbar-link');

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    Crea<span className="logo-infinity">∞</span>X
                </Link>
                <div className="navbar-links">
                    {user ? (
                        <>
                            <Link to="/dashboard" className={isActive('/dashboard')}>
                                Dashboard
                            </Link>
                            <Link to="/explore" className={isActive('/explore')}>
                                Explore
                            </Link>
                            <Link to={`/profile/${user._id}`} className={isActive(`/profile/${user._id}`)}>
                                Profile
                            </Link>
                            <Link to="/project/new" className={isActive('/project/new')}>
                                <span className="btn btn-primary btn-sm">+ Idea</span>
                            </Link>

                            {/* Notifications Bell */}
                            <div className="notification-container" ref={notifRef}>
                                <button
                                    type="button"
                                    className="notification-trigger"
                                    onClick={() => setOpenNotifs(!openNotifs)}
                                    title="Notifications"
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

                            <button onClick={handleLogout} className="navbar-link" style={{ background: 'none' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={isActive('/login')}>
                                Login
                            </Link>
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
