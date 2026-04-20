// src/services/studentService.js
const studentRepository = require('../repository/studentRepository');

// Funcție de validare (Server-Side Validation)
const validateStudent = (data) => {
    const errors = [];
    if (!data.lastName || data.lastName.trim() === '') errors.push("Last Name is required.");
    if (!data.firstName || data.firstName.trim() === '') errors.push("First Name is required.");
    if (!['FB', 'B', 'S', 'I'].includes(data.grade)) errors.push("Grade must be FB, B, S, or I.");

    // Poți adăuga și restul validărilor (CNP, email) exact ca în React
    if (errors.length > 0) {
        throw new Error(errors.join(" ")); // Aruncăm o excepție dacă datele sunt proaste
    }
};

const studentService = {
    // Paginare
    getStudentsPaginated: (page = 1, limit = 10) => {
        const allStudents = studentRepository.getAll();
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedStudents = allStudents.slice(startIndex, endIndex);

        return {
            data: paginatedStudents,
            currentPage: parseInt(page),
            totalPages: Math.ceil(allStudents.length / limit),
            totalItems: allStudents.length
        };
    },

    getStudentById: (id) => {
        return studentRepository.getById(id);
    },

    createStudent: (studentData) => {
        validateStudent(studentData); // Validăm ÎNAINTE să salvăm
        return studentRepository.add(studentData);
    },

    updateStudent: (id, studentData) => {
        validateStudent(studentData); // Validăm ÎNAINTE să modificăm
        return studentRepository.update(id, studentData);
    },

    deleteStudent: (id) => {
        return studentRepository.delete(id);
    }
};

module.exports = studentService;