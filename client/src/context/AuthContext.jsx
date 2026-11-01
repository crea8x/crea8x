import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('crea8x_user');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            // Refresh user data from server
            getMe()
                .then((res) => {
                    setUser({ ...res.data, token: parsed.token });
                })
                .catch(() => {
                    localStorage.removeItem('crea8x_user');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('crea8x_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('crea8x_user');
        setUser(null);
    };

    const updateUserData = (data) => {
        const updated = { ...user, ...data };
        localStorage.setItem('crea8x_user', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
};
