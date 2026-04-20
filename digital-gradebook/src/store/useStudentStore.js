// digital-gradebook/src/store/useStudentStore.js
import { create } from 'zustand';

// URL-ul backend-ului nostru
const API_URL = 'http://localhost:3000/api/students';

export const useStudentStore = create((set) => ({
    students: [],
    loading: false,
    error: null,

    // 1. Funcția care aduce datele de la server (READ)
    fetchStudents: async () => {
        set({ loading: true, error: null });
        try {
            // Aici cerem pagina 1 cu limita 100 pentru simplitate in prima faza
            const response = await fetch(`${API_URL}?page=1&limit=100`);
            if (!response.ok) throw new Error('Nu am putut aduce studenții de la server');

            const result = await response.json();
            // result are forma { data: [...], currentPage: 1, totalPages: 2, totalItems: 15 }
            set({ students: result.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error("Eroare la fetchStudents:", error);
        }
    },

    // 2. Funcția de CREATE / UPDATE
    saveStudent: async (studentData) => {
        set({ loading: true, error: null });
        try {
            if (studentData.id) {
                // UPDATE (PUT)
                const response = await fetch(`${API_URL}/${studentData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(studentData)
                });
                if (!response.ok) throw new Error('Eroare la actualizarea studentului');
            } else {
                // CREATE (POST)
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(studentData)
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Eroare la adăugarea studentului');
                }
            }

            // Reîncărcăm datele de la server după o modificare de succes
            const store = useStudentStore.getState();
            await store.fetchStudents();

        } catch (error) {
            set({ error: error.message, loading: false });
            alert(error.message); // Afisam eroarea catre user (ex: a picat validarea de server)
            console.error("Eroare la saveStudent:", error);
        }
    },

    // 3. Funcția de DELETE
    deleteStudent: async (idToRemove) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`${API_URL}/${idToRemove}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Eroare la ștergerea studentului');

            // Reîncărcăm lista de la server
            const store = useStudentStore.getState();
            await store.fetchStudents();
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error("Eroare la deleteStudent:", error);
        }
    }
}));