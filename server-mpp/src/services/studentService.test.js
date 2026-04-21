// src/services/studentService.test.js
const studentService = require('./studentService');

describe('Student Service Unit Tests', () => {

    // --- TESTE PENTRU READ (GET) ---
    test('1. Paginarea funcționează corect (Server-Side Pagination)', () => {
        const result = studentService.getStudentsPaginated(1, 5);
        expect(result.data.length).toBe(5);
        expect(result.currentPage).toBe(1);
        expect(result.totalItems).toBeGreaterThan(5);
    });

    test('2. Poate returna un elev după ID', () => {
        const student = studentService.getStudentById(2); // Ionescu Maia
        expect(student.lastName).toBe('Ionescu');
    });

    test('3. Returnează undefined pentru un ID inexistent', () => {
        const student = studentService.getStudentById(999);
        expect(student).toBeUndefined();
    });

    // --- TESTE PENTRU VALIDĂRI ȘI CREATE (POST) ---
    test('4. Validarea pică dacă lipsește Numele de familie', () => {
        expect(() => {
            studentService.createStudent({ firstName: 'Ion', grade: 'FB' });
        }).toThrow('Last Name is required.');
    });

    test('5. Validarea pică dacă Nota este invalidă', () => {
        expect(() => {
            studentService.createStudent({ lastName: 'Popescu', firstName: 'Ion', grade: 'NOTA_FALSA' });
        }).toThrow('Grade must be FB, B, S, or I.');
    });

    test('6. Un elev valid este creat și adăugat în memorie', () => {
        const validStudent = { lastName: 'Eminescu', firstName: 'Mihai', grade: 'FB' };
        const newStudent = studentService.createStudent(validStudent);

        expect(newStudent).toHaveProperty('id');
        expect(newStudent.lastName).toBe('Eminescu');
        expect(newStudent.grade).toBe('FB');
    });

    // --- TESTE PENTRU UPDATE (PUT) ---
    test('7. Poate actualiza un elev existent', () => {
        const updateData = { lastName: 'Popescu-Modificat', firstName: 'Maria', grade: 'B' };
        const updatedStudent = studentService.updateStudent(1, updateData); // Modificăm elevul 1

        expect(updatedStudent.lastName).toBe('Popescu-Modificat');
        expect(updatedStudent.grade).toBe('B');
        expect(updatedStudent.id).toBe(1); // ID-ul trebuie să rămână același
    });

    test('8. Returnează null dacă încercăm să actualizăm un ID inexistent', () => {
        const updateData = { lastName: 'Fantoma', firstName: 'Casper', grade: 'S' };
        const updatedStudent = studentService.updateStudent(999, updateData);

        expect(updatedStudent).toBeNull();
    });

    // --- TESTE PENTRU DELETE (DELETE) ---
    test('9. Returnează false la ștergerea unui elev inexistent', () => {
        const success = studentService.deleteStudent(999);
        expect(success).toBe(false);
    });

    test('10. Poate șterge un elev existent', () => {
        // Ștergem elevul cu ID-ul 3 (Szabo Eduard)
        const success = studentService.deleteStudent(3);
        expect(success).toBe(true);

        // Verificăm că nu mai există în "baza de date"
        const deletedStudent = studentService.getStudentById(3);
        expect(deletedStudent).toBeUndefined();
    });

    test('getStudentsPaginated - ar trebui sa foloseasca parametrii default (page 1, limit 10)', () => {
        // Apelăm funcția FĂRĂ NICIUN ARGUMENT ca să forțăm Jest să intre pe "page = 1, limit = 10"
        const result = studentService.getStudentsPaginated();

        expect(result.currentPage).toBe(1);
        expect(result.data.length).toBeLessThanOrEqual(10);
    });

});
describe('studentService Validations (Edge Cases)', () => {
    // Înainte de fiecare test, golim repo-ul (dacă ai o funcție de clear)
    // Sau pur și simplu ne bazăm pe erorile aruncate de validare

    test('createStudent - should throw an error if lastName is missing', () => {
        const invalidStudent = { firstName: 'Ion', grade: 'FB' }; // Fără lastName

        expect(() => {
            studentService.createStudent(invalidStudent);
        }).toThrow("Last Name is required.");
    });

    test('createStudent - should throw an error if firstName is empty', () => {
        const invalidStudent = { lastName: 'Popescu', firstName: '   ', grade: 'B' };

        expect(() => {
            studentService.createStudent(invalidStudent);
        }).toThrow("First Name is required.");
    });

    test('createStudent - should throw an error if grade is invalid', () => {
        const invalidStudent = { lastName: 'Popescu', firstName: 'Ion', grade: 'X' }; // Notă greșită

        expect(() => {
            studentService.createStudent(invalidStudent);
        }).toThrow("Grade must be FB, B, S, or I.");
    });

    test('updateStudent - should throw multiple errors combined', () => {
        const invalidStudent = { lastName: '', firstName: '', grade: 'Y' };

        expect(() => {
            // Presupunem că vrem să dăm update elevului cu ID-ul '1'
            studentService.updateStudent('1', invalidStudent);
        }).toThrow("Last Name is required. First Name is required. Grade must be FB, B, S, or I.");
    });
});