// src/services/studentService.js
const studentRepository = require('../repository/studentRepository');

// --- HELPERI PENTRU CONVERSIE (GOLD LOGIC) ---
const gradeToNum = (grade) => {
    const map = { 'FB': 4, 'B': 3, 'S': 2, 'I': 1 };
    return map[grade] || 0;
};

const numToGrade = (num) => {
    if (num >= 3.5) return 'FB';
    if (num >= 2.5) return 'B';
    if (num >= 1.5) return 'S';
    return 'I';
};

// --- LOGICA DE CALCUL MEDII ---
const processStudentStats = (student) => {
    if (!student.subjects || student.subjects.length === 0) {
        return { ...student, subjectMedias: {}, finalGrade: 'I' };
    }

    let sumOfSubjectAverages = 0;
    const subjectMedias = {};

    student.subjects.forEach(sub => {
        const numGrades = sub.grades.map(gradeToNum);
        const avg = numGrades.reduce((a, b) => a + b, 0) / numGrades.length;

        subjectMedias[sub.name] = {
            numeric: parseFloat(avg.toFixed(2)),
            letter: numToGrade(avg)
        };
        sumOfSubjectAverages += avg;
    });

    const generalAvg = sumOfSubjectAverages / student.subjects.length;

    return {
        ...student,
        subjectMedias,
        // Aceasta este media mediilor care va apărea în tabelul principal
        finalGrade: numToGrade(generalAvg),
        averageNumeric: parseFloat(generalAvg.toFixed(2))
    };
};

const studentService = {
    getStudentsPaginated: (page = 1, limit = 10) => {
        const allStudents = studentRepository.getAll();

        // Paginare
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRaw = allStudents.slice(startIndex, endIndex);

        // Procesăm fiecare student pentru a-i calcula mediile înainte de a-l trimite
        const dataWithStats = paginatedRaw.map(processStudentStats);

        return {
            data: dataWithStats,
            currentPage: parseInt(page),
            totalPages: Math.ceil(allStudents.length / limit),
            totalItems: allStudents.length
        };
    },

    getStudentById: (id) => {
        const student = studentRepository.getById(id);
        return student ? processStudentStats(student) : null;
    },

    createStudent: (studentData) => {
        // La creare, dacă nu trimitem subiecte, îi punem lista goală implicită
        const studentToSave = {
            ...studentData,
            subjects: studentData.subjects || [
                { name: "Math", grades: [] },
                { name: "English", grades: [] },
                { name: "Romanian", grades: [] },
                { name: "Biology", grades: [] },
                { name: "Physical Education", grades: [] },
                { name: "Visual Arts", grades: [] },
                { name: "Informatics", grades: [] },
                { name: "History", grades: [] }
            ]
        };
        return studentRepository.add(studentToSave);
    },

    updateStudent: (id, studentData) => {
        return studentRepository.update(id, studentData);
    },

    deleteStudent: (id) => {
        return studentRepository.delete(id);
    },

    // Funcție nouă pentru Gold: adăugarea unei note la o materie specifică
    // server-mpp/src/services/studentService.js

    addGrade: (studentId, subjectName, gradeValue) => {
        // 1. Găsește studentul (folosim Number pentru siguranță)
        const student = studentRepository.getById(Number(studentId));
        if (!student) throw new Error("Student not found");

        // 2. Găsește materia în interiorul obiectului student
        const subject = student.subjects.find(s => s.name === subjectName);
        if (!subject) throw new Error("Subject not found");

        // 3. ADĂUGARE NOTĂ (Push direct în referință)
        subject.grades.push(gradeValue);

        // 4. Update în "baza de date" (Repository)
        const updatedRaw = studentRepository.update(Number(studentId), student);

        // 5. RECALCULĂM STATISTICILE (fără asta, finalGrade rămâne vechi)
        const processed = processStudentStats(updatedRaw);

        console.log(`✅ Nota ${gradeValue} adăugată la ${subjectName} pentru ${student.lastName}`);
        return processed;
    }
};

module.exports = studentService;