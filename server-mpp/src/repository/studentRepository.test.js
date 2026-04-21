const studentRepository = require('./studentRepository');

describe('studentRepository - 100% Coverage', () => {

    test('getAll - returnează lista completă', () => {
        const all = studentRepository.getAll();
        expect(Array.isArray(all)).toBe(true);
    });

    test('getById - returnează studentul sau undefined', () => {
        expect(studentRepository.getById(1)).toBeDefined();
        expect(studentRepository.getById(9999)).toBeUndefined();
    });

    test('add - adaugă și incrementează ID-ul', () => {
        const initialCount = studentRepository.getAll().length;
        const student = studentRepository.add({ lastName: "New" });
        expect(student.id).toBeGreaterThan(0);
        expect(studentRepository.getAll().length).toBe(initialCount + 1);
    });

    test('update - modifică datele sau returnează null dacă nu găsește', () => {
        const updated = studentRepository.update(1, { lastName: "Schimbat" });
        expect(updated.lastName).toBe("Schimbat");

        const fail = studentRepository.update(9999, { lastName: "NuExista" });
        expect(fail).toBeNull();
    });

    test('delete - elimină studentul și returnează succes', () => {
        const student = studentRepository.add({ lastName: "DeSters" });
        const id = student.id;

        const success = studentRepository.delete(id);
        expect(success).toBe(true);
        expect(studentRepository.getById(id)).toBeUndefined();

        const fail = studentRepository.delete(9999);
        expect(fail).toBe(false);
    });
});