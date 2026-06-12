import { create } from 'zustand';

const API_BASE_URL = "https://digital-gradebook.onrender.com";

const getAuthToken = () => {
    try {
        const authStorage = JSON.parse(localStorage.getItem('auth-storage'));
        return authStorage?.state?.token || null;
    } catch (e) {
        return null;
    }
};

export const useAdminStore = create((set, get) => ({
    users: [],
    logs: [],
    teacherProfiles: [],

    fetchUsers: async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return;
            const data = await response.json();
            set({ users: data });
        } catch (error) {
            console.error(error);
        }
    },

    createUser: async (userData) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            if (!response.ok) return false;
            await get().fetchUsers();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    deleteUser: async (id) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return false;
            await get().fetchUsers();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    changeRole: async (userId, newRole) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            if (!response.ok) return false;
            await get().fetchUsers();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    resetPassword: async (userId, newPassword) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Admin/users/${userId}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            });
            if (!response.ok) return false;
            await get().fetchUsers();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    fetchLogs: async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/Audit/logs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return;
            const data = await response.json();
            set({ logs: data });
        } catch (error) {
            console.error(error);
        }
    },

    fetchTeacherProfiles: async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/TeacherProfiles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return;
            const data = await response.json();
            set({ teacherProfiles: data });
        } catch (error) {
            console.error(error);
        }
    },

    createTeacherProfile: async (userId, subject) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/TeacherProfiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, subject })
            });
            if (!response.ok) return false;
            await get().fetchTeacherProfiles();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}));
