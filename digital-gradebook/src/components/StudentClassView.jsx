import React, { useEffect, useState } from 'react';
import ChatModal from './ChatModal';
import BadgePanel from './BadgePanel';
import { useBadgeStore } from '../store/useBadgeStore';
import { useAdminStore } from '../store/useAdminStore';

const GRADE_COLOR = { FB: '#2d6a4f', B: '#4a90d9', S: '#e67e22', I: '#c0392b' };

function getInitials(student) {
    const first = (student.firstName || '')[0] || '';
    const last  = (student.lastName  || '')[0] || '';
    return (first + last).toUpperCase() || '?';
}

function StudentClassView({ currentUser, themeStyles, students, allStudents }) {
    const myStudent = (students || allStudents || []).find(s => s.id === currentUser?.studentId);
    const classYear = myStudent?.classYear || 1;

    const [classmates, setClassmates] = useState([]);

    useEffect(() => {
        if (!classYear) return;
        const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
        fetch(`https://digital-gradebook.onrender.com/api/Students/class/${classYear}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setClassmates(data.map(s => ({
                ...s,
                subjects: Object.entries(
                    (s.grades || []).reduce((acc, g) => {
                        if (!acc[g.subjectName]) acc[g.subjectName] = [];
                        acc[g.subjectName].push(g.value);
                        return acc;
                    }, {})
                ).map(([name, grades]) => ({ name, grades })),
                finalGrade: (() => {
                    const map = { FB: 4, B: 3, S: 2, I: 1 };
                    const vals = (s.grades || []).map(g => map[g.value]).filter(Boolean);
                    if (!vals.length) return '—';
                    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                    if (avg >= 3.5) return 'FB';
                    if (avg >= 2.5) return 'B';
                    if (avg >= 1.5) return 'S';
                    return 'I';
                })()
            }))))
            .catch(console.error);
    }, [classYear]);

    const fetchBadgesForStudent = useBadgeStore(state => state.fetchBadgesForStudent);
    const studentBadges         = useBadgeStore(state => state.studentBadges);
    const fetchTeacherProfiles  = useAdminStore(state => state.fetchTeacherProfiles);
    const teacherProfiles       = useAdminStore(state => state.teacherProfiles);

    const [selectedClassmate, setSelectedClassmate] = useState(null);
    const [isClassChatOpen, setIsClassChatOpen] = useState(false);
    const [isContactTeacherOpen, setIsContactTeacherOpen] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [isTeacherChatOpen, setIsTeacherChatOpen] = useState(false);
    const [isBuddyChatOpen, setIsBuddyChatOpen] = useState(false);
    const [buddyChatRoom, setBuddyChatRoom] = useState(null);
    const [problems, setProblems] = useState([]);

    useEffect(() => {
        if (!classYear) return;
        const token = JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;
        fetch(`https://digital-gradebook.onrender.com/api/Students/problems/${classYear}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setProblems(data))
            .catch(console.error);
    }, [classYear]);

    useEffect(() => {
        classmates.forEach(s => fetchBadgesForStudent(s.id));
    }, [classmates.length]);

    useEffect(() => {
        fetchTeacherProfiles();
    }, []);

    const myProfile = classmates.find(s => String(s.id) === String(currentUser?.studentId || currentUser?.id));

    const handleContactTeacher = () => {
        if (teacherProfiles.length > 0) setSelectedTeacherId(teacherProfiles[0].userId || teacherProfiles[0].id);
        setIsContactTeacherOpen(true);
    };

    const handleOpenTeacherChat = () => {
        if (!selectedTeacherId) return;
        setIsContactTeacherOpen(false);
        setIsTeacherChatOpen(true);
    };

    const selectedTeacherProfile = teacherProfiles.find(
        t => String(t.userId || t.id) === String(selectedTeacherId)
    );

    const teacherChatRoom = selectedTeacherId
        ? `teacher-${selectedTeacherId}-student-${currentUser?.studentId || currentUser?.id}`
        : null;

    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1b4332' }}>My Class</h2>
                    <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>Year {classYear}</div>
                </div>
                <button
                    onClick={() => setIsClassChatOpen(true)}
                    style={{
                        padding: '8px 20px', backgroundColor: '#ffda47', color: '#333',
                        border: 'none', borderRadius: 10, cursor: 'pointer',
                        fontWeight: 700, fontSize: 14,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                >
                    💬 Class Chat
                </button>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
                <div style={{
                    width: '40%', display: 'flex', flexDirection: 'column', gap: 10,
                    maxHeight: 'calc(100vh - 180px)', overflowY: 'auto',
                }}>
                    {classmates.map(s => {
                        const badges = studentBadges[s.id] || [];
                        const goodEmojis = badges.filter(b => b.isGood).map(b => b.emoji).slice(0, 3);
                        const badEmojis  = badges.filter(b => !b.isGood).map(b => b.emoji).slice(0, 2);
                        const isSelected = selectedClassmate && String(selectedClassmate.id) === String(s.id);
                        const isMe       = myProfile && String(s.id) === String(myProfile?.id);

                        return (
                            <div
                                key={s.id}
                                onClick={() => setSelectedClassmate(s)}
                                style={{
                                    backgroundColor: isSelected ? '#dfffd6' : '#fff',
                                    borderRadius: 12,
                                    padding: '12px 14px',
                                    cursor: 'pointer',
                                    boxShadow: isSelected ? '0 2px 10px rgba(45,106,79,0.2)' : '0 1px 4px rgba(0,0,0,0.08)',
                                    border: isSelected ? '2px solid #2d6a4f' : '2px solid transparent',
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    transition: 'all 0.15s',
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    backgroundColor: isMe ? '#ffda47' : '#dfffd6',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: 15, color: '#1b4332', flexShrink: 0,
                                }}>
                                    {getInitials(s)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1b4332', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {s.firstName} {s.lastName} {isMe && <span style={{ fontSize: 11, color: '#888' }}>(you)</span>}
                                    </div>
                                    <div style={{ fontSize: 12, color: GRADE_COLOR[s.finalGrade] || '#555' }}>
                                        Grade: <strong>{s.finalGrade || '—'}</strong>
                                    </div>
                                </div>
                                <div style={{ fontSize: 16 }}>{goodEmojis.join('')}{badEmojis.join('')}</div>
                            </div>
                        );
                    })}
                    {classmates.length === 0 && (
                        <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 20 }}>
                            No classmates found.
                        </div>
                    )}
                </div>

                <div style={{
                    flex: 1, backgroundColor: '#fff', borderRadius: 12,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)', padding: '20px 22px', minHeight: 300,
                }}>
                    {!selectedClassmate ? (
                        <div style={{ color: '#aaa', fontSize: 14, textAlign: 'center', paddingTop: 60 }}>
                            Select a classmate to view their profile.
                        </div>
                    ) : (() => {
                        const isMe = myProfile && String(selectedClassmate.id) === String(myProfile?.id);

                        return (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: '50%',
                                        backgroundColor: isMe ? '#ffda47' : '#dfffd6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: 20, color: '#1b4332',
                                    }}>
                                        {getInitials(selectedClassmate)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#1b4332' }}>
                                            {selectedClassmate.firstName} {selectedClassmate.lastName}
                                            {isMe && <span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}> (you)</span>}
                                        </h3>
                                        <div style={{ fontSize: 13, color: '#555' }}>Year {classYear}</div>
                                    </div>
                                </div>

                                {/* Grades */}
                                <div style={{ backgroundColor: '#dfffd6', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1b4332', marginBottom: 8 }}>Grades</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {selectedClassmate.subjects && selectedClassmate.subjects.length > 0 ? (
                                            selectedClassmate.subjects.map((sub, i) => (
                                                <div key={i} style={{ backgroundColor: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 13, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                                                    <span style={{ color: '#555' }}>{sub.name}:</span>{' '}
                                                    <strong style={{ color: GRADE_COLOR[sub.grades?.[sub.grades.length - 1]] || '#333' }}>
                                                        {sub.grades?.join(', ') || '—'}
                                                    </strong>
                                                </div>
                                            ))
                                        ) : (
                                            <span style={{ color: '#aaa', fontSize: 13 }}>No grades recorded.</span>
                                        )}
                                    </div>
                                    <div style={{ marginTop: 8, fontSize: 13 }}>
                                        Overall: <strong style={{ color: GRADE_COLOR[selectedClassmate.finalGrade] || '#333' }}>
                                        {selectedClassmate.finalGrade || '—'}
                                    </strong>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1b4332', marginBottom: 8 }}>Badges</div>
                                    <BadgePanel studentId={selectedClassmate.id} isTeacher={false} classYear={classYear} />
                                </div>

                                {/* My profile extras — only shown when viewing own profile */}
                                {isMe && (
                                    <div style={{ borderTop: '1px solid #eee', paddingTop: 14, marginTop: 4 }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: '#1b4332', marginBottom: 10 }}>My Profile</div>
                                        <BadgePanel studentId={selectedClassmate.id} isTeacher={false} classYear={classYear} />
                                        <button
                                            onClick={handleContactTeacher}
                                            style={{
                                                marginTop: 12, padding: '8px 20px', backgroundColor: '#ffda47', color: '#333',
                                                border: 'none', borderRadius: 10, cursor: 'pointer',
                                                fontWeight: 700, fontSize: 13, boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                            }}
                                        >
                                            📩 Contact Teacher
                                        </button>

                                        {/* BLOC 1: Eu am probleme, mi se sugereaza un buddy */}
                                        {(() => {
                                            const myProblem = problems.find(p => String(p.student?.id) === String(myProfile?.id));
                                            if (!myProblem) return null;
                                            return (
                                                <div style={{
                                                    marginTop: 14, padding: '12px 14px',
                                                    backgroundColor: '#fff8e1', borderRadius: 10,
                                                    borderLeft: '4px solid #ffda47',
                                                }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#b8860b', marginBottom: 6 }}>
                                                        🤝 Suggested Buddy
                                                    </div>
                                                    {myProblem.suggestedBuddy ? (
                                                        <div style={{ fontSize: 13, color: '#555' }}>
                                                            <strong style={{ color: '#1b4332' }}>
                                                                {myProblem.suggestedBuddy.firstName} {myProblem.suggestedBuddy.lastName}
                                                            </strong>
                                                            {' '}can help you improve!
                                                            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                                                                Problem badges: {myProblem.problemBadges?.join(', ')}
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    const myId = myProfile.id;
                                                                    const buddyId = myProblem.suggestedBuddy.id;
                                                                    setBuddyChatRoom(`buddy-${Math.min(myId, buddyId)}-${Math.max(myId, buddyId)}`);
                                                                    setIsBuddyChatOpen(true);
                                                                }}
                                                                style={{
                                                                    marginTop: 10, padding: '7px 16px',
                                                                    backgroundColor: '#2d6a4f', color: '#fff',
                                                                    border: 'none', borderRadius: 8, cursor: 'pointer',
                                                                    fontWeight: 700, fontSize: 13,
                                                                }}
                                                            >
                                                                💬 Chat with Buddy
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: 13, color: '#888' }}>No buddy found yet.</div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* BLOC 2: Eu sunt buddy pentru altcineva */}
                                        {(() => {
                                            const isBuddyFor = problems.find(p => String(p.suggestedBuddy?.id) === String(myProfile?.id));
                                            if (!isBuddyFor) return null;
                                            return (
                                                <div style={{
                                                    marginTop: 14, padding: '12px 14px',
                                                    backgroundColor: '#e8f5e9', borderRadius: 10,
                                                    borderLeft: '4px solid #2d6a4f',
                                                }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#2d6a4f', marginBottom: 6 }}>
                                                        ⭐ You are a Buddy!
                                                    </div>
                                                    <div style={{ fontSize: 13, color: '#555' }}>
                                                        <strong style={{ color: '#1b4332' }}>
                                                            {isBuddyFor.student.firstName} {isBuddyFor.student.lastName}
                                                        </strong>
                                                        {' '}needs your help!
                                                        <button
                                                            onClick={() => {
                                                                const myId = myProfile.id;
                                                                const otherId = isBuddyFor.student.id;
                                                                setBuddyChatRoom(`buddy-${Math.min(myId, otherId)}-${Math.max(myId, otherId)}`);
                                                                setIsBuddyChatOpen(true);
                                                            }}
                                                            style={{
                                                                marginTop: 10, display: 'block', padding: '7px 16px',
                                                                backgroundColor: '#2d6a4f', color: '#fff',
                                                                border: 'none', borderRadius: 8, cursor: 'pointer',
                                                                fontWeight: 700, fontSize: 13,
                                                            }}
                                                        >
                                                            💬 Open Buddy Chat
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Class chat */}
            <ChatModal
                isOpen={isClassChatOpen}
                onClose={() => setIsClassChatOpen(false)}
                roomIdentifier={`class-${classYear}`}
                currentUser={currentUser}
            />

            {/* Buddy chat */}
            <ChatModal
                isOpen={isBuddyChatOpen}
                onClose={() => setIsBuddyChatOpen(false)}
                roomIdentifier={buddyChatRoom}
                currentUser={currentUser}
            />

            {/* Contact Teacher modal */}
            {isContactTeacherOpen && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 14, padding: '24px 28px',
                        width: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, color: '#1b4332' }}>Contact a Teacher</h3>
                            <button
                                onClick={() => setIsContactTeacherOpen(false)}
                                style={{ background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', fontWeight: 700 }}
                            >✕</button>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>Select Teacher</label>
                            <select
                                value={selectedTeacherId || ''}
                                onChange={e => setSelectedTeacherId(e.target.value)}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ccc', fontSize: 14 }}
                            >
                                {teacherProfiles.length === 0 && <option value="">No teachers available</option>}
                                {teacherProfiles.map(t => (
                                    <option key={t.userId || t.id} value={t.userId || t.id}>
                                        {t.username || t.userName || t.name || `Teacher ${t.userId || t.id}`}
                                        {t.subject ? ` — ${t.subject}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedTeacherProfile && (
                            <div style={{ backgroundColor: '#dfffd6', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 14, color: '#2d6a4f' }}>
                                <strong>{selectedTeacherProfile.username || selectedTeacherProfile.userName || selectedTeacherProfile.name}</strong>
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
                            }}
                        >
                            Open Chat
                        </button>
                    </div>
                </div>
            )}

            {/* Teacher direct chat */}
            <ChatModal
                isOpen={isTeacherChatOpen}
                onClose={() => setIsTeacherChatOpen(false)}
                roomIdentifier={teacherChatRoom}
                currentUser={currentUser}
            />
        </div>
    );
}

export default StudentClassView;