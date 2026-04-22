import { create } from 'zustand';
import { gql } from '@apollo/client';
import { client } from '../main.jsx';

// --- DEFINIM TOATE MUTAȚIILE GRAPHQL (100% AMBITIOUS) ---

const ADD_GRADE_MUTATION = gql`
  mutation AddGrade($studentId: ID!, $subjectName: String!, $gradeValue: String!) {
    addGrade(studentId: $studentId, subjectName: $subjectName, gradeValue: $gradeValue) {
      id lastName finalGrade averageNumeric subjects { name grades }
    }
  }
`;

const REMOVE_GRADE_MUTATION = gql`
  mutation RemoveGrade($studentId: ID!, $subjectName: String!, $gradeIndex: Int!) {
    removeGrade(studentId: $studentId, subjectName: $subjectName, gradeIndex: $gradeIndex) {
      id averageNumeric finalGrade subjects { name grades }
    }
  }
`;

const CREATE_STUDENT_MUTATION = gql`
    mutation CreateStudent($input: StudentInput!) {
        createStudent(input: $input) {
            id lastName firstName email birthDate cnp finalGrade averageNumeric subjects { name grades }
        }
    }
`;

const UPDATE_STUDENT_MUTATION = gql`
    mutation UpdateStudent($id: ID!, $input: StudentInput!) {
        updateStudent(id: $id, input: $input) {
            id lastName firstName email birthDate cnp finalGrade averageNumeric subjects { name grades }
        }
    }
`;

const DELETE_STUDENT_MUTATION = gql`
    mutation DeleteStudent($id: ID!) {
        deleteStudent(id: $id)
    }
`;

// --- HELPER FUNCȚII PENTRU OFFLINE QUEUE (SILVER) ---
const getOfflineQueue = () => JSON.parse(localStorage.getItem('offlineQueue') || '[]');
const saveToOfflineQueue = (action) => {
    const queue = getOfflineQueue();
    queue.push(action);
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
};

// Helper pentru a formata datele strict cum le vrea GraphQL
const formatStudentInput = (data) => ({
    lastName: data.lastName,
    firstName: data.firstName,
    email: data.email || "",
    birthDate: data.birthDate || "",
    cnp: data.cnp || "",
    username: data.username || "",
    uniqueNumber: data.uniqueNumber || "",
    parentDad: data.parentDad || "",
    parentMom: data.parentMom || "",
    mentions: data.mentions || ""
});

// -- STORE-UL ZUSTAND --
export const useStudentStore = create((set, get) => ({
    students: [],
    loading: false,
    error: null,
    isGeneratorRunning: false,

    currentPage: 1,
    totalPages: 1,
    hasMore: true,

    // --- 1. FETCH STUDENTS (GRAPHQL & INFINITE SCROLL) ---
    fetchStudentsGraphQL: async (page = 1, limit = 15) => {
        try {
            const { client } = await import('../main.jsx');

            const GET_STUDENTS = gql`
                query GetStudents($page: Int, $limit: Int) {
                    students(page: $page, limit: $limit) {
                        data {
                            id lastName firstName email birthDate cnp username uniqueNumber
                            parentDad parentMom mentions finalGrade averageNumeric
                            subjects { name grades }
                        }
                        currentPage totalPages totalItems
                    }
                }
            `;

            const { data } = await client.query({
                query: GET_STUDENTS,
                variables: { page, limit },
                fetchPolicy: 'network-only'
            });

            const result = data.students;

            set((state) => ({
                students: page === 1 ? result.data : [...state.students, ...result.data],
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                hasMore: result.currentPage < result.totalPages
            }));

        } catch (error) {
            console.error("Eroare GraphQL la fetch elevi:", error);
        }
    },

    // --- 2. ADD GRADE (GRAPHQL) ---
    addGradeToStudent: async (studentId, subjectName, gradeValue) => {
        try {
            const { data } = await client.mutate({
                mutation: ADD_GRADE_MUTATION,
                variables: { studentId, subjectName, gradeValue }
            });

            const updatedStudent = data.addGrade;
            set((state) => ({
                students: state.students.map(s => String(s.id) === String(studentId) ? { ...s, ...updatedStudent } : s)
            }));
            return true;
        } catch (error) {
            console.error("Eroare GraphQL la adăugare notă:", error);
            return false;
        }
    },

    // --- 3. REMOVE GRADE (GRAPHQL) ---
    removeGradeFromStudent: async (studentId, subjectName, gradeIndex) => {
        try {
            const { data } = await client.mutate({
                mutation: REMOVE_GRADE_MUTATION,
                variables: { studentId, subjectName, gradeIndex }
            });

            const updatedStudent = data.removeGrade;
            set((state) => ({
                students: state.students.map(s => String(s.id) === String(studentId) ? { ...s, ...updatedStudent } : s)
            }));
            return true;
        } catch (error) {
            console.error("Eroare GraphQL la ștergere notă:", error);
            return false;
        }
    },

    // --- 4. SAVE STUDENT (GRAPHQL + OFFLINE FALLBACK) ---
    saveStudent: async (studentData) => {
        set({ loading: true, error: null });
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            const { client } = await import('../main.jsx');
            const input = formatStudentInput(studentData);

            if (studentData.id) {
                await client.mutate({ mutation: UPDATE_STUDENT_MUTATION, variables: { id: studentData.id, input } });
            } else {
                await client.mutate({ mutation: CREATE_STUDENT_MUTATION, variables: { input } });
            }

            await get().fetchStudentsGraphQL(1);
            set({ loading: false });

        } catch (error) {
            if (error.message === 'OFFLINE' || error.message.includes('Failed to fetch')) {
                const isUpdate = !!studentData.id;
                const tempId = studentData.id || `temp-${Date.now()}`;

                saveToOfflineQueue({ type: isUpdate ? 'UPDATE' : 'CREATE', payload: { ...studentData, id: tempId } });

                set((state) => ({
                    students: isUpdate
                        ? state.students.map(s => String(s.id) === String(tempId) ? { ...s, ...studentData, id: tempId } : s)
                        : [...state.students, { ...studentData, id: tempId, subjects: [] }],
                    loading: false
                }));
                alert("Ești offline. Datele au fost salvate local și se vor sincroniza când revine conexiunea.");
            } else {
                set({ error: error.message, loading: false });
            }
        }
    },

    // --- 5. DELETE STUDENT (GRAPHQL + OFFLINE FALLBACK) ---
    deleteStudent: async (idToRemove) => {
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            const { client } = await import('../main.jsx');

            await client.mutate({ mutation: DELETE_STUDENT_MUTATION, variables: { id: idToRemove } });
            await get().fetchStudentsGraphQL(1);

        } catch (error) {
            if (error.message === 'OFFLINE' || error.message.includes('Failed to fetch')) {
                saveToOfflineQueue({ type: 'DELETE', payload: idToRemove });
                set((state) => ({ students: state.students.filter(s => String(s.id) !== String(idToRemove)) }));
                alert("Elevul a fost șters local. Se va sincroniza cu serverul mai târziu.");
            }
        }
    },

    // --- 6. SMART SYNC OFFLINE DATA (100% GRAPHQL) ---
    syncOfflineData: async () => {
        const queue = getOfflineQueue();
        if (queue.length === 0) return;

        localStorage.removeItem('offlineQueue');
        console.log(`🔄 Sincronizăm ${queue.length} acțiuni offline via GraphQL...`);

        const finalActions = new Map();
        for (const action of queue) {
            const studentId = action.type === 'DELETE' ? action.payload : action.payload.id;
            if (action.type === 'CREATE') {
                finalActions.set(studentId, { type: 'CREATE', data: action.payload });
            } else if (action.type === 'UPDATE') {
                if (finalActions.has(studentId)) {
                    const existing = finalActions.get(studentId);
                    finalActions.set(studentId, {
                        type: existing.type === 'CREATE' ? 'CREATE' : 'UPDATE',
                        data: { ...existing.data, ...action.payload }
                    });
                } else {
                    finalActions.set(studentId, { type: 'UPDATE', data: action.payload });
                }
            } else if (action.type === 'DELETE') {
                if (finalActions.has(studentId) && finalActions.get(studentId).type === 'CREATE') {
                    finalActions.delete(studentId);
                } else {
                    finalActions.set(studentId, { type: 'DELETE', data: studentId });
                }
            }
        }

        let hasSynced = false;
        const { client } = await import('../main.jsx');

        for (const [id, action] of finalActions.entries()) {
            try {
                if (action.type === 'CREATE') {
                    await client.mutate({ mutation: CREATE_STUDENT_MUTATION, variables: { input: formatStudentInput(action.data) } });
                    hasSynced = true;
                } else if (action.type === 'UPDATE') {
                    await client.mutate({ mutation: UPDATE_STUDENT_MUTATION, variables: { id, input: formatStudentInput(action.data) } });
                    hasSynced = true;
                } else if (action.type === 'DELETE') {
                    await client.mutate({ mutation: DELETE_STUDENT_MUTATION, variables: { id } });
                    hasSynced = true;
                }
            } catch (e) {
                console.error(`❌ Eroare GraphQL la sincronizarea ${action.type}:`, e);
            }
        }

        if (hasSynced) {
            await get().fetchStudentsGraphQL(1);
            alert("Sincronizare Smart finalizată prin GraphQL!");
        }
    },

    // --- 7. WEBSOCKETS SI GENERATOR ---
    addStudentLive: (newStudent) => {
        set((state) => ({ students: [...state.students, newStudent] }));
    },

    toggleGenerator: async (shouldStart) => {
        set({ isGeneratorRunning: shouldStart });
        try {
            await fetch(shouldStart ? `http://localhost:3000/api/generator/start` : `http://localhost:3000/api/generator/stop`, { method: 'POST' });
        } catch (error) {
            set({ isGeneratorRunning: !shouldStart });
        }
    }
}));