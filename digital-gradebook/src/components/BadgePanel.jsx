import React, { useEffect, useState } from 'react';
import { useBadgeStore, BADGE_TYPES } from '../store/useBadgeStore';
import { useAuthStore } from '../store/useAuthStore';

function BadgePanel({ studentId, isTeacher, classYear }) {
    const fetchBadgesForStudent = useBadgeStore(state => state.fetchBadgesForStudent);
    const awardBadge             = useBadgeStore(state => state.awardBadge);
    const removeBadge            = useBadgeStore(state => state.removeBadge);
    const studentBadges          = useBadgeStore(state => state.studentBadges);
    const currentUser            = useAuthStore(state => state.currentUser);

    const [selectedType, setSelectedType] = useState(BADGE_TYPES.good[0].key);
    const [awarding, setAwarding] = useState(false);

    useEffect(() => {
        if (studentId) fetchBadgesForStudent(studentId);
    }, [studentId]);

    const goodKeys = new Set(BADGE_TYPES.good.map(t => t.key));
    const badges = (studentBadges[studentId] || []).map(b => ({ ...b, isGood: goodKeys.has(b.type) }));
    const goodBadges = badges.filter(b => b.isGood);
    const badBadges  = badges.filter(b => !b.isGood);

    const allTypes = [...BADGE_TYPES.good, ...BADGE_TYPES.bad];

    const handleAward = async () => {
        setAwarding(true);
        const success = await awardBadge(studentId, selectedType, currentUser?.id);
        if (!success) {
            alert('Failed to award badge. Please check your connection or try again.');
            await fetchBadgesForStudent(studentId);
        }
        setAwarding(false);
    };

    const handleRemove = async (badgeId) => {
        if (window.confirm('Remove this badge?')) {
            await removeBadge(badgeId, studentId);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try { return new Date(dateStr).toLocaleDateString(); } catch { return dateStr; }
    };

    const badgeCard = (badge) => {
        const meta = allTypes.find(t => t.key === badge.type) || { emoji: '🏷️', label: badge.type };
        return (
            <div key={badge.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px',
                backgroundColor: badge.isGood ? '#dfffd6' : '#fff0f0',
                borderRadius: 8,
                marginBottom: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
            }}>
                <span style={{ fontSize: 20 }}>{meta.emoji}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: badge.isGood ? '#1b4332' : '#922b21' }}>
                        {meta.label}
                    </div>
                    {badge.awardedAt && (
                        <div style={{ fontSize: 11, color: '#888' }}>{formatDate(badge.awardedAt)}</div>
                    )}
                </div>
                {isTeacher && (
                    <button
                        onClick={() => handleRemove(badge.id)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#c0392b', fontSize: 16, padding: '0 2px',
                        }}
                        title="Remove badge"
                    >✕</button>
                )}
            </div>
        );
    };

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            {isTeacher && (
                <div style={{
                    backgroundColor: '#fffbea',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginBottom: 14,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#555' }}>Award Badge:</span>
                    <select
                        value={selectedType}
                        onChange={e => setSelectedType(e.target.value)}
                        style={{
                            padding: '5px 8px', borderRadius: 6, border: '1px solid #ccc',
                            fontSize: 13, flex: 1, minWidth: 140,
                        }}
                    >
                        <optgroup label="Good">
                            {BADGE_TYPES.good.map(t => (
                                <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Bad">
                            {BADGE_TYPES.bad.map(t => (
                                <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>
                            ))}
                        </optgroup>
                    </select>
                    <button
                        onClick={handleAward}
                        disabled={awarding}
                        style={{
                            padding: '6px 16px', backgroundColor: '#ffda47', color: '#333',
                            border: 'none', borderRadius: 8, cursor: awarding ? 'not-allowed' : 'pointer',
                            fontWeight: 700, fontSize: 13,
                        }}
                    >
                        {awarding ? 'Awarding…' : 'Award'}
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#2d6a4f', marginBottom: 6 }}>
                        Good Badges ({goodBadges.length})
                    </div>
                    {goodBadges.length === 0
                        ? <div style={{ fontSize: 12, color: '#aaa' }}>None yet.</div>
                        : goodBadges.map(badgeCard)}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#922b21', marginBottom: 6 }}>
                        Bad Badges ({badBadges.length})
                    </div>
                    {badBadges.length === 0
                        ? <div style={{ fontSize: 12, color: '#aaa' }}>None yet.</div>
                        : badBadges.map(badgeCard)}
                </div>
            </div>
        </div>
    );
}

export default BadgePanel;
