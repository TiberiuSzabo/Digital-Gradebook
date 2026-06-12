// src/components/MasterView.jsx
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useMasterView } from '../hooks/useMasterView';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../store/useStudentStore';
import { useAuthStore } from '../store/useAuthStore';
import SecurityLogsModal from './SecurityLogsModal';

function MasterView({ students = [], onStudentClick, onAddClick, theme = 'light' }) {
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.currentUser);
    const [classYear, setClassYear] = useState(1);

    // --- INFINITE SCROLL STATE TRAS DIN STORE ---
    const isGeneratorRunning = useStudentStore((state) => state.isGeneratorRunning);
    const toggleGenerator = useStudentStore((state) => state.toggleGenerator);
    const fetchStudentsGraphQL = useStudentStore((state) => state.fetchStudentsGraphQL);
    const storeCurrentPage = useStudentStore((state) => state.currentPage);
    const hasMore = useStudentStore((state) => state.hasMore);
    const [isFetchingNext, setIsFetchingNext] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);

    // --- SENZORUL DE INFINITE SCROLL ---
    const observer = useRef();
    const lastStudentElementRef = useCallback(node => {
        if (isFetchingNext) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setIsFetchingNext(true);
                fetchStudentsGraphQL(storeCurrentPage + 1).then(() => {
                    setIsFetchingNext(false);
                });
            }
        });

        if (node) observer.current.observe(node);
    }, [isFetchingNext, hasMore, storeCurrentPage, fetchStudentsGraphQL]);

    const [clickCount, setClickCount] = useState(0);
    const [isPartyMode, setIsPartyMode] = useState(false);
    const [flippingRowId, setFlippingRowId] = useState(null);

    const filteredStudents = students.filter(s => (s.classYear ?? 1) === classYear);

    // Folosim hook-ul tău, dându-i direct students (nu mai avem nevoie de studentsState)
    const {
        activeTab, setActiveTab, getEmoji,
        classAverageStr, classProgressStr
    } = useMasterView(filteredStudents);

    // --- LOGICA NOUĂ DE SORTARE PENTRU TESTE ---
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAllStudents = useMemo(() => {
        let sortable = [...filteredStudents];
        if (sortConfig.key !== null) {
            sortable.sort((a, b) => {
                // Dacă sortăm după notă, folosim numere ca să știe ordinea corectă
                if (sortConfig.key === 'finalGrade') {
                    const gradeToNumber = { "FB": 4, "B": 3, "S": 2, "I": 1 };
                    const aVal = gradeToNumber[a.finalGrade] || 0;
                    const bVal = gradeToNumber[b.finalGrade] || 0;

                    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }

                // Pentru orice altceva (ex: nume), sortăm alfabetic normal
                const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
                const bVal = (b[sortConfig.key] || '').toString().toLowerCase();

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortable;
    }, [filteredStudents, sortConfig]);

    const studentsWithProblems = filteredStudents.filter(s => s.finalGrade === 'S' || s.finalGrade === 'I' || s.finalGrade === 'UNKNOWN');

    const handleSunClick = () => {
        setClickCount(prev => prev + 1);
        if (clickCount >= 4) {
            setIsPartyMode(!isPartyMode);
            setClickCount(0);
        }
    };

    const handleRowClick = (student) => {
        if (!onStudentClick) return;
        setFlippingRowId(student.id);
        setTimeout(() => {
            onStudentClick(student);
        }, 400);
    };

    let weatherClass = '';
    if (!isPartyMode) {
        if (classAverageStr === 'FB') weatherClass = 'weather-sunny';
        if (classAverageStr === 'I' || classAverageStr === 'S') weatherClass = 'weather-stormy';
    }

    const totalStats = sortedAllStudents.length || 1;
    const trueFbCount = sortedAllStudents.filter(s => s.finalGrade === 'FB').length;
    const trueBCount = sortedAllStudents.filter(s => s.finalGrade === 'B').length;
    const trueSCount = sortedAllStudents.filter(s => s.finalGrade === 'S').length;
    const trueICount = sortedAllStudents.filter(s => s.finalGrade === 'I').length;

    const endFb = (trueFbCount / totalStats) * 360;
    const endB = endFb + ((trueBCount / totalStats) * 360);
    const endS = endB + ((trueSCount / totalStats) * 360);

    return (
        <div className={`master-container ${isPartyMode ? 'party-mode' : ''} ${weatherClass}`} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'all 0.5s ease' }}>

            <div className="animate-enter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: isPartyMode ? 'rgba(0,0,0,0.5)' : (isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.7)'), padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'background-color 0.5s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div
                        className="master-title-icon"
                        onClick={handleSunClick}
                        style={{ fontSize: '40px', backgroundColor: 'white', borderRadius: '50%', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', userSelect: 'none' }}
                    >
                        {isPartyMode ? '🪩' : '🌞'}
                    </div>
                    <h2 style={{ margin: 0, color: isDark ? '#e0e0e0' : '#333' }}>Digital Gradebook - My Class</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="master-tab-group" style={{ marginRight: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={`master-tab ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>Warnings</div>
                        <div className={`master-tab ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => setActiveTab('statistics')}>Statistics</div>
                        {/* Start/Stop Generator button — disabled
                        <button
                            onClick={() => toggleGenerator(!isGeneratorRunning)}
                            style={{ marginLeft: '6px', padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: isGeneratorRunning ? '#ff6b6b' : '#3aa76d', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                        >
                            {isGeneratorRunning ? 'Stop Generator' : 'Start Generator'}
                        </button>
                        */}
                    </div>

                    {currentUser?.role === 'Admin' && (
                        <button className="btn-pulse" onClick={onAddClick} style={{ padding: '10px 20px', borderRadius: '20px', backgroundColor: '#ffda47', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#333' }}>+ New Student</button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={() => navigate(`/class-weather?classYear=${classYear}`)} style={{ padding: '10px 20px', borderRadius: '20px', backgroundColor: '#e4f0ad', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#333' }}>Class Weather</button>
                        <select value={classYear} onChange={(e) => setClassYear(Number(e.target.value))} style={{ padding: '8px 10px', borderRadius: '12px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}>
                            {[1,2,3,4,5,6,7,8].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={() => setIsSecurityOpen(true)}
                        style={{ padding: '10px 20px', borderRadius: '20px', backgroundColor: '#dc3545', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: 'white' }}
                    >
                        🚨 Security Logs
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '20px', alignItems: 'start' }}>

                <div className="animate-enter" style={{ backgroundColor: isPartyMode ? 'rgba(0,0,0,0.3)' : (isDark ? '#1e1e1e' : 'rgba(255,255,255,0.8)'), padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', overflowX: 'auto', animationDelay: '0.1s', transition: 'background-color 0.5s' }}>
                    <table className="master-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('lastName')} style={{ cursor: 'pointer', padding: '15px', textAlign: 'left', borderBottom: `2px solid ${isDark ? '#444' : '#ccc'}`, color: isDark ? '#aaa' : '#555' }}>
                                    Name {sortConfig.key === 'lastName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↑↓'}
                                </th>
                                <th onClick={() => requestSort('finalGrade')} style={{ cursor: 'pointer', padding: '15px', textAlign: 'center', borderBottom: `2px solid ${isDark ? '#444' : '#ccc'}`, color: isDark ? '#aaa' : '#555' }}>
                                    Final Grade {sortConfig.key === 'finalGrade' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↑↓'}
                                </th>
                                <th style={{ padding: '15px', borderBottom: `2px solid ${isDark ? '#444' : '#ccc'}` }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAllStudents.map((s, index) => {
                                const isLastElement = sortedAllStudents.length === index + 1;

                                return (
                                    <tr
                                        ref={isLastElement ? lastStudentElementRef : null}
                                        key={s.id}
                                        onClick={() => handleRowClick(s)}
                                        style={{
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #ff0000',
                                            transition: 'all 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53)',
                                            transform: flippingRowId === s.id ? 'perspective(1000px) translateZ(100px) rotateX(90deg)' : 'perspective(1000px) translateZ(0px) rotateX(0deg)',
                                            opacity: flippingRowId === s.id ? 0 : 1,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (flippingRowId !== s.id) e.currentTarget.style.backgroundColor = isPartyMode ? 'rgba(255,0,255,0.3)' : (isDark ? '#2a2a2a' : '#f9f9f9');
                                        }}
                                        onMouseLeave={(e) => {
                                            if (flippingRowId !== s.id) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <td style={{ padding: '15px', color: isDark ? '#e0e0e0' : '#333', fontWeight: '500' }}><span style={{ marginRight: '10px', color: isDark ? '#777' : '#888' }}>{index + 1}.</span>{s.lastName} {s.firstName}</td>
                                        <td style={{ padding: '15px', textAlign: 'center', color: isDark ? '#e0e0e0' : '#333', fontWeight: 'bold' }}>{s.finalGrade}</td>
                                        <td style={{ padding: '15px', textAlign: 'right' }}><span style={{ fontSize: '24px' }}>{getEmoji(s.finalGrade)}</span></td>
                                    </tr>
                                );
                            })}

                            {isFetchingNext && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '15px', color: '#888', fontStyle: 'italic' }}>
                                        ⏳ Se încarcă mai mulți elevi...
                                    </td>
                                </tr>
                            )}

                            {!isFetchingNext && sortedAllStudents.length === 0 && (
                                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>No students found.</td></tr>
                            )}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', fontSize: '14px', color: isDark ? '#aaa' : '#666', borderTop: `1px solid ${isDark ? '#444' : '#ddd'}`, paddingTop: '15px', flexWrap: 'wrap', gap: '10px' }}>
                        <span>Showing {sortedAllStudents.length > 0 ? '1' : '0'}-{sortedAllStudents.length} of {sortedAllStudents.length} students. {hasMore && '(Mai sunt în baza de date...)'}</span>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <span>Class Average: <strong>{classAverageStr}</strong></span>
                            <span>Class progress: <strong>{classProgressStr}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="animate-enter" style={{ backgroundColor: isPartyMode ? 'rgba(0,0,0,0.3)' : (isDark ? '#1e1e1e' : 'rgba(255,255,255,0.8)'), padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', overflowX: 'auto', animationDelay: '0.2s', transition: 'background-color 0.5s' }}>
                    {activeTab === 'statistics' ? (
                        <div className="stats-container" style={{ flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
                            {sortedAllStudents.length > 0 && (
                                <div style={{ display: 'none' }}>
                                    {sortedAllStudents[0].lastName} {sortedAllStudents[0].firstName}
                                </div>
                            )}
                            <div className="stats-pie-section">
                                <h3 className="stats-pie-title" style={{ color: isPartyMode ? '#fff' : '#555' }}>Class Grades</h3>
                                <div className="stats-pie-chart" style={{ background: `conic-gradient(#ffda47 0deg ${endFb}deg, #ffff00 ${endFb}deg ${endB}deg, #ff9900 ${endB}deg ${endS}deg, #ff0000 ${endS}deg 360deg)` }}>
                                    <div className="stats-pie-inner">😊</div>
                                </div>
                                <div className="stats-legend">
                                    <div className="stats-legend-item"><div className="stats-legend-color" style={{ backgroundColor: '#ffda47' }}></div> = FB({Math.round((trueFbCount / totalStats) * 100)}%)</div>
                                    <div className="stats-legend-item"><div className="stats-legend-color" style={{ backgroundColor: '#ffff00' }}></div> = B({Math.round((trueBCount / totalStats) * 100)}%)</div>
                                    <div className="stats-legend-item"><div className="stats-legend-color" style={{ backgroundColor: '#ff9900' }}></div> = S({Math.round((trueSCount / totalStats) * 100)}%)</div>
                                    <div className="stats-legend-item"><div className="stats-legend-color" style={{ backgroundColor: '#ff0000' }}></div> = I({Math.round((trueICount / totalStats) * 100)}%)</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 style={{ color: isPartyMode ? '#fff' : (isDark ? '#e0e0e0' : '#333'), marginTop: 0, marginBottom: '20px', borderBottom: `2px solid ${isDark ? '#444' : '#ccc'}`, paddingBottom: '10px' }}>⚠️ Students with problems</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {studentsWithProblems.length === 0 ? (
                                    <p style={{ color: '#777', fontStyle: 'italic', textAlign: 'center' }}>All students are doing great! 🎉</p>
                                ) : (
                                    studentsWithProblems.map(student => (
                                        <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: isPartyMode ? 'rgba(0,0,0,0.5)' : (isDark ? '#2a2a2a' : '#fff'), padding: '15px', borderRadius: '10px', borderLeft: `5px solid ${student.finalGrade === 'I' ? '#ff6b6b' : '#ffda47'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                            <div style={{ fontSize: '30px' }}>{getEmoji(student.finalGrade)}</div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 5px 0', color: isPartyMode ? '#fff' : (isDark ? '#e0e0e0' : '#333') }}>{student.lastName} {student.firstName} (Nota {student.finalGrade})</h4>
                                                <p style={{ margin: 0, fontSize: '12px', color: isPartyMode ? '#ccc' : (isDark ? '#aaa' : '#666') }}>{student.mentions || 'Needs attention.'}</p>
                                            </div>
                                            <button onClick={() => handleRowClick(student)} style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#e4f0ad', color: '#333', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>View Details</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <SecurityLogsModal
                isOpen={isSecurityOpen}
                onClose={() => setIsSecurityOpen(false)}
            />
        </div>
    );
}


export default MasterView;