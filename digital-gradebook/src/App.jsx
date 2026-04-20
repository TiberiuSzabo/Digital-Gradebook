import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';

// Components
import MasterView from './components/MasterView.jsx';
import DetailedView from './components/DetailedView.jsx';
import StudentForm from './components/StudentForm.jsx';
import LogInView from './components/LogInView.jsx';
import RegisterView from './components/RegisterView.jsx';

// Stores & Hooks
import { useStudentStore } from './store/useStudentStore.js';
import { useUserTracking } from './hooks/useUserTracking';
import { useAuthStore } from './store/useAuthStore.js';

function AppContent() {
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Student Store Actions
    const students = useStudentStore((state) => state.students);
    const fetchStudents = useStudentStore((state) => state.fetchStudents);
    const deleteStudent = useStudentStore((state) => state.deleteStudent);
    const saveStudent = useStudentStore((state) => state.saveStudent);

    // Auth Store
    const currentUser = useAuthStore((state) => state.currentUser);
    const logout = useAuthStore((state) => state.logout);

    // Tracking & Theme
    const { theme, toggleTheme, lastActivity, logActivity } = useUserTracking();

    // Fetch initial data from server on mount
    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const themeStyles = {
        appBackground: theme === 'dark' ? '#121212' : '#dfffd6',
        textColor: theme === 'dark' ? '#e0e0e0' : '#333333',
        barBackground: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        barBorder: theme === 'dark' ? '#333' : '#ddd',
    };

    const commonButtonStyle = {
        padding: '10px 30px', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold',
        cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: 'none',
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

    const TopStatusBar = () => (
        <div style={{
            backgroundColor: '#dfffd6', color: themeStyles.textColor,
            borderBottom: `1px solid ${themeStyles.barBorder}`,
            padding: '10px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)', transition: 'all 0.3s ease',
            flexShrink: 0
        }}>
            <div style={{ fontSize: '14px' }}>
                <strong>Ultima activitate:</strong> <span style={{ opacity: 0.8 }}>{lastActivity}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {currentUser && (
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: themeStyles.textColor }}>
                        👤 {currentUser.name} ({currentUser.role})
                        <button onClick={handleLogout} style={{ marginLeft: '10px', padding: '4px 8px', borderRadius: '5px', border: 'none', backgroundColor: '#ff6b6b', color: 'white', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
                    </span>
                )}
                <button onClick={toggleTheme} style={{
                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', border: `1px solid ${themeStyles.textColor}`,
                    backgroundColor: 'transparent', color: themeStyles.textColor, fontWeight: 'bold', transition: 'all 0.3s ease', fontSize: '12px'
                }}>
                    {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: themeStyles.appBackground, color: themeStyles.textColor, height: '100vh', width: '99.9vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
            <TopStatusBar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
                <Routes>
                    <Route path="/" element={
                        currentUser ? (
                            <Navigate to={
                                currentUser.role === 'Teacher' ? '/master' :
                                    currentUser.role === 'Student' ? '/student-dashboard' : '/parent-dashboard'
                            } />
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                <div style={{ fontSize: '48px', marginBottom: '30px' }}>🌞</div>
                                <h1 style={{ fontWeight: 'bold', margin: '30px' , color : themeStyles.textColor }}>Digital Gradebook</h1>
                                <h3 style={{ fontStyle: 'italic', opacity: 0.8, margin: '0 0 20px 0' }}>"Growing together, step by step."</h3>
                                <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255, 255, 255, 0.4)', padding: '20px', borderRadius: '15px' }}>
                                    <p style={{ fontSize: '18px', lineHeight: '1.6', margin: 0 }}>A friendly space where teachers, students, and parents connect to celebrate everyday progress and easily keep track of classroom adventures.</p>
                                </div>
                                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    <button onClick={() => navigate('/login')} style={{ ...commonButtonStyle, backgroundColor: '#ffda47', color: '#333' }}>Log In</button>
                                    <button onClick={() => navigate('/register')} style={{ ...commonButtonStyle, backgroundColor: 'transparent', color: themeStyles.textColor, border: `1px solid ${themeStyles.textColor}` }}>Register</button>
                                </div>
                            </div>
                        )
                    } />

                    <Route path="/login" element={<LogInView />} />
                    <Route path="/register" element={<RegisterView />} />

                    <Route path="/master" element={
                        <div style={{ width: '100%', maxWidth: '1400px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <MasterView
                                students={students}
                                onStudentClick={(s) => { setSelectedStudent(s); navigate('/detail'); }}
                                onAddClick={() => { setSelectedStudent(null); navigate('/form'); }}
                            />
                        </div>
                    } />

                    <Route path="/form" element={
                        <div style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
                            <StudentForm
                                initialData={selectedStudent}
                                onSave={handleSave}
                                onCancel={() => navigate(selectedStudent ? '/detail' : '/master')}
                            />
                        </div>
                    } />

                    <Route path="/detail" element={
                        <div style={{ width: '100%', maxWidth: '900px', padding: '20px' }}>
                            <DetailedView
                                student={selectedStudent}
                                onBack={() => navigate('/master')}
                                onEdit={() => navigate('/form')}
                                onDelete={() => handleDelete(selectedStudent.id)}
                            />
                        </div>
                    } />

                    <Route path="/student-dashboard" element={<div style={{padding: '50px', textAlign: 'center'}}><h2>Student Dashboard - Urmează să fie implementat 🛠️</h2></div>} />
                    <Route path="/parent-dashboard" element={<div style={{padding: '50px', textAlign: 'center'}}><h2>Parent Dashboard - Urmează să fie implementat 🛠️</h2></div>} />

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