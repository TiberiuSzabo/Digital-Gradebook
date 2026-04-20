import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

function RegisterView() {
    const navigate = useNavigate();
    const register = useAuthStore((state) => state.register);

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', role: 'Teacher'
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Validări generale
        if (formData.password !== formData.confirmPassword) return alert("Parolele nu se potrivesc!");
        if (!formData.name || !formData.email || !formData.password) return alert("Te rog completează toate câmpurile!");

        // 2. VALIDĂRI SPECIFICE PE ROL (Ceea ce ai cerut!)
        const emailCurent = formData.email.toLowerCase(); // Facem litere mici ca să fim siguri

        if (formData.role === 'Teacher' && !emailCurent.endsWith('@teacher.com')) {
            return alert("Eroare: Profesorii trebuie să folosească o adresă de email de tipul @teacher.com!");
        }

        if (formData.role === 'Student' && !emailCurent.endsWith('@student.com')) {
            return alert("Eroare: Elevii trebuie să folosească o adresă de email de tipul @student.com!");
        }

        if (formData.role === 'Parent' && !emailCurent.endsWith('@parent.com')) {
            return alert("Eroare: Părinții trebuie să folosească o adresă de email de tipul @parent.com!");
        }

        // 3. Salvarea efectivă
        const result = register(formData);
        if (result.success) {
            alert("Cont creat cu succes! Te poți loga.");
            navigate('/login');
        } else {
            alert(result.message); // Ex: "Emailul exista deja"
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-back-btn" onClick={() => navigate('/')}>←</div>

            <div className="auth-icon">🌞</div>
            <h1 className="auth-title">Welcome! ◡̈</h1>
            <h3 className="auth-subtitle">First step in this beautiful journey</h3>

            <form onSubmit={handleSubmit} className="auth-form">
                <div>
                    <label className="auth-label">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" className="auth-input" />
                </div>
                <div>
                    <label className="auth-label">E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={`yourName@${formData.role.toLowerCase()}.com`} className="auth-input" />
                </div>
                <div>
                    <label className="auth-label">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="********" className="auth-input" />
                </div>
                <div>
                    <label className="auth-label">Confirm password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="********" className="auth-input" />
                </div>

                <div className="auth-role-group">
                    <label><input type="radio" name="role" value="Teacher" checked={formData.role === 'Teacher'} onChange={handleChange} /> Teacher</label>
                    <label><input type="radio" name="role" value="Student" checked={formData.role === 'Student'} onChange={handleChange} /> Student</label>
                    <label><input type="radio" name="role" value="Parent" checked={formData.role === 'Parent'} onChange={handleChange} /> Parent</label>
                </div>
            </form>

            <button onClick={handleSubmit} className="auth-btn-submit">Create account</button>

            <p className="auth-footer-text">
                Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Sign in</span>
            </p>
        </div>
    );
}

export default RegisterView;