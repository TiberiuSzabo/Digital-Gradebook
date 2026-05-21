// src/components/RegisterView.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

function RegisterView() {
    const navigate = useNavigate();
    const register = useAuthStore((state) => state.register);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Teacher' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Regex pentru parolă complexă
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (formData.password !== formData.confirmPassword) return alert("Parolele nu se potrivesc!");
        if (!passwordRegex.test(formData.password)) {
            return alert("Parola trebuie să conțină minim 8 caractere, o literă mare, un număr și un simbol (@$!%*?&)");
        }

        const emailLower = formData.email.toLowerCase();
        if (formData.role === 'Teacher' && !emailLower.endsWith('@teacher.com')) return alert("Eroare: Folosește @teacher.com!");
        if (formData.role === 'Student' && !emailLower.endsWith('@student.com')) return alert("Eroare: Folosește @student.com!");
        if (formData.role === 'Parent' && !emailLower.endsWith('@parent.com')) return alert("Eroare: Folosește @parent.com!");

        const result = register(formData);
        if (result.success) {
            alert("Cont creat!");
            navigate('/login');
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-back-btn" onClick={() => navigate('/')}>←</div>
            <h1 className="auth-title">Welcome!</h1>
            <form onSubmit={handleSubmit} className="auth-form">
                <input name="name" onChange={handleChange} placeholder="Name" className="auth-input" />
                <input name="email" onChange={handleChange} placeholder="Email" className="auth-input" />
                <input type="password" name="password" onChange={handleChange} placeholder="Password" className="auth-input" />
                <input type="password" name="confirmPassword" onChange={handleChange} placeholder="Confirm Password" className="auth-input" />
                <div className="auth-role-group">
                    <label><input type="radio" name="role" value="Teacher" checked={formData.role === 'Teacher'} onChange={handleChange} /> Teacher</label>
                    <label><input type="radio" name="role" value="Student" checked={formData.role === 'Student'} onChange={handleChange} /> Student</label>
                    <label><input type="radio" name="role" value="Parent" checked={formData.role === 'Parent'} onChange={handleChange} /> Parent</label>
                </div>
            </form>
            <button onClick={handleSubmit} className="auth-btn-submit">Create account</button>
        </div>
    );
}
export default RegisterView;