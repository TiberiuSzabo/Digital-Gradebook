import React, { useEffect, useState } from 'react';
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
import ChatModal from './ChatModal';
import BadgePanel from './BadgePanel';
import ClassWeatherView from './ClassWeatherView';
import { useAdminStore } from '../store/useAdminStore';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const GRADE_COLOR = { FB: '#2d6a4f', B: '#4a90d9', S: '#e67e22', I: '#c0392b' };

const gradeToNum = (grade) => ({ FB: 4, B: 3, S: 2, I: 1 }[grade] || 0);
const numToGrade = (num) => {
    if (num === 0) return '—';
    if (num >= 3.5) return 'FB';
    if (num >= 2.5) return 'B';
    if (num >= 1.5) return 'S';
    return 'I';
};

const chartOptions = {
    scales: {
        r: {
            angleLines: { display: true },
            suggestedMin: 1,
            suggestedMax: 4,
            ticks: { stepSize: 1 },
        },
    },
    plugins: { legend: { display: false } },
};

function buildChartData(student) {
    const labels = [];
    const values = [];
    const stats  = {};

    (student?.subjects || []).forEach(sub => {
        labels.push(sub.name);
        if (!sub.grades || sub.grades.length === 0) {
            stats[sub.name] = { letter: '—' };
            values.push(0);
        } else {
            const nums = sub.grades.map(gradeToNum);
            const avg  = nums.reduce((a, b) => a + b, 0) / nums.length;
            stats[sub.name] = { letter: numToGrade(avg) };
            values.push(avg);
        }
    });

    return {
        stats,
        chartData: {
            labels,
            datasets: [{
                label: 'Grade (1–4)',
                data: values,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(255, 206, 86, 1)',
            }],
        },
    };
}

function ParentDashboardView({ currentUser, themeStyles, students }) {
    const studentId = currentUser?.studentId;
    const student   = (students || []).find(s => String(s.id) === String(studentId));

    const fetchTeacherProfiles = useAdminStore(s => s.fetchTeacherProfiles);
    const teacherProfiles      = useAdminStore(s => s.teacherProfiles);

    const [isContactOpen, setIsContactOpen] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [isTeacherChatOpen, setIsTeacherChatOpen] = useState(false);

    useEffect(() => { fetchTeacherProfiles(); }, []);

    useEffect(() => {
        if (teacherProfiles.length > 0 && !selectedTeacherId) {
            setSelectedTeacherId(String(teacherProfiles[0].userId || teacherProfiles[0].id));
        }
    }, [teacherProfiles]);

    const handleOpenTeacherChat = () => {
        setIsContactOpen(false);
        setIsTeacherChatOpen(true);
    };

    const classYear = student?.classYear || student?.class;
    const teacherChatRoom = selectedTeacherId
        ? `teacher-${selectedTeacherId}-student-${studentId}`
        : null;

    const selectedTeacherProfile = teacherProfiles.find(
        t => String(t.userId || t.id) === String(selectedTeacherId)
    );

    const { stats, chartData } = student ? buildChartData(student) : { stats: {}, chartData: { labels: [], datasets: [] } };

    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1b4332' }}>Parent Dashboard</h2>
                    {student && (
                        <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
                            Viewing: <strong>{student.firstName} {student.lastName}</strong>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setIsContactOpen(true)}
                    style={{
                        padding: '9px 20px', backgroundColor: '#ffda47', color: '#333',
                        border: 'none', borderRadius: 10, cursor: 'pointer',
                        fontWeight: 700, fontSize: 14,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                >
                    📩 Contact Teacher
                </button>
            </div>

            {!student ? (
                <div style={{
                    backgroundColor: '#fff', borderRadius: 12,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    padding: 40, textAlign: 'center', color: '#888',
                }}>
                    No linked student found. Ask an admin to link your account.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Student info header card */}
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 12,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        padding: '18px 22px',
                        display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            backgroundColor: '#dfffd6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 22, color: '#1b4332', flexShrink: 0,
                        }}>
                            {(student.firstName?.[0] || '') + (student.lastName?.[0] || '')}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 18, color: '#1b4332' }}>
                                {student.firstName} {student.lastName}
                            </div>
                            <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
                                Year {classYear || '—'} &nbsp;·&nbsp;
                                Overall grade:{' '}
                                <strong style={{ color: GRADE_COLOR[student.finalGrade] || '#333' }}>
                                    {student.finalGrade || '—'}
                                </strong>
                            </div>
                            {student.email && (
                                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{student.email}</div>
                            )}
                        </div>
                    </div>

                    {/* Grades + Radar */}
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 12,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        padding: '18px 22px',
                    }}>
                        <h3 style={{ margin: '0 0 14px', color: '#1b4332', fontSize: 15 }}>Grades by Subject</h3>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, minWidth: 220 }}>
                                {student.subjects && student.subjects.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {student.subjects.map((sub, i) => (
                                            <div key={i} style={{
                                                padding: '7px 10px', borderRadius: 8,
                                                backgroundColor: '#f9f9f9',
                                                borderLeft: `3px solid ${GRADE_COLOR[stats[sub.name]?.letter] || '#ccc'}`,
                                            }}>
                                                <div style={{ fontSize: 12, color: '#666' }}>{sub.name}</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                                                    {sub.grades && sub.grades.length > 0
                                                        ? sub.grades.map((g, gi) => (
                                                            <span key={gi} style={{
                                                                padding: '1px 7px', borderRadius: 10, fontSize: 12,
                                                                backgroundColor: '#fff', border: '1px solid #ddd',
                                                                color: GRADE_COLOR[g] || '#333',
                                                            }}>{g}</span>
                                                        ))
                                                        : <span style={{ color: '#aaa', fontSize: 12 }}>—</span>
                                                    }
                                                </div>
                                                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                                                    Avg: <strong>{stats[sub.name]?.letter || '—'}</strong>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#aaa', fontSize: 13 }}>No grades recorded.</p>
                                )}
                            </div>
                            <div style={{ width: 260, flexShrink: 0 }}>
                                {student.subjects && student.subjects.length > 0 && (
                                    <Radar data={chartData} options={chartOptions} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Badges */}
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 12,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        padding: '18px 22px',
                    }}>
                        <h3 style={{ margin: '0 0 12px', color: '#1b4332', fontSize: 15 }}>Badges</h3>
                        <BadgePanel studentId={student.id} isTeacher={false} classYear={classYear} />
                    </div>

                    {/* Class Weather */}
                    {classYear && (
                        <ClassWeatherView classYear={classYear} themeStyles={themeStyles} />
                    )}
                </div>
            )}

            {/* Contact Teacher modal */}
            {isContactOpen && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 14, padding: '24px 28px',
                        width: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, color: '#1b4332' }}>Contact a Teacher</h3>
                            <button
                                onClick={() => setIsContactOpen(false)}
                                style={{
                                    background: '#ff4d4d', color: '#fff', border: 'none',
                                    borderRadius: '50%', width: 26, height: 26,
                                    cursor: 'pointer', fontWeight: 700,
                                }}
                            >✕</button>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>
                                Select Teacher
                            </label>
                            <select
                                value={selectedTeacherId || ''}
                                onChange={e => setSelectedTeacherId(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 10px', borderRadius: 8,
                                    border: '1px solid #ccc', fontSize: 14,
                                }}
                            >
                                {teacherProfiles.length === 0 && (
                                    <option value="">No teachers available</option>
                                )}
                                {teacherProfiles.map(t => (
                                    <option key={t.userId || t.id} value={t.userId || t.id}>
                                        {t.userName || t.name || `Teacher ${t.userId || t.id}`}
                                        {t.subject ? ` — ${t.subject}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedTeacherProfile && (
                            <div style={{
                                backgroundColor: '#dfffd6', borderRadius: 8, padding: '8px 12px',
                                fontSize: 13, marginBottom: 14, color: '#2d6a4f',
                            }}>
                                <strong>{selectedTeacherProfile.userName || selectedTeacherProfile.name}</strong>
                                {selectedTeacherProfile.subject && ` · ${selectedTeacherProfile.subject}`}
                            </div>
                        )}

                        <button
                            onClick={handleOpenTeacherChat}
                            disabled={!selectedTeacherId}
                            style={{
                                width: '100%', padding: '10px', backgroundColor: '#ffda47',
                                color: '#333', border: 'none', borderRadius: 10,
                                cursor: selectedTeacherId ? 'pointer' : 'not-allowed',
                                fontWeight: 700, fontSize: 14,
                                opacity: selectedTeacherId ? 1 : 0.5,
                            }}
                        >
                            Open Chat
                        </button>
                    </div>
                </div>
            )}

            {/* Teacher chat */}
            <ChatModal
                isOpen={isTeacherChatOpen}
                onClose={() => setIsTeacherChatOpen(false)}
                roomIdentifier={teacherChatRoom}
                currentUser={currentUser}
            />
        </div>
    );
}

export default ParentDashboardView;
