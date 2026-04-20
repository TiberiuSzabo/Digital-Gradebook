import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

function LogInView() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = login(email, password);

        if (result.success) {
            if (result.role === 'Teacher') navigate('/master');
            else if (result.role === 'Student') navigate('/student-dashboard');
            else if (result.role === 'Parent') navigate('/parent-dashboard');
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-back-btn" onClick={() => navigate('/')}>←</div>

            <div className="auth-icon">🌞</div>
            <h1 className="auth-title">Welcome Back</h1>
            <h3 className="auth-subtitle">Log in to your digital gradebook</h3>

            <form onSubmit={handleSubmit} className="auth-form">
                <div>
                    <label className="auth-label">E-mail</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourName@dgb.ro" className="auth-input" />
                </div>
                <div>
                    <label className="auth-label">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className="auth-input" />
                </div>
            </form>

            <button onClick={handleSubmit} className="auth-btn-submit">Sign In</button>

            <p className="auth-footer-text">
                Don't have an account? <span className="auth-link" onClick={() => navigate('/register')}>Create one</span>
            </p>
        </div>
    );
}

export default LogInView;