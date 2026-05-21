import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import MasterView from './components/MasterView.jsx';
import DetailedView from './components/DetailedView.jsx';
import StudentForm from './components/StudentForm.jsx';
import LogInView from './components/LogInView.jsx';
import RegisterView from './components/RegisterView.jsx';
import { useStudentStore } from './store/useStudentStore.js';
import { useUserTracking } from './hooks/useUserTracking';
import { useAuthStore } from './store/useAuthStore.js';

function TopStatusBar({ themeStyles, lastActivity, isOffline, currentUser, onLogout, onToggleTheme, theme }) {
    return (
        <div style={{
            backgroundColor: '#dfffd6', color: themeStyles.textColor,
            borderBottom: `1px solid ${themeStyles.barBorder}`,
            padding: '10px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)', transition: 'all 0.3s ease', flexShrink: 0
        }}>
            <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div><strong>Ultima activitate:</strong> <span style={{ opacity: 0.8 }}>{lastActivity}</span></div>
                {isOffline && (
                    <div style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
                        📡 OFFLINE MODE
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {currentUser && (
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: themeStyles.textColor }}>
                        👤 {currentUser.username || currentUser.name} ({currentUser.role})
                        <button onClick={onLogout} style={{ marginLeft: '10px', padding: '4px 8px', borderRadius: '5px', border: 'none', backgroundColor: '#ff6b6b', color: 'white', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
                    </span>
                )}
                <button onClick={onToggleTheme} style={{
                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', border: `1px solid ${themeStyles.textColor}`,
                    backgroundColor: 'transparent', color: themeStyles.textColor, fontWeight: 'bold', fontSize: '12px'
                }}>
                    {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </div>
        </div>
    );
}

function AppContent() {
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState(null);

    const students = useStudentStore((state) => state.students);
    const fetchStudents = useStudentStore((state) => state.fetchStudents);
    const deleteStudent = useStudentStore((state) => state.deleteStudent);
    const saveStudent = useStudentStore((state) => state.saveStudent);
    const syncOfflineData = useStudentStore((state) => state.syncOfflineData);
    const initSignalR = useStudentStore((state) => state.initSignalR);

    const currentUser = useAuthStore((state) => state.currentUser);
    const logout = useAuthStore((state) => state.logout);
    const { theme, toggleTheme, lastActivity, logActivity } = useUserTracking();

    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            console.log("🌐 Conexiune restabilită!");
            setIsOffline(false);
            syncOfflineData();
        };
        const handleOffline = () => {
            console.log("❌ Conexiune pierdută!");
            setIsOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [syncOfflineData]);

    useEffect(() => {
        const initApp = async () => {
            console.log("🚀 Aplicația pornește...");
            await syncOfflineData();
            await fetchStudents();
            initSignalR();
        };
        initApp();
    }, [fetchStudents, syncOfflineData, initSignalR]);

    const themeStyles = {
        appBackground: theme === 'dark' ? '#121212' : '#dfffd6',
        textColor: theme === 'dark' ? '#e0e0e0' : '#333333',
        barBackground: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        barBorder: theme === 'dark' ? '#333' : '#ddd',
    };

    const handleDelete = async (id) => {
        const studentToDelete = students.find(s => s.id === id);
        const nume = studentToDelete ? `${studentToDelete.lastName} ${studentToDelete.firstName}` : '';
        await deleteStudent(id);
        logActivity(`A șters elevul: ${nume}`);
        navigate('/master');
    };

    const handleSave = async (data) => {
        await saveStudent(data);
        logActivity(`A salvat elevul: ${data.lastName} ${data.firstName}`);
        navigate('/master');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Găsim datele elevului logat (sau copilului părintelui logat)
    const loggedInStudentData = currentUser?.studentId
        ? students.find(s => s.id === currentUser.studentId)
        : null;

    return (
        <div style={{
            backgroundColor: themeStyles.appBackground,
            color: themeStyles.textColor,
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            margin: 0,
            padding: 0,
            overflowX: 'hidden'
        }}>
            <TopStatusBar
                themeStyles={themeStyles}
                lastActivity={lastActivity}
                isOffline={isOffline}
                currentUser={currentUser}
                onLogout={handleLogout}
                onToggleTheme={toggleTheme}
                theme={theme}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Routes>
                    <Route path="/" element={
                        currentUser ? (
                            <Navigate to={currentUser.role === 'Teacher' ? '/master' : currentUser.role === 'Student' ? '/student-dashboard' : '/parent-dashboard'} />
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                <div style={{ fontSize: '48px', marginBottom: '30px' }}>🌞</div>
                                <h1 style={{ fontWeight: 'bold', margin: '30px', color: themeStyles.textColor }}>Digital Gradebook</h1>
                                <h3 style={{ fontStyle: 'italic', opacity: 0.8, margin: '0 0 20px 0' }}>"Growing together, step by step."</h3>
                                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    <button onClick={() => navigate('/login')} style={{ padding: '10px 30px', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: '#ffda47', color: '#333' }}>Log In</button>
                                    <button onClick={() => navigate('/register')} style={{ padding: '10px 30px', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', border: `1px solid ${themeStyles.textColor}`, backgroundColor: 'transparent', color: themeStyles.textColor }}>Register</button>
                                </div>
                            </div>
                        )
                    } />
                    <Route path="/login" element={<LogInView />} />
                    <Route path="/register" element={<RegisterView />} />

                    {/* Protecție: Doar Teacher are acces la MasterView și Form */}
                    <Route path="/master" element={
                        currentUser?.role === 'Teacher' ? (
                            <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <MasterView students={students} onStudentClick={(s) => { setSelectedStudent(s); navigate('/detail'); }} onAddClick={() => { setSelectedStudent(null); navigate('/form'); }} />
                            </div>
                        ) : <Navigate to="/" />
                    } />

                    <Route path="/form" element={
                        currentUser?.role === 'Teacher' ? (
                            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                                <StudentForm initialData={selectedStudent} onSave={handleSave} onCancel={() => navigate(selectedStudent ? '/detail' : '/master')} />
                            </div>
                        ) : <Navigate to="/" />
                    } />

                    <Route path="/detail" element={
                        currentUser?.role === 'Teacher' ? (
                            <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
                                <DetailedView student={selectedStudent} onBack={() => navigate('/master')} onEdit={() => navigate('/form')} onDelete={() => handleDelete(selectedStudent.id)} />
                            </div>
                        ) : <Navigate to="/" />
                    } />

                    {/* RESTRICTED PERMISSIONS - Student și Parent văd doar propriul DetailedView */}
                    <Route path="/student-dashboard" element={
                        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Panou Elev</h2>
                            {loggedInStudentData ? (
                                <DetailedView student={loggedInStudentData} isRestricted={true} />
                            ) : <p style={{ textAlign: 'center' }}>Se încarcă datele...</p>}
                        </div>
                    } />

                    <Route path="/parent-dashboard" element={
                        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Panou Părinte</h2>
                            {loggedInStudentData ? (
                                <DetailedView student={loggedInStudentData} isRestricted={true} />
                            ) : <p style={{ textAlign: 'center' }}>Se încarcă datele...</p>}
                        </div>
                    } />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}