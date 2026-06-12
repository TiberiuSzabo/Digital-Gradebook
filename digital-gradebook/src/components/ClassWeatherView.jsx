import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBadgeStore, BADGE_TYPES } from '../store/useBadgeStore';

const keyframes = `
@keyframes pulse {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px #ffda47); }
    50% { transform: scale(1.15); filter: drop-shadow(0 0 20px #ffda47); }
}
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}
@keyframes drip {
    0% { transform: translateY(0px); opacity: 1; }
    60% { transform: translateY(8px); opacity: 0.7; }
    100% { transform: translateY(0px); opacity: 1; }
}
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px) rotate(-3deg); }
    40% { transform: translateX(6px) rotate(3deg); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
`;

const WEATHER_CONFIG = {
    sunny:  { emoji: '☀️', label: 'Sunny',   animation: 'pulse 2s ease-in-out infinite' },
    cloudy: { emoji: '⛅', label: 'Cloudy',  animation: 'float 3s ease-in-out infinite' },
    rainy:  { emoji: '🌧️', label: 'Rainy',   animation: 'drip 1.5s ease-in-out infinite' },
    stormy: { emoji: '⛈️', label: 'Stormy',  animation: 'shake 0.8s ease-in-out infinite' },
    tornado:{ emoji: '🌪️', label: 'Tornado', animation: 'spin 1s linear infinite' },
};

const GOOD_KEYS = new Set(BADGE_TYPES.good.map(t => t.key));

function ClassWeatherView({ themeStyles, students = [], classYear: classYearProp }) {
    const [searchParams] = useSearchParams();
    const classYear = classYearProp || Number(searchParams.get('classYear')) || 1;

    const fetchClassWeather = useBadgeStore(state => state.fetchClassWeather);
    const fetchClassBadges  = useBadgeStore(state => state.fetchClassBadges);
    const classWeather      = useBadgeStore(state => state.classWeather);
    const classBadges       = useBadgeStore(state => state.classBadges);

    useEffect(() => {
        fetchClassWeather(classYear);
        fetchClassBadges(classYear);
    }, [classYear]);

    const weather = classWeather[classYear];
    const badges  = classBadges[classYear] || [];

    const config = weather ? (WEATHER_CONFIG[weather.state] || WEATHER_CONFIG.sunny) : null;

    const studentGoodCounts = {};
    const studentBadCounts  = {};
    const studentNames      = {};

    badges.forEach(b => {
        const sid = b.studentId;
        const s = students.find(st => st.id === sid);
        studentNames[sid] = s ? `${s.lastName} ${s.firstName}` : `Student ${sid}`;
        if (GOOD_KEYS.has(b.type)) {
            studentGoodCounts[sid] = (studentGoodCounts[sid] || 0) + 1;
        } else {
            studentBadCounts[sid] = (studentBadCounts[sid] || 0) + 1;
        }
    });

    const top3Good = Object.entries(studentGoodCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const top3Bad = Object.entries(studentBadCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const top3GoodIds = new Set(top3Good.map(([id]) => id));
    const buddySuggestions = top3Bad.map(([badId, count]) => {
        const buddy = top3Good[0]?.[0];
        return { id: badId, name: studentNames[badId], count, buddy: buddy ? studentNames[buddy] : 'N/A' };
    });

    const score = weather?.score ?? 0;

    return (
        <>
            <style>{keyframes}</style>
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <div style={{
                    backgroundColor: themeStyles?.cardBg || '#fff',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    padding: '24px',
                    textAlign: 'center',
                    marginBottom: 20,
                }}>
                    <h2 style={{ margin: '0 0 8px', color: '#2d6a4f' }}>
                        Class Weather — Year {classYear}
                    </h2>

                    {!weather ? (
                        <p style={{ color: '#888' }}>Loading weather data…</p>
                    ) : (
                        <>
                            <div style={{ fontSize: 80, lineHeight: 1.2, animation: config.animation, display: 'inline-block' }}>
                                {config.emoji}
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 700, margin: '10px 0 4px', color: '#1b4332' }}>
                                {config.label}
                            </div>
                            <div style={{ fontSize: 16, color: '#555', marginBottom: 8 }}>
                                Score:{' '}
                                <span style={{ color: score >= 0 ? '#2d6a4f' : '#c0392b', fontWeight: 700 }}>
                                    {score >= 0 ? `+${score}` : score}
                                </span>
                                &nbsp;·&nbsp;
                                <span style={{ color: '#2d6a4f' }}>✅ {weather.goodCount} good</span>
                                &nbsp;·&nbsp;
                                <span style={{ color: '#c0392b' }}>⚠️ {weather.badCount} bad</span>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{
                        flex: 1,
                        backgroundColor: '#dfffd6',
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        padding: '18px 20px',
                    }}>
                        <h3 style={{ margin: '0 0 12px', color: '#1b4332', fontSize: 15 }}>
                            Top 3 Positive Students
                        </h3>
                        {top3Good.length === 0 ? (
                            <p style={{ color: '#888', fontSize: 13 }}>No data yet.</p>
                        ) : (
                            top3Good.map(([sid, count], idx) => (
                                <div key={sid} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '8px 10px', marginBottom: 6,
                                    backgroundColor: '#fff', borderRadius: 8,
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                }}>
                                    <span style={{ fontSize: 18 }}>{['🥇','🥈','🥉'][idx]}</span>
                                    <span style={{ flex: 1, fontWeight: 600, color: '#2d6a4f' }}>
                                        {studentNames[sid]}
                                    </span>
                                    <span style={{ color: '#888', fontSize: 13 }}>{count} badges</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{
                        flex: 1,
                        backgroundColor: '#fff0f0',
                        borderRadius: 12,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        padding: '18px 20px',
                    }}>
                        <h3 style={{ margin: '0 0 12px', color: '#922b21', fontSize: 15 }}>
                            Students with Problems
                        </h3>
                        {buddySuggestions.length === 0 ? (
                            <p style={{ color: '#888', fontSize: 13 }}>No issues detected.</p>
                        ) : (
                            buddySuggestions.map(({ id, name, count, buddy }) => (
                                <div key={id} style={{
                                    padding: '8px 10px', marginBottom: 6,
                                    backgroundColor: '#fff', borderRadius: 8,
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                }}>
                                    <div style={{ fontWeight: 600, color: '#922b21' }}>{name}</div>
                                    <div style={{ fontSize: 12, color: '#888' }}>
                                        {count} bad badge{count !== 1 ? 's' : ''} · Suggested buddy:{' '}
                                        <span style={{ color: '#2d6a4f', fontWeight: 600 }}>{buddy}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ClassWeatherView;
