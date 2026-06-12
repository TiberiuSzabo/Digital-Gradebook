// src/components/RegisterView.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

function RegisterView() {
    const navigate = useNavigate();
    const register = useAuthStore((state) => state.register);
    const setupPin = useAuthStore((state) => state.setupPin);

    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Teacher' });
    const [step, setStep] = useState('register'); // 'register' | 'setup-pin'
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [pinData, setPinData] = useState({ pin: '', confirmPin: '' });
    const [pinError, setPinError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const isRealEmail = (email) => {
        const lower = email.toLowerCase();
        return lower.endsWith('@gmail.com') || lower.includes('@yahoo.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (formData.password !== formData.confirmPassword) return alert("Parolele nu se potrivesc!");
        if (!passwordRegex.test(formData.password)) {
            return alert("Parola trebuie să conțină minim 8 caractere, o literă mare, un număr și un simbol (@$!%*?&)");
        }

        const emailLower = formData.email.toLowerCase();
        if (formData.role === 'Student' && !emailLower.endsWith('@student.com')) return alert("Eroare: Folosește @student.com!");
        if (formData.role === 'Parent' && !emailLower.endsWith('@parent.com')) return alert("Eroare: Folosește @parent.com!");

        const result = await register(formData);
        if (result.success) {
            setRegisteredEmail(formData.email);
            if (isRealEmail(formData.email)) {
                setStep('setup-pin');
            } else {
                alert("Cont creat!");
                navigate('/login');
            }
        } else {
            alert(result.message);
        }
    };

    const handleSetupPin = async (e) => {
        e.preventDefault();
        setPinError('');

        if (!/^\d{4,8}$/.test(pinData.pin)) {
            return setPinError("PIN-ul trebuie să conțină între 4 și 8 cifre.");
        }
        if (pinData.pin !== pinData.confirmPin) {
            return setPinError("PIN-urile nu se potrivesc!");
        }

        const result = await setupPin(registeredEmail, pinData.pin);
        if (result.success) {
            alert("Cont creat și PIN setat cu succes! Vă puteți autentifica.");
            navigate('/login');
        } else {
            setPinError(result.message || "Eroare la setarea PIN-ului.");
        }
    };

    if (step === 'setup-pin') {
        return (
            <div className="auth-container">
                <h1 className="auth-title">Configurați PIN-ul</h1>
                <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '16px' }}>
                    Contul dvs. folosește autentificare în 3 pași. Setați un PIN de securitate (4–8 cifre).
                </p>
                <form onSubmit={handleSetupPin} className="auth-form">
                    <input
                        type="password"
                        inputMode="numeric"
                        placeholder="PIN (4–8 cifre)"
                        value={pinData.pin}
                        onChange={(e) => setPinData({ ...pinData, pin: e.target.value })}
                        className="auth-input"
                        maxLength={8}
                    />
                    <input
                        type="password"
                        inputMode="numeric"
                        placeholder="Confirmați PIN-ul"
                        value={pinData.confirmPin}
                        onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value })}
                        className="auth-input"
                        maxLength={8}
                    />
                    {pinError && <p style={{ color: 'red', fontSize: '13px', textAlign: 'center' }}>{pinError}</p>}
                </form>
                <button onClick={handleSetupPin} className="auth-btn-submit">Setează PIN</button>
            </div>
        );
    }

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