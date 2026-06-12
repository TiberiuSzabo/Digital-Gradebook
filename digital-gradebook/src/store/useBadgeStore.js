import { create } from 'zustand';

const API_BASE_URL = "https://digital-gradebook.onrender.com";

export const BADGE_TYPES = {
    good: [
        { key: "steaaclasei", label: "Class Star", emoji: "🌟" },
        { key: "coleganadejde", label: "Reliable Friend", emoji: "🤝" },
        { key: "gospodar", label: "Tidy & Clean", emoji: "🧹" },
        { key: "cititorinrait", label: "Bookworm", emoji: "📚" },
        { key: "pacificator", label: "Peacemaker", emoji: "🕊️" },
        { key: "ecologist", label: "Ecologist", emoji: "🌱" }
    ],
    bad: [
        { key: "bully", label: "Bully", emoji: "😠" },
        { key: "murdar", label: "Messy", emoji: "🗑️" },
        { key: "dependenttelefon", label: "Phone Addict", emoji: "📵" },
        { key: "mincinos", label: "Liar", emoji: "🤥" },
        { key: "obraznic", label: "Disruptive", emoji: "😤" },
        { key: "lenes", label: "Lazy", emoji: "💤" }
    ]
};

const getAuthToken = () => {
    try {
        const authStorage = JSON.parse(localStorage.getItem('auth-storage'));
        return authStorage?.state?.token || null;
    } catch (e) {
        return null;
    }
};

export const useBadgeStore = create((set, get) => ({
    studentBadges: {},
    classBadges: {},
    classWeather: {},

    fetchBadgesForStudent: async (studentId) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Badges/student/${studentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return;
            const data = await response.json();
            set((state) => ({ studentBadges: { ...state.studentBadges, [studentId]: data } }));
        } catch (error) {
            console.error(error);
        }
    },

    fetchClassBadges: async (classYear) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Badges/class/${classYear}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return;
            const data = await response.json();
            set((state) => ({ classBadges: { ...state.classBadges, [classYear]: data } }));
        } catch (error) {
            console.error(error);
        }
    },

    fetchClassWeather: async (classYear) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Badges/weather/${classYear}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return;
            const data = await response.json();
            const weather = {
                score: data.score,
                goodCount: data.goodCount,
                badCount: data.badCount,
                state: data.state
            };
            set((state) => ({ classWeather: { ...state.classWeather, [classYear]: weather } }));
        } catch (error) {
            console.error(error);
        }
    },

    awardBadge: async (studentId, type, awardedByUserId) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Badges`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ studentId, type, awardedByUserId })
            });
            if (!response.ok) return false;
            await get().fetchBadgesForStudent(studentId);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    removeBadge: async (badgeId, studentId) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Badges/${badgeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return false;
            await get().fetchBadgesForStudent(studentId);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}));
