import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = `https://${window.location.hostname}:5242`;
let inactivityTimer;

export const useAuthStore = create(
    persist(
        (set, get) => ({
            users: [],
            currentUser: null,
            token: null,

            register: async (userData) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });

                    const text = await response.text();
                    let data = {};
                    try { data = JSON.parse(text); } catch(e) {}

                    if (response.ok) return { success: true };
                    return { success: false, message: data.message || 'Eroare la înregistrare!' };
                } catch (error) {
                    return { success: false, message: 'Eroare de conexiune la server!' };
                }
            },

            login: async (email, password) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: email, password: password })
                    });

                    // 🔴 AICI ERA PROBLEMA: Prindem crash-ul din C# direct, fără să dăm vina pe conexiune
                    const textResponse = await response.text();
                    let data;
                    try {
                        data = JSON.parse(textResponse);
                    } catch (parseError) {
                        console.error("CRASH C# (Server Error 500):", textResponse);
                        return { success: false, message: "Eroare backend! Contul tău e probabil corupt în baza de date." };
                    }

                    if (response.ok) {
                        if (data.requires3FA) {
                            return { success: true, requires3FA: true, message: data.message };
                        }

                        const formattedUser = {
                            id: data.id,
                            email: data.username,
                            name: data.username,
                            role: data.role,
                            studentId: data.studentId
                        };

                        set({ currentUser: formattedUser, token: data.token });
                        get().startInactivityTimer();
                        return { success: true, requires3FA: false, role: data.role };
                    }

                    return { success: false, message: data.message || 'Email sau parola incorecta!' };
                } catch (error) {
                    return { success: false, message: "Eroare de rețea! Verifică conexiunea." };
                }
            },

            verify2FA: async (email, code) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/Auth/verify-2fa`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: email, code: code })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        if (data.requiresPin) return { success: true, requiresPin: true, message: data.message };
                    }
                    return { success: false, message: data.message || 'Cod invalid!' };
                } catch (error) { return { success: false, message: 'Eroare de conexiune!' }; }
            },

            verifyPin: async (email, pin) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/Auth/verify-pin`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: email, pin: pin })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        const formattedUser = { id: data.id, email: data.username, name: data.username, role: data.role, studentId: data.studentId };
                        set({ currentUser: formattedUser, token: data.token });
                        get().startInactivityTimer();
                        return { success: true, role: data.role };
                    }
                    return { success: false, message: data.message || 'PIN incorect!' };
                } catch (error) { return { success: false, message: 'Eroare de conexiune!' }; }
            },

            forgotPassword: async (email) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/Auth/forgot-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: email })
                    });
                    const data = await response.json();
                    return { success: response.ok, message: data.message };
                } catch(e) { return { success: false, message: "Eroare de conexiune!"} }
            },

            resetPassword: async (email, token, newPassword) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/Auth/reset-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: email, token: token, newPassword: newPassword })
                    });
                    const data = await response.json();
                    return { success: response.ok, message: data.message || "Eroare la resetare!" };
                } catch(e) { return { success: false, message: "Eroare de conexiune!"} }
            },

            logout: () => {
                set({ currentUser: null, token: null });
                get().clearInactivityTimer();
            },

            startInactivityTimer: () => {
                get().clearInactivityTimer();
                const resetTimer = () => {
                    if (inactivityTimer) clearTimeout(inactivityTimer);
                    inactivityTimer = setTimeout(() => {
                        get().logout();
                        alert("Sesiunea a expirat din cauza inactivitatii.");
                        window.location.href = '/';
                    }, 15 * 60 * 1000);
                };

                document.onmousemove = resetTimer;
                document.onkeypress = resetTimer;
                resetTimer();
            },

            clearInactivityTimer: () => {
                if (inactivityTimer) clearTimeout(inactivityTimer);
                document.onmousemove = null;
                document.onkeypress = null;
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);