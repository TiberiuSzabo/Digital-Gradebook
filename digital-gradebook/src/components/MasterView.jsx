// src/components/MasterView.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useMasterView } from '../hooks/useMasterView';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../store/useStudentStore';

function MasterView({ students = [], onStudentClick, onAddClick }) {
    const navigate = useNavigate();
    const [studentsState, setStudentsState] = useState(students);

    // --- INFINITE SCROLL STATE TRAS DIN STORE ---
    const isGeneratorRunning = useStudentStore((state) => state.isGeneratorRunning);
    const toggleGenerator = useStudentStore((state) => state.toggleGenerator);
    const fetchStudentsGraphQL = useStudentStore((state) => state.fetchStudentsGraphQL);
    const storeCurrentPage = useStudentStore((state) => state.currentPage);
    const hasMore = useStudentStore((state) => state.hasMore);
    const [isFetchingNext, setIsFetchingNext] = useState(false);

    useEffect(() => {
        setStudentsState(students);
    }, [students]);

    // --- SENZORUL DE INFINITE SCROLL (INTERSECTION OBSERVER) ---
    const observer = useRef();
    const lastStudentElementRef = useCallback(node => {
        if (isFetchingNext) return; // Dacă deja caută, nu mai face spam
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            // Dacă ultimul element este vizibil pe ecran și mai avem pagini
            if (entries[0].isIntersecting && hasMore) {
                setIsFetchingNext(true);
                // Cerem pagina următoare
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

    // Păstrăm useMasterView pentru statistici și sortare, dar ocolim paginarea lui locală
    const {
        activeTab, setActiveTab, sortConfig, handleSort, getEmoji,
        classAverageStr, classProgressStr, fbDeg, bDeg, sDeg, fbCount, bCount, sCount, iCount
    } = useMasterView(studentsState);

    // --- APLICĂM SORTAREA PE TOATĂ LISTA (nu doar pe o pagină tăiată) ---
    const sortedAllStudents = React.useMemo(() => {
        let sortable = [...studentsState];
        if (sortConfig && sortConfig.key) {
            sortable.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortable;
    }, [studentsState, sortConfig]);

    const [bars, setBars] = useState([
        { m: 'Sep', h: '90%', c: '#ffda47' }, { m: 'Oct', h: '60%', c: '#d1d9d1' },
        { m: 'Nov', h: '40%', c: '#d1d9d1' }, { m: 'Dec', h: '80%', c: '#ffda47' },
        { m: 'Jan', h: '50%', c: '#d1d9d1' }, { m: 'Feb', h: '100%', c: '#ffda47' },
        { m: 'Mar', h: '70%', c: '#d1d9d1' }, { m: 'Apr', h: '40%', c: '#d1d9d1' },
        { m: 'May', h: '80%', c: '#ffda47' }
    ]);

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

    const studentsWithProblems = studentsState.filter(s => s.finalGrade === 'S' || s.finalGrade === 'I');

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

    // --- FIX PENTRU PIE CHART ---
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

            {/* header */}
            <div className="animate-enter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: isPartyMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'background-color 0.5s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div
                        className="master-title-icon"
                        onClick={handleSunClick}
                        style={{ fontSize: '40px', backgroundColor: 'white', borderRadius: '50%', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', userSelect: 'none' }}
                    >
                        {isPartyMode ? '🪩' : '🌞'}
                    </div>
                    <h2 style={{ margin: 0, color: '#333' }}>Digital Gradebook - My Class</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="master-tab-group" style={{ marginRight: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={`master-tab ${activeTab === 'table' ? 'active' : ''}`} onClick={() => setActiveTab('table')}>Warnings</div>
                        <div className={`master-tab ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => setActiveTab('statistics')}>Statistics</div>
                        <button
                            onClick={() => toggleGenerator(!isGeneratorRunning)}
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
                            <th onClick={() => handleSort('finalGrade')} style={{ cursor: 'pointer', padding: '15px', textAlign: 'center', borderBottom: '2px solid #ccc', color: '#555' }}>Final Grade {sortConfig.key === 'finalGrade' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : '↑↓'}</th>
                            <th style={{ padding: '15px', borderBottom: '2px solid #ccc' }}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedAllStudents.map((s, index) => {
                            // AICI MONTĂM SENZORUL PE ULTIMUL RÂND DIN TABEL
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
                                        if (flippingRowId !== s.id) e.currentTarget.style.backgroundColor = isPartyMode ? 'rgba(255,0,255,0.3)' : '#f9f9f9';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (flippingRowId !== s.id) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <td style={{ padding: '15px', color: '#333', fontWeight: '500' }}><span style={{ marginRight: '10px', color: '#888' }}>{index + 1}.</span>{s.lastName} {s.firstName}</td>
                                    <td style={{ padding: '15px', textAlign: 'center', color: '#333', fontWeight: 'bold' }}>{s.finalGrade}</td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}><span style={{ fontSize: '24px' }}>{getEmoji(s.finalGrade)}</span></td>
                                </tr>
                            );
                        })}

                        {/* Mesaj de loading în timp ce aduce paginile noi */}
                        {isFetchingNext && (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '15px', color: '#888', fontStyle: 'italic' }}>
                                    ⏳ Se încarcă mai mulți elevi...
                                </td>
                            </tr>
                        )}

                        {!isFetchingNext && sortedAllStudents.length === 0 && (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>Nu am găsit niciun elev.</td></tr>
                        )}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', fontSize: '14px', color: '#666', borderTop: '1px solid #ddd', paddingTop: '15px', flexWrap: 'wrap', gap: '10px' }}>
                        <span>Afișăm toți cei {sortedAllStudents.length} elevi încărcați. {hasMore && '(Mai sunt în baza de date...)'}</span>
                        <div style={{ display: 'flex', gap: '15px' }}><span>Avg: <strong>{classAverageStr}</strong></span><span>Progress: <strong>{classProgressStr}</strong></span></div>
                    </div>
                </div>

                {/* right: statistics */}
                <div className="animate-enter" style={{ backgroundColor: isPartyMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', overflowX: 'auto', animationDelay: '0.2s', transition: 'background-color 0.5s' }}>
                    {activeTab === 'statistics' ? (
                        <div className="stats-container" style={{ flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
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
                            <h3 style={{ color: isPartyMode ? '#fff' : '#333', marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>⚠️ Students with problems</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {studentsWithProblems.length === 0 ? (
                                    <p style={{ color: '#777', fontStyle: 'italic', textAlign: 'center' }}>All students are doing great! 🎉</p>
                                ) : (
                                    studentsWithProblems.map(student => (
                                        <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: isPartyMode ? 'rgba(0,0,0,0.5)' : '#fff', padding: '15px', borderRadius: '10px', borderLeft: `5px solid ${student.finalGrade === 'I' ? '#ff6b6b' : '#ffda47'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                            <div style={{ fontSize: '30px' }}>{getEmoji(student.finalGrade)}</div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 5px 0', color: isPartyMode ? '#fff' : '#333' }}>{student.lastName} {student.firstName} (Nota {student.finalGrade})</h4>
                                                <p style={{ margin: 0, fontSize: '12px', color: isPartyMode ? '#ccc' : '#666' }}>{student.mentions || 'Needs attention.'}</p>
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