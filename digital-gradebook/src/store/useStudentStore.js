// digital-gradebook/src/store/useStudentStore.js
import { create } from 'zustand';

const API_URL = 'http://localhost:3000/api/students';
const GENERATOR_URL = 'http://localhost:3000/api/generator';

// Funcții ajutătoare pentru buzunarul Offline (LocalStorage)
const getOfflineQueue = () => JSON.parse(localStorage.getItem('offlineQueue')) || [];
const saveToOfflineQueue = (action) => {
    const queue = getOfflineQueue();
    queue.push(action);
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
};

export const useStudentStore = create((set) => ({
    students: [],
    loading: false,
    error: null,
    isGeneratorRunning: false,

    fetchStudents: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`${API_URL}?page=1&limit=100`);
            if (!response.ok) throw new Error('Eroare fetch');
            const result = await response.json();
            set({ students: result.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    saveStudent: async (studentData) => {
        set({ loading: true, error: null });
        try {
            if (!navigator.onLine) throw new Error('OFFLINE'); // Forțăm blocul catch dacă n-avem net

            if (studentData.id) {
                await fetch(`${API_URL}/${studentData.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studentData)
                });
            } else {
                await fetch(API_URL, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studentData)
                });
            }
            const store = useStudentStore.getState();
            await store.fetchStudents();

        } catch (error) {
            // --- OFFLINE FALLBACK ---
            if (error.message === 'OFFLINE' || error.message === 'Failed to fetch') {
                console.log("🌐 Ești offline. Salvăm acțiunea local.");
                const isUpdate = !!studentData.id;
                const tempId = studentData.id || `temp-${Date.now()}`;

                saveToOfflineQueue({
                    type: isUpdate ? 'UPDATE' : 'CREATE',
                    payload: { ...studentData, id: tempId }
                });

                // Actualizăm interfața grafică imediat, ca profu' să nu simtă că e offline
                set((state) => ({
                    students: isUpdate
                        ? state.students.map(s => s.id === tempId ? { ...studentData, id: tempId } : s)
                        : [...state.students, { ...studentData, id: tempId }],
                    loading: false
                }));
                alert("Ești offline. Datele au fost salvate local și se vor sincroniza când revine conexiunea.");
            } else {
                set({ error: error.message, loading: false });
            }
        }
    },

    deleteStudent: async (idToRemove) => {
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            await fetch(`${API_URL}/${idToRemove}`, { method: 'DELETE' });
            const store = useStudentStore.getState();
            await store.fetchStudents();
        } catch (error) {
            // --- OFFLINE FALLBACK ---
            if (error.message === 'OFFLINE' || error.message === 'Failed to fetch') {
                saveToOfflineQueue({ type: 'DELETE', payload: idToRemove });
                set((state) => ({
                    students: state.students.filter(s => s.id !== idToRemove)
                }));
                alert("Elevul a fost șters local. Se va sincroniza cu serverul mai târziu.");
            }
        }
    },

    // --- FUNCȚIA DE SINCRONIZARE CÂND REVINE NETUL ---
    // --- FUNCȚIA DE SINCRONIZARE CÂND REVINE NETUL (FULL CRUD) ---
    // --- FUNCȚIA DE SINCRONIZARE SMART (COMPACTARE COADĂ) ---
    syncOfflineData: async () => {
        const queue = getOfflineQueue();
        if (queue.length === 0) return;

        // Golim buzunarul imediat
        localStorage.removeItem('offlineQueue');
        console.log(`🔄 Analizăm ${queue.length} acțiuni offline...`);

        // 1. COMPACTĂM COADA (Action Folding)
        // Calculăm starea finală a fiecărui elev ca să nu trimitem request-uri inutile
        const finalActions = new Map();

        for (const action of queue) {
            const studentId = action.type === 'DELETE' ? action.payload : action.payload.id;

            if (action.type === 'CREATE') {
                finalActions.set(studentId, { type: 'CREATE', data: action.payload });
            }
            else if (action.type === 'UPDATE') {
                if (finalActions.has(studentId)) {
                    const existing = finalActions.get(studentId);
                    if (existing.type === 'CREATE') {
                        // A fost creat și editat tot offline -> actualizăm doar pachetul de CREATE
                        finalActions.set(studentId, { type: 'CREATE', data: { ...existing.data, ...action.payload } });
                    } else {
                        // A fost editat de mai multe ori -> suprascriem editarea
                        finalActions.set(studentId, { type: 'UPDATE', data: { ...existing.data, ...action.payload } });
                    }
                } else {
                    // E un elev vechi (cu ID real) pe care doar l-am editat
                    finalActions.set(studentId, { type: 'UPDATE', data: action.payload });
                }
            }
            else if (action.type === 'DELETE') {
                if (finalActions.has(studentId)) {
                    const existing = finalActions.get(studentId);
                    if (existing.type === 'CREATE') {
                        // MAGIC: Creat offline și șters tot offline -> Îl ștergem din memorie complet!
                        finalActions.delete(studentId);
                    } else {
                        // Modificat offline apoi șters -> Rămâne doar comanda de ștergere
                        finalActions.set(studentId, { type: 'DELETE', data: studentId });
                    }
                } else {
                    finalActions.set(studentId, { type: 'DELETE', data: studentId });
                }
            }
        }

        let hasSynced = false;

        // 2. TRIMITEM LA SERVER DOAR ACȚIUNILE FINALE, CURĂȚATE
        for (const [id, action] of finalActions.entries()) {
            try {
                if (action.type === 'CREATE') {
                    const { id: tempId, ...dataToPost } = action.data; // Scoatem id-ul temp
                    const res = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataToPost)
                    });
                    if (res.ok) hasSynced = true;
                }
                else if (action.type === 'UPDATE') {
                    const res = await fetch(`${API_URL}/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(action.data)
                    });
                    if (res.ok) hasSynced = true;
                }
                else if (action.type === 'DELETE') {
                    const res = await fetch(`${API_URL}/${id}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) hasSynced = true;
                }
            } catch (e) {
                console.error(`❌ Eroare la trimiterea ${action.type}:`, e);
            }
        }

        if (hasSynced) {
            // Aducem lista oficială și fresh de la server
            const store = useStudentStore.getState();
            await store.fetchStudents();
            alert("Sincronizare Smart finalizată! Baza de date este la zi.");
        }
    },

    addStudentLive: (newStudent) => {
        set((state) => ({ students: [...state.students, newStudent] }));
    },

    toggleGenerator: async (shouldStart) => {
        set({ isGeneratorRunning: shouldStart });
        try {
            await fetch(shouldStart ? `${GENERATOR_URL}/start` : `${GENERATOR_URL}/stop`, { method: 'POST' });
        } catch (error) {
            set({ isGeneratorRunning: !shouldStart });
        }
    }
}));