import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminLogin.css';
import bannerText from './bannerText';
import { endpoints } from '../api/api';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!password.trim()) {
            setError('Please enter the admin password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(endpoints.adminLogin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem('adminAuthenticated', 'true');
                window.location.href = '/admin/panel';
            } else {
                setError(data.message || 'Invalid password');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <motion.div
                className="admin-login-box"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="admin-login__header">
                    <h1 className="admin-login__title">Admin Login</h1>
                    <p className="admin-login__subtitle">Enter your password to access the admin panel</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="admin-login__field">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            autoFocus
                            className="admin-login__input"
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="admin-login__error"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="admin-login__buttons">
                        <motion.button
                            className="btn btn--primary admin-login__btn"
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </motion.button>

                        <motion.button
                            className="btn btn--secondary admin-login__btn"
                            type="button"
                            onClick={() => (window.location.href = '/')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Back to Home
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;