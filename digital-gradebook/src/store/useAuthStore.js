// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            users: [],
            currentUser: null,

            register: (userData) => {
                const { users } = get();
                if (users.find(u => u.email === userData.email)) {
                    return { success: false, message: 'Email-ul exista deja!' };
                }

                // Salvam noul user
                set({ users: [...users, userData] });
                return { success: true };
            },

            login: (email, password) => {
                const { users } = get();
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    set({ currentUser: user });
                    return { success: true, role: user.role };
                }
                return { success: false, message: 'Email sau parola incorecte!' };
            },

            logout: () => set({ currentUser: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);