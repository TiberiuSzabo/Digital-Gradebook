// src/components/DetailedView.jsx
import React from 'react';

import { useStudentStore } from '../store/useStudentStore';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function DetailedView({ student: initialStudent, onBack, onEdit, onDelete }) {
    // 1. Hook-urile de Store se pun mereu la începutul funcției, o singură dată
    const students = useStudentStore(state => state.students);
// Căutăm studentul în lista din store. De fiecare dată când store-ul se schimbă,
// 'find' va returna obiectul nou cu notele noi, iar React va redesena totul.

    // 2. Căutăm studentul proaspăt (Folosim ID-ul din prop-ul redenumit initialStudent)
    const student = students.find(s => String(s.id) === String(initialStudent?.id)) || initialStudent;    const addGradeToStudent = useStudentStore(state => state.addGradeToStudent);

    // 3. State pentru formularul de note
    const [newGrade, setNewGrade] = React.useState({ subject: 'Math', value: 'FB' });

    if (!student) return null;

    const getEmoji = (grade) => {
        const currentGrade = student.finalGrade || grade;
        if (currentGrade === 'FB' || currentGrade === 'B') return '😊';
        if (currentGrade === 'S') return '⚠️';
        if (currentGrade === 'I') return '🔺';
        return '😊';
    };

    // --- DATE GRAFIC ---
    const subjectLabels = student.subjectMedias ? Object.keys(student.subjectMedias) : [];
    const subjectValues = student.subjectMedias
        ? Object.values(student.subjectMedias).map(m => m.numeric)
        : [];

    const chartData = {
        labels: subjectLabels,
        datasets: [
            {
                label: 'Calificativ Numeric (1-4)',
                data: subjectValues,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(255, 206, 86, 1)',
            },
        ],
    };

    const handleAddGrade = async () => {
        await addGradeToStudent(student.id, newGrade.subject, newGrade.value);
        alert(`Nota ${newGrade.value} a fost adăugată la ${newGrade.subject}!`);
    };

    const chartOptions = {
        scales: {
            r: {
                angleLines: { display: true },
                suggestedMin: 1,
                suggestedMax: 4,
                ticks: { stepSize: 1 }
            }
        },
        plugins: { legend: { display: false } }
    };

    return (
        <div className="detail-container">
            <div className="detail-back-btn" onClick={onBack}>
                <span className="detail-back-icon">←</span> Back to MasterView
            </div>

            <div className="detail-card">
                <div className="detail-header">
                    <span>Student Details - {student.finalGrade} (Media: {student.averageNumeric})</span>
                    <span className="detail-close-btn" onClick={onBack}>X</span>
                </div>

                <div className="detail-body">
                    <div className="detail-left">
                        <div className="detail-pic">A pic<br/>with the angel</div>
                        <h2 className="detail-name">{student.lastName} {student.firstName}</h2>
                        <div className="detail-subtitle">Student · 3rd Year</div>
                        <div className="detail-emoji-box">
                            <span className="detail-emoji">{getEmoji(student.finalGrade)}</span>
                        </div>
                    </div>

                    <div className="detail-right">
                        <div className="detail-info-box">
                            <div className="detail-info-row">
                                <div><div className="detail-label">Birth Date</div><div className="detail-value">{student.birthDate}</div></div>
                                <div><div className="detail-label">Email</div><div className="detail-value">{student.email}</div></div>
                                <div><div className="detail-label">CNP</div><div className="detail-value">{student.cnp}</div></div>
                            </div>
                            <div className="detail-actions">
                                <button className="detail-btn-msg">Send a message</button>
                                <button className="detail-btn-edit" onClick={onEdit}>Edit</button>
                                <button className="detail-btn-delete" onClick={onDelete}>Delete</button>
                            </div>
                        </div>

                        <div className="detail-stats-section">
                            <div className="detail-subjects-list">
                                <h3>Grades by Subject</h3>

                                {/* Formular Adăugare Note */}
                                <div className="add-grade-box" style={{ margin: '15px 0', padding: '10px', border: '1px dashed #ccc', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>Add New Grade</h4>
                                    <select
                                        value={newGrade.subject}
                                        onChange={(e) => setNewGrade({...newGrade, subject: e.target.value})}
                                        style={{ padding: '5px', marginRight: '5px' }}
                                    >
                                        {['Math', 'English', 'Romanian', 'Biology', 'Physical Education', 'Visual Arts', 'Informatics', 'History'].map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={newGrade.value}
                                        onChange={(e) => setNewGrade({...newGrade, value: e.target.value})}
                                        style={{ padding: '5px', marginRight: '5px' }}
                                    >
                                        {['FB', 'B', 'S', 'I'].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>

                                    <button
                                        onClick={handleAddGrade}
                                        style={{ padding: '5px 10px', backgroundColor: '#3aa76d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="subjects-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {student.subjects && student.subjects.map((sub, idx) => (
                                        <div key={idx} style={{ padding: '5px', borderBottom: '1px solid #eee' }}>
                                            <strong>{sub.name}:</strong> {sub.grades.join(', ') || '-'}
                                            <span style={{ marginLeft: '5px', color: '#666' }}>
                                                ({student.subjectMedias?.[sub.name]?.letter || '-'})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="detail-chart-box" style={{ width: '300px' }}>
                                <Radar data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="detail-footer">
                    <div className="detail-footer-left">
                        <div className="detail-label">Mentions:</div>
                        <div className="detail-value">{student.mentions}</div>
                    </div>
                    <div className="detail-footer-right">
                        <strong>Overall Average: {student.finalGrade}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailedView;