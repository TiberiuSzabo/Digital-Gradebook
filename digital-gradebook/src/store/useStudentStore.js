import { create } from 'zustand';
import { HubConnectionBuilder } from '@microsoft/signalr';

const API_BASE_URL = "https://digital-gradebook.onrender.com";
const API_URL = `${API_BASE_URL}/api/Students`;
const AUTH_URL = `${API_BASE_URL}/api/Auth/login`;

const getOfflineQueue = () => JSON.parse(localStorage.getItem('offlineQueue') || '[]');
let signalRConnection = null;

const saveToOfflineQueue = (action) => {
    const queue = getOfflineQueue();
    queue.push(action);
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
};

const getAuthToken = (get) => {
    let token = get().currentUser?.token;
    if (!token) {
        try {
            const authStorage = JSON.parse(localStorage.getItem('auth-storage'));
            token = authStorage?.state?.token || authStorage?.state?.currentUser?.token;
        } catch (e) { }
    }
    return token;
};

export const useStudentStore = create((set, get) => ({
    currentUser: null,
    isAuthenticated: false,
    authError: null,

    students: [],
    loading: false,
    error: null,
    isGeneratorRunning: false,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,

    login: async (username, password) => {
        set({ loading: true, authError: null });
        try {
            const response = await fetch(AUTH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Username sau parolă incorectă!');
            }

            const userData = await response.json();
            set({
                currentUser: userData,
                isAuthenticated: true,
                loading: false
            });
            return true;
        } catch (error) {
            set({ authError: error.message, loading: false });
            return false;
        }
    },

    logout: () => {
        set({ currentUser: null, isAuthenticated: false, students: [] });
    },

    syncOfflineData: async () => {
        if (!navigator.onLine) return;

        const queue = getOfflineQueue();
        if (queue.length === 0) return;

        console.log(`🔄 Sincronizăm ${queue.length} acțiuni offline...`);
        const token = getAuthToken(get);

        for (const action of queue) {
            try {
                const url = action.type === 'updateStudent' ? `${API_URL}/${action.payload.id}` : API_URL;
                const method = action.type === 'updateStudent' ? 'PUT' : 'POST';

                await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(action.payload)
                });
            } catch (error) {
                console.error(error);
            }
        }

        localStorage.removeItem('offlineQueue');
        await get().fetchStudents();
    },

    fetchStudents: async () => {
        try {
            const token = getAuthToken(get);
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn("Sesiune expirată sau token invalid.");
                    get().logout();
                    return;
                }
                throw new Error('Eroare rețea');
            }

            const data = await response.json();

            const formattedData = data.map(student => {
                const rawGrades = student.grades || [];

                const subjectsMap = {};
                rawGrades.forEach(g => {
                    const subj = g.subjectName;
                    if (!subjectsMap[subj]) subjectsMap[subj] = [];
                    subjectsMap[subj].push(g.value);
                });

                const subjects = Object.keys(subjectsMap).map(name => ({
                    name: name,
                    grades: subjectsMap[name]
                }));

                const gradeToNumber = { "FB": 4, "B": 3, "S": 2, "I": 1 };
                let totalSuma = 0;
                let totalNote = 0;

                rawGrades.forEach(g => {
                    const valoareNumerica = gradeToNumber[g.value];
                    if (valoareNumerica) {
                        totalSuma += valoareNumerica;
                        totalNote += 1;
                    }
                });

                const averageNumeric = totalNote > 0 ? (totalSuma / totalNote).toFixed(2) : "0.00";

                let finalGrade = "-";
                const avg = parseFloat(averageNumeric);
                if (avg >= 3.5) finalGrade = "FB";
                else if (avg >= 2.5) finalGrade = "B";
                else if (avg >= 1.5) finalGrade = "S";
                else if (avg > 0) finalGrade = "I";

                return {
                    ...student,
                    subjects: subjects,
                    averageNumeric: averageNumeric,
                    finalGrade: finalGrade
                };
            });

            set({ students: formattedData });
        } catch (error) {
            console.error(error);
        }
    },

    fetchStudentsGraphQL: async (page) => {
        await get().fetchStudents();
        set({ currentPage: page, hasMore: false });
    },

    saveStudent: async (studentData) => {
        set({ loading: true, error: null });
        try {
            const isUpdate = studentData.id && studentData.id !== 0;

            if (!navigator.onLine) {
                saveToOfflineQueue({
                    type: isUpdate ? 'updateStudent' : 'createStudent',
                    payload: studentData,
                    timestamp: new Date().toISOString()
                });
                set({ error: 'OFFLINE', loading: false });
                return;
            }

            const url = isUpdate ? `${API_URL}/${studentData.id}` : API_URL;
            const method = isUpdate ? 'PUT' : 'POST';
            const token = getAuthToken(get);

            const payload = {
                id: studentData.id || 0,
                lastName: studentData.lastName,
                firstName: studentData.firstName,
                email: studentData.email || "",
                birthDate: studentData.birthDate || new Date().toISOString().split('T')[0],
                cnp: studentData.cnp || "0000000000000",
                username: studentData.username || "",
                uniqueNumber: studentData.uniqueNumber || "",
                parentDad: studentData.parentDad || "",
                phoneDad: studentData.phoneDad || "",
                parentMom: studentData.parentMom || "",
                phoneMom: studentData.phoneMom || "",
                mentions: studentData.mentions || ""
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Eroare la salvare');

            await get().fetchStudents();
            set({ loading: false });

        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    deleteStudent: async (idToRemove) => {
        try {
            const token = getAuthToken(get);
            await fetch(`${API_URL}/${idToRemove}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await get().fetchStudents();
        } catch (error) {
            console.error(error);
        }
    },

    addGradeToStudent: async (studentId, subjectName, gradeValue) => {
        try {
            const token = getAuthToken(get);
            const response = await fetch(`${API_URL}/${studentId}/grades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subjectName: subjectName, gradeValue: String(gradeValue) })
            });
            if (response.ok) {
                await get().fetchStudents();
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    },

    removeGradeFromStudent: async (studentId, subjectName, gradeIndex) => {
        try {
            const token = getAuthToken(get);
            const response = await fetch(`${API_URL}/${studentId}/grades/${subjectName}/${gradeIndex}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                await get().fetchStudents();
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    },

    initSignalR: () => {
        if (signalRConnection) return;

        const token = getAuthToken(get);

        signalRConnection = new HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/generatorHub`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        signalRConnection.on("NewStudentAdded", () => {
            get().fetchStudents();
        });

        signalRConnection.start()
            .catch(err => console.error(err));
    },

    toggleGenerator: async (shouldStart) => {
        try {
            const token = getAuthToken(get);
            await fetch(`${API_URL}/toggle-generator`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isRunning: shouldStart })
            });
            set({ isGeneratorRunning: shouldStart });
        } catch (error) {
            console.error(error);
        }
    }
}));