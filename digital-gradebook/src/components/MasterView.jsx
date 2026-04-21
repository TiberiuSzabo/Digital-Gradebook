// src/components/MasterView.jsx
import React, { useEffect, useState } from 'react';
import { useMasterView } from '../hooks/useMasterView';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../store/useStudentStore'; // <-- Adăugat importul pentru Store

function MasterView({ students = [], onStudentClick, onAddClick }) {
    const navigate = useNavigate();
    const [studentsState, setStudentsState] = useState(students);

    // --- CONECTARE LA BACKEND PENTRU SILVER CHALLENGE ---
    const isGeneratorRunning = useStudentStore((state) => state.isGeneratorRunning);
    const toggleGenerator = useStudentStore((state) => state.toggleGenerator);

    // --- FIX: Sincronizăm starea locală când vin datele de la server ---
    useEffect(() => {
        setStudentsState(students);
    }, [students]);

    // --- STĂRI NOI PENTRU EFECTELE "CRAZY" ---
    const [clickCount, setClickCount] = useState(0); // Câte click-uri pe soare
    const [isPartyMode, setIsPartyMode] = useState(false); // Party mode ON/OFF
    const [flippingRowId, setFlippingRowId] = useState(null); // Rândul care se rotește 3D

    const {
        currentPage,
        setCurrentPage,
        totalPages,
        activeTab,
        setActiveTab,
        sortConfig,
        handleSort,
        currentStudents,
        getEmoji,
        classAverageStr,
        classProgressStr,
        indexOfFirstStudent,
        indexOfLastStudent,
        fbDeg,
        bDeg,
        sDeg,
        fbCount,
        bCount,
        sCount,
        iCount
    } = useMasterView(studentsState);

    // small bar chart state for visual effect
    const [bars, setBars] = useState([
        { m: 'Sep', h: '90%', c: '#ffda47' },
        { m: 'Oct', h: '60%', c: '#d1d9d1' },
        { m: 'Nov', h: '40%', c: '#d1d9d1' },
        { m: 'Dec', h: '80%', c: '#ffda47' },
        { m: 'Jan', h: '50%', c: '#d1d9d1' },
        { m: 'Feb', h: '100%', c: '#ffda47' },
        { m: 'Mar', h: '70%', c: '#d1d9d1' },
        { m: 'Apr', h: '40%', c: '#d1d9d1' },
        { m: 'May', h: '80%', c: '#ffda47' }
    ]);

    // Efect vizual: Animăm graficul de bare doar când vin date noi prin WebSockets
    useEffect(() => {
        if (isGeneratorRunning) {
            setBars(prev => prev.map(bar => {
                const current = parseInt(bar.h, 10) || 50;
                const delta = Math.floor(Math.random() * 21) - 10;
                let next = current + delta;
                next = Math.max(10, Math.min(100, next));
                return { ...bar, h: `${next}%`, c: next > 70 ? '#ffda47' : '#d1d9d1' };
            }));
        }
    }, [studentsState.length, isGeneratorRunning]);

    const studentsWithProblems = studentsState.filter(s => s.grade === 'S' || s.grade === 'I');

    // --- HANDLERS PENTRU "CRAZY EFFECTS" ---

    // 1. Easter Egg: 5 Clickuri rapide pe soare declanșează Party Mode
    const handleSunClick = () => {
        setClickCount(prev => prev + 1);
        if (clickCount >= 4) {
            setIsPartyMode(!isPartyMode);
            setClickCount(0);
        }
    };

    // 2. 3D Flip Row: Rotește rândul înainte să navigheze
    const handleRowClick = (student) => {
        if (!onStudentClick) return;
        setFlippingRowId(student.id);

        // Așteptăm 400ms să se termine animația CSS (matrix flip)
        setTimeout(() => {
            onStudentClick(student);
        }, 400);
    };

    // 3. Vreme Interactivă (Live Background)
    let weatherClass = '';
    if (!isPartyMode) {
        if (classAverageStr === 'FB') weatherClass = 'weather-sunny';
        if (classAverageStr === 'I' || classAverageStr === 'S') weatherClass = 'weather-stormy';
    }

    return (
        <div className={`master-container ${isPartyMode ? 'party-mode' : ''} ${weatherClass}`} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'all 0.5s ease' }}>

            {/* header */}
            <div className="animate-enter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: isPartyMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'background-color 0.5s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div
                        className="master-title-icon"
                        onClick={handleSunClick}
                        style={{ fontSize: '40px', backgroundColor: 'white', borderRadius: '50%', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', userSelect: 'none' }}
                        title="Click me 5 times fast! 😉"
                    >
                        {isPartyMode ? '🪩' : '🌞'}
                    </div>
                    <h2 style={{ margin: 0, color: '#333' }}>Digital Gradebook - My Class</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="master-tab-group" style={{ marginRight: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={`master-tab ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>Warnings</div>
                        <div className={`master-tab ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => setActiveTab('statistics')}>Statistics</div>

                        {/* Butonul de Generator Modificat */}
                        <button
                            onClick={() => toggleGenerator(!isGeneratorRunning)}
                            title="Start/Stop Server Generator"
                            style={{ marginLeft: '6px', padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: isGeneratorRunning ? '#ff6b6b' : '#3aa76d', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                        >
                            {isGeneratorRunning ? 'Stop Generator' : 'Start Generator'}
                        </button>
                    </div>

                    <button className="btn-pulse" onClick={onAddClick} style={{ padding: '10px 20px', borderRadius: '20px', backgroundColor: '#ffda47', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#333' }}>+ New Student</button>
                    <button onClick={() => navigate('/class-weather')} style={{ padding: '10px 20px', borderRadius: '20px', backgroundColor: '#e4f0ad', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#333' }}>Class Weather</button>
                </div>
            </div>

            {/* main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '20px', alignItems: 'start' }}>

                {/* left: table */}
                <div className="animate-enter" style={{ backgroundColor: isPartyMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', overflowX: 'auto', animationDelay: '0.1s', transition: 'background-color 0.5s' }}>
                    <table className="master-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                        <thead>
                        <tr>
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', padding: '15px', textAlign: 'left', borderBottom: '2px solid #ccc', color: '#555' }}>Name {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : '↑↓'}</th>
                            <th onClick={() => handleSort('grade')} style={{ cursor: 'pointer', padding: '15px', textAlign: 'center', borderBottom: '2px solid #ccc', color: '#555' }}>Final Grade {sortConfig.key === 'grade' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : '↑↓'}</th>
                            <th style={{ padding: '15px', borderBottom: '2px solid #ccc' }}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentStudents.map((s, index) => (
                            <tr
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
                                    if (flippingRowId !== s.id) e.currentTarget.style.backgroundColor = isPartyMode ? 'rgba(255,0,255,0.3)' : '#f9f9f9';
                                }}
                                onMouseLeave={(e) => {
                                    if (flippingRowId !== s.id) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <td style={{ padding: '15px', color: '#333', fontWeight: '500' }}><span style={{ marginRight: '10px', color: '#888' }}>{indexOfFirstStudent + index + 1}.</span>{s.lastName} {s.firstName}</td>
                                <td style={{ padding: '15px', textAlign: 'center', color: '#333', fontWeight: 'bold' }}>{s.grade}</td>
                                <td style={{ padding: '15px', textAlign: 'right' }}><span style={{ fontSize: '24px' }}>{getEmoji(s.grade)}</span></td>
                            </tr>
                        ))}
                        {currentStudents.length === 0 && (<tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>No students found.</td></tr>)}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', fontSize: '14px', color: '#666', borderTop: '1px solid #ddd', paddingTop: '15px', flexWrap: 'wrap', gap: '10px' }}>
                        <span>Showing {studentsState.length > 0 ? indexOfFirstStudent + 1 : 0}-{Math.min(indexOfLastStudent, studentsState.length)} of {studentsState.length} students.</span>
                        <div style={{ display: 'flex', gap: '15px' }}><span>Avg: <strong>{classAverageStr}</strong></span><span>Progress: <strong>{classProgressStr}</strong></span></div>
                    </div>

                    <div className="master-pagination" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} style={{ border: 'none', background: 'transparent', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#ccc' : '#333', fontWeight: 'bold' }}>&lt; Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)} style={{ border: 'none', borderRadius: '5px', padding: '5px 12px', background: currentPage === page ? '#ffda47' : '#eee', color: '#333', fontWeight: 'bold', cursor: 'pointer' }}>{page}</button>
                        ))}
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} style={{ border: 'none', background: 'transparent', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#ccc' : '#333', fontWeight: 'bold' }}>Next &gt;</button>
                    </div>
                </div>

                {/* right: statistics */}
                <div className="animate-enter" style={{ backgroundColor: isPartyMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', overflowX: 'auto', animationDelay: '0.2s', transition: 'background-color 0.5s' }}>
                    {activeTab === 'statistics' ? (
                        <div className="stats-container" style={{ flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
                            <div className="stats-pie-section">
                                <h3 className="stats-pie-title" style={{ color: isPartyMode ? '#fff' : '#555' }}>Class Grades</h3>
                                <div className="stats-pie-chart" style={{ background: `conic-gradient(#ffda47 0deg ${fbDeg}deg, #ffff00 ${fbDeg}deg ${fbDeg + bDeg}deg, #ff9900 ${fbDeg + bDeg}deg ${fbDeg + bDeg + sDeg}deg, #ff0000 ${fbDeg + bDeg + sDeg}deg 360deg)` }}>
                                    <div className="stats-pie-inner">😊</div>
                                </div>
                                <div className="stats-legend">
                                    <div className="stats-legend-item"><div className="stats-legend-color" style={{ backgroundColor: '#ffda47' }}></div> = FB({Math.round((fbCount / studentsState.length) * 100) || 0}%)</div>
                                    <div className="stats-legend-item"><div className="stats-legend-color" style={{ backgroundColor: '#ffff00' }}></div> = B({Math.round((bCount / studentsState.length) * 100) || 0}%)</div>
                                    <div className="stats-legend-item"><div className="stats-legend-color" style={{ backgroundColor: '#ff9900' }}></div> = S({Math.round((sCount / studentsState.length) * 100) || 0}%)</div>
                                    <div className="stats-legend-item"><div className="stats-legend-color" style={{ backgroundColor: '#ff0000' }}></div> = I({Math.round((iCount / studentsState.length) * 100) || 0}%)</div>
                                </div>
                            </div>

                            <div className="stats-podium-section" style={{ maxWidth: '100%' }}>
                                <div className="stats-podium-row">
                                    <div className="stats-podium-place">
                                        <div className="stats-podium-number">III</div>
                                        <div className="stats-podium-emoji">😊</div>
                                        <div className="stats-podium-block third"><span className="stats-podium-name">{studentsState[2] ? `${studentsState[2].lastName} ${studentsState[2].firstName}` : ''}</span></div>
                                    </div>
                                    <div className="stats-podium-place">
                                        <div className="stats-podium-number">I</div>
                                        <div className="stats-podium-emoji">😊</div>
                                        <div className="stats-podium-block first"><span className="stats-podium-name">{studentsState[0] ? `${studentsState[0].lastName} ${studentsState[0].firstName}` : ''}</span></div>
                                    </div>
                                    <div className="stats-podium-place">
                                        <div className="stats-podium-number">II</div>
                                        <div className="stats-podium-emoji">😊</div>
                                        <div className="stats-podium-block second"><span className="stats-podium-name">{studentsState[1] ? `${studentsState[1].lastName} ${studentsState[1].firstName}` : ''}</span></div>
                                    </div>
                                </div>

                                <hr className="stats-bar-divider" />

                                <div className="stats-bar-container" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                                    {bars.map(bar => (
                                        <div key={bar.m} className="stats-bar-col">
                                            <div className="stats-bar-fill" style={{ backgroundColor: bar.c, height: bar.h, transition: 'height 0.5s ease-out, background-color 0.5s' }}></div>
                                            <div className="stats-bar-label">{bar.m}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 style={{ color: isPartyMode ? '#fff' : '#333', marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>⚠️ Students with problems</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {studentsWithProblems.length === 0 ? (
                                    <p style={{ color: '#777', fontStyle: 'italic', textAlign: 'center' }}>All students are doing great! 🎉</p>
                                ) : (
                                    studentsWithProblems.map(student => (
                                        <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: isPartyMode ? 'rgba(0,0,0,0.5)' : '#fff', padding: '15px', borderRadius: '10px', borderLeft: `5px solid ${student.grade === 'I' ? '#ff6b6b' : '#ffda47'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                            <div style={{ fontSize: '30px' }}>{getEmoji(student.grade)}</div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 5px 0', color: isPartyMode ? '#fff' : '#333' }}>{student.lastName} {student.firstName} (Nota {student.grade})</h4>
                                                <p style={{ margin: 0, fontSize: '12px', color: isPartyMode ? '#ccc' : '#666' }}>{student.mentions ? student.mentions : 'Needs a little bit of help and attention.'}</p>
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
        </div>
    );
}

export default MasterView;