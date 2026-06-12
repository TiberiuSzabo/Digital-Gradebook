import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

function LogInView() {
    const navigate = useNavigate();
    const { login, verify2FA, verifyPin, forgotPassword, resetPassword, setupPin } = useAuthStore();

    const [step, setStep] = useState('login');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code2fa, setCode2fa] = useState('');
    const [pin3fa, setPin3fa] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [pinSetupError, setPinSetupError] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);

        if (result.success) {
            if (result.requires3FA) {
                setStep('2fa');
            } else {
                if (result.role === 'Teacher') navigate('/master');
                else if (result.role === 'Student') navigate('/student-dashboard');
                else if (result.role === 'Parent') navigate('/parent-dashboard');
            }
        } else {
            alert(result.message);
        }
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        const result = await verify2FA(email, code2fa);
        if (result.success) {
            if (result.requiresPin) {
                setStep('pin');
            }
        } else {
            alert(result.message);
        }
    };

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        const result = await verifyPin(email, pin3fa);
        if (result.success) {
            if (result.requiresPinSetup) {
                setStep('setup-pin');
            } else {
                if (result.role === 'Teacher') navigate('/master');
                else if (result.role === 'Student') navigate('/student-dashboard');
                else if (result.role === 'Parent') navigate('/parent-dashboard');
            }
        } else {
            alert(result.message);
        }
    };

    const handlePinSetupSubmit = async (e) => {
        e.preventDefault();
        setPinSetupError('');
        if (!/^\d{4,8}$/.test(newPin)) return setPinSetupError("PIN-ul trebuie să conțină între 4 și 8 cifre.");
        if (newPin !== confirmNewPin) return setPinSetupError("PIN-urile nu se potrivesc!");

        const result = await setupPin(email, newPin);
        if (result.success) {
            alert("PIN setat! Introduceți PIN-ul pentru a finaliza autentificarea.");
            setPin3fa(newPin);
            setStep('pin');
        } else {
            setPinSetupError(result.message || "Eroare la setarea PIN-ului.");
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        const result = await forgotPassword(email);
        alert(result.message);
        setStep('reset');
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        const result = await resetPassword(email, resetToken, newPassword);
        alert(result.message);
        if (result.success) {
            setPassword('');
            setStep('login');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-back-btn" onClick={() => navigate('/')}>←</div>
            <div className="auth-icon">🌞</div>

            {step === 'login' && (
                <>
                    <h1 className="auth-title">Welcome Back</h1>
                    <h3 className="auth-subtitle">Log in to your digital gradebook</h3>
                    <form onSubmit={handleLoginSubmit} className="auth-form">
                        <div>
                            <label className="auth-label">E-mail</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourName@dgb.ro" className="auth-input" />
                        </div>
                        <div>
                            <label className="auth-label">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className="auth-input" />
                        </div>
                    </form>
                    <button onClick={handleLoginSubmit} className="auth-btn-submit">Sign In</button>

                    <p className="auth-footer-text">
                        Forgot password? <span className="auth-link" onClick={() => setStep('forgot')}>Reset it here</span>
                    </p>
                </>
            )}

            {step === '2fa' && (
                <>
                    <h1 className="auth-title" style={{color: '#dc3545'}}>Pasul 2: Cod 2FA 📧</h1>
                    <h3 className="auth-subtitle">Verifica casuta de email pentru codul primit</h3>
                    <form onSubmit={handle2FASubmit} className="auth-form">
                        <div>
                            <label className="auth-label">Cod de securitate</label>
                            <input type="text" value={code2fa} onChange={(e) => setCode2fa(e.target.value)} placeholder="123456" className="auth-input" />
                        </div>
                    </form>
                    <button onClick={handle2FASubmit} className="auth-btn-submit">Urmatorul Pas →</button>
                </>
            )}

            {step === 'pin' && (
                <>
                    <h1 className="auth-title" style={{color: '#28a745'}}>Pasul 3: PIN Securitate 🔑</h1>
                    <h3 className="auth-subtitle">Introduceti PIN-ul de securitate configurat la crearea contului</h3>
                    <form onSubmit={handlePinSubmit} className="auth-form">
                        <div>
                            <label className="auth-label">PIN Securitate (3FA)</label>
                            <input type="password" value={pin3fa} onChange={(e) => setPin3fa(e.target.value)} placeholder="****" maxLength={4} className="auth-input" style={{textAlign: 'center', fontSize: '24px', letterSpacing: '10px'}} />
                        </div>
                    </form>
                    <button onClick={handlePinSubmit} className="auth-btn-submit">Finalizeaza Autentificarea</button>
                </>
            )}

            {step === 'setup-pin' && (
                <>
                    <h1 className="auth-title" style={{color: '#fd7e14'}}>Configurați PIN-ul 🔐</h1>
                    <h3 className="auth-subtitle">Primul dvs. login necesită setarea unui PIN de securitate</h3>
                    <form onSubmit={handlePinSetupSubmit} className="auth-form">
                        <div>
                            <label className="auth-label">PIN nou (4–8 cifre)</label>
                            <input type="password" inputMode="numeric" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="****" maxLength={8} className="auth-input" style={{textAlign: 'center', fontSize: '24px', letterSpacing: '10px'}} />
                        </div>
                        <div>
                            <label className="auth-label">Confirmați PIN-ul</label>
                            <input type="password" inputMode="numeric" value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value)} placeholder="****" maxLength={8} className="auth-input" style={{textAlign: 'center', fontSize: '24px', letterSpacing: '10px'}} />
                        </div>
                        {pinSetupError && <p style={{color: 'red', fontSize: '13px', textAlign: 'center'}}>{pinSetupError}</p>}
                    </form>
                    <button onClick={handlePinSetupSubmit} className="auth-btn-submit">Salvează PIN și Continuă</button>
                </>
            )}

            {step === 'forgot' && (
                <>
                    <h1 className="auth-title">Recuperare Parola</h1>
                    <h3 className="auth-subtitle">Introdu emailul contului</h3>
                    <form onSubmit={handleForgotSubmit} className="auth-form">
                        <div>
                            <label className="auth-label">E-mail cont</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourName@dgb.ro" className="auth-input" />
                        </div>
                    </form>
                    <button onClick={handleForgotSubmit} className="auth-btn-submit">Trimite Token</button>
                </>
            )}

            {step === 'reset' && (
                <>
                    <h1 className="auth-title">Setati Noua Parola</h1>
                    <form onSubmit={handleResetSubmit} className="auth-form">
                        <div>
                            <label className="auth-label">Token de Resetare</label>
                            <input type="text" value={resetToken} onChange={(e) => setResetToken(e.target.value)} placeholder="Token" className="auth-input" />
                        </div>
                        <div>
                            <label className="auth-label">Parola Noua</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="********" className="auth-input" />
                        </div>
                    </form>
                    <button onClick={handleResetSubmit} className="auth-btn-submit">Salveaza Parola</button>
                </>
            )}
        </div>
    );
}

export default LogInView;