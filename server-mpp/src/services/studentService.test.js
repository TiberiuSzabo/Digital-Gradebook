const studentService = require('./studentService');
const studentRepository = require('../repository/studentRepository');

jest.mock('../repository/studentRepository');

describe('studentService - 100% Coverage Gold', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Calculations (gradeToNum & numToGrade)', () => {
        test('ar trebui să mapeze toate calificativele la numere și invers', () => {
            const grades = [
                { id: 1, subjects: [{ name: "Math", grades: ["FB"] }] }, // 4 -> FB
                { id: 2, subjects: [{ name: "Math", grades: ["B"] }] },  // 3 -> B
                { id: 3, subjects: [{ name: "Math", grades: ["S"] }] },  // 2 -> S
                { id: 4, subjects: [{ name: "Math", grades: ["I"] }] }   // 1 -> I
            ];

            studentRepository.getById
                .mockReturnValueOnce(grades[0])
                .mockReturnValueOnce(grades[1])
                .mockReturnValueOnce(grades[2])
                .mockReturnValueOnce(grades[3]);

            expect(studentService.getStudentById(1).finalGrade).toBe('FB');
            expect(studentService.getStudentById(2).finalGrade).toBe('B');
            expect(studentService.getStudentById(3).finalGrade).toBe('S');
            expect(studentService.getStudentById(4).finalGrade).toBe('I');
        });

        test('ar trebui să returneze I și obiect gol dacă studentul nu are materii sau subiecte', () => {
            const mockNoSubjects = { id: 1, lastName: "Test" }; // lipsește subjects array
            studentRepository.getById.mockReturnValue(mockNoSubjects);
            const result = studentService.getStudentById(1);
            expect(result.finalGrade).toBe('I');
        });
    });

    describe('CRUD Operations', () => {
        test('getStudentById - ar trebui să returneze null dacă studentul nu există', () => {
            studentRepository.getById.mockReturnValue(null);
            const result = studentService.getStudentById(999);
            expect(result).toBeNull();
        });

        test('createStudent - ar trebui să folosească subiectele trimise dacă există', () => {
            const customData = { lastName: "X", subjects: [{ name: "Sport", grades: ["FB"] }] };
            studentRepository.add.mockImplementation(d => d);
            const result = studentService.createStudent(customData);
            expect(result.subjects).toHaveLength(1);
            expect(result.subjects[0].name).toBe("Sport");
        });

        test('updateStudent - ar trebui să trimită datele la repository', () => {
            const data = { lastName: "Update" };
            studentRepository.update.mockReturnValue(data);
            const result = studentService.updateStudent(1, data);
            expect(result).toEqual(data);
        });

        test('deleteStudent - ar trebui să returneze rezultatul din repository', () => {
            studentRepository.delete.mockReturnValue(true);
            const result = studentService.deleteStudent(1);
            expect(result).toBe(true);
        });

        test('addGrade - ar trebui să arunce eroare dacă studentul nu există', () => {
            studentRepository.getById.mockReturnValue(null);
            expect(() => studentService.addGrade(999, "Math", "FB")).toThrow("Student not found");
        });

        test('addGrade - ar trebui să funcționeze corect pentru un caz valid', () => {
            const mockS = { id: 1, subjects: [{ name: "Math", grades: ["B"] }] };
            studentRepository.getById.mockReturnValue(mockS);
            studentRepository.update.mockReturnValue(mockS);

            const result = studentService.addGrade(1, "Math", "FB");
            expect(mockS.subjects[0].grades).toContain("FB");
            expect(studentRepository.update).toHaveBeenCalled();
        });
    });
});