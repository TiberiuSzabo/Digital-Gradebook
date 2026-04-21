// src/repository/studentRepository.js

let students = [
    {
        id: 1, lastName: "Popa", firstName: "Maria", email: "maria.p@student.ro",
        birthDate: "12/05/2015", cnp: "6150512410011", username: "MariaP2015", uniqueNumber: "7Y148510",
        parentDad: "Popa Viorel", parentMom: "Popa Elena", mentions: "A very diligent student.",
        subjects: [
            { name: "Math", grades: ["FB", "FB", "B"] },
            { name: "English", grades: ["FB", "FB"] },
            { name: "Romanian", grades: ["FB", "B", "FB"] },
            { name: "Biology", grades: ["FB"] },
            { name: "Physical Education", grades: ["FB", "FB"] },
            { name: "Visual Arts", grades: ["FB"] },
            { name: "Informatics", grades: ["FB", "FB"] },
            { name: "History", grades: ["B", "FB"] }
        ]
    },
    {
        id: 2, lastName: "Ionescu", firstName: "Maia", email: "maia.i@student.ro",
        birthDate: "23/08/2015", cnp: "6150823410022", username: "MaiaI", uniqueNumber: "7Y148511",
        parentDad: "Ionescu Dan", parentMom: "Ionescu Carmen", mentions: "Making rapid progress.",
        subjects: [
            { name: "Math", grades: ["B", "B", "FB"] },
            { name: "English", grades: ["B", "FB"] },
            { name: "Romanian", grades: ["B", "B"] },
            { name: "Biology", grades: ["B"] },
            { name: "Physical Education", grades: ["FB"] },
            { name: "Visual Arts", grades: ["B", "B"] },
            { name: "Informatics", grades: ["B", "FB"] },
            { name: "History", grades: ["B"] }
        ]
    },
    {
        id: 3, lastName: "Szabo", firstName: "Eduard", email: "eduard.s@student.ro",
        birthDate: "05/02/2016", cnp: "5160205410033", username: "EdiSz", uniqueNumber: "7Y148512",
        parentDad: "Szabo Levente", parentMom: "Szabo Ionela", mentions: "Needs to focus more.",
        subjects: [
            { name: "Math", grades: ["S", "S", "B"] },
            { name: "English", grades: ["S", "B"] },
            { name: "Romanian", grades: ["S", "S"] },
            { name: "Biology", grades: ["S"] },
            { name: "Physical Education", grades: ["B"] },
            { name: "Visual Arts", grades: ["S", "S"] },
            { name: "Informatics", grades: ["S", "B"] },
            { name: "History", grades: ["S"] }
        ]
    },
    {
        id: 4, lastName: "Pop", firstName: "Tiberiu", email: "tiberiu.p@student.ro",
        birthDate: "14/11/2015", cnp: "5151114410044", username: "TibiP", uniqueNumber: "7Y148513",
        parentDad: "Pop Ovidiu", parentMom: "Pop Maria", mentions: "Requires additional support.",
        subjects: [
            { name: "Math", grades: ["I", "I", "S"] },
            { name: "English", grades: ["I", "S"] },
            { name: "Romanian", grades: ["I", "I"] },
            { name: "Biology", grades: ["I"] },
            { name: "Physical Education", grades: ["S"] },
            { name: "Visual Arts", grades: ["I", "I"] },
            { name: "Informatics", grades: ["I", "S"] },
            { name: "History", grades: ["I"] }
        ]
    },
    {
        id: 5, lastName: "Negru", firstName: "Denisa", email: "denisa.n@student.ro",
        subjects: [
            { name: "Math", grades: ["FB", "FB"] }, { name: "English", grades: ["FB"] },
            { name: "Romanian", grades: ["FB", "FB"] }, { name: "Biology", grades: ["FB"] },
            { name: "Physical Education", grades: ["FB"] }, { name: "Visual Arts", grades: ["FB"] },
            { name: "Informatics", grades: ["FB", "FB"] }, { name: "History", grades: ["FB"] }
        ]
    },
    {
        id: 6, lastName: "Dumbravean", firstName: "Ionela", email: "ionela.d@student.ro",
        subjects: [
            { name: "Math", grades: ["B", "FB"] }, { name: "English", grades: ["B"] },
            { name: "Romanian", grades: ["B", "B"] }, { name: "Biology", grades: ["FB"] },
            { name: "Physical Education", grades: ["FB"] }, { name: "Visual Arts", grades: ["FB", "FB"] },
            { name: "Informatics", grades: ["B"] }, { name: "History", grades: ["B"] }
        ]
    },
    {
        id: 7, lastName: "Vasilescu", firstName: "Andrei", email: "andrei.v@student.ro",
        subjects: [
            { name: "Math", grades: ["S", "B"] }, { name: "English", grades: ["S"] },
            { name: "Romanian", grades: ["S", "S"] }, { name: "Biology", grades: ["B"] },
            { name: "Physical Education", grades: ["B"] }, { name: "Visual Arts", grades: ["B"] },
            { name: "Informatics", grades: ["S", "S"] }, { name: "History", grades: ["S"] }
        ]
    },
    {
        id: 8, lastName: "Munteanu", firstName: "Alina", email: "alina.m@student.ro",
        subjects: [
            { name: "Math", grades: ["FB", "FB"] }, { name: "English", grades: ["FB", "FB"] },
            { name: "Romanian", grades: ["FB"] }, { name: "Biology", grades: ["FB"] },
            { name: "Physical Education", grades: ["FB"] }, { name: "Visual Arts", grades: ["FB"] },
            { name: "Informatics", grades: ["FB", "FB"] }, { name: "History", grades: ["FB"] }
        ]
    },
    {
        id: 9, lastName: "Radu", firstName: "Florin", email: "florin.r@student.ro",
        subjects: [
            { name: "Math", grades: ["S", "S"] }, { name: "English", grades: ["S", "B"] },
            { name: "Romanian", grades: ["S"] }, { name: "Biology", grades: ["S"] },
            { name: "Physical Education", grades: ["B"] }, { name: "Visual Arts", grades: ["S"] },
            { name: "Informatics", grades: ["S", "S"] }, { name: "History", grades: ["S"] }
        ]
    },
    {
        id: 10, lastName: "Georgescu", firstName: "Ana", email: "ana.g@student.ro",
        subjects: [
            { name: "Math", grades: ["FB", "FB"] }, { name: "English", grades: ["FB"] },
            { name: "Romanian", grades: ["FB", "B"] }, { name: "Biology", grades: ["FB"] },
            { name: "Physical Education", grades: ["FB"] }, { name: "Visual Arts", grades: ["FB"] },
            { name: "Informatics", grades: ["FB", "FB"] }, { name: "History", grades: ["FB"] }
        ]
    },
    {
        id: 11, lastName: "Stanescu", firstName: "Bogdan", email: "bogdan.s@student.ro",
        subjects: [
            { name: "Math", grades: ["B", "B"] }, { name: "English", grades: ["B", "S"] },
            { name: "Romanian", grades: ["B"] }, { name: "Biology", grades: ["B"] },
            { name: "Physical Education", grades: ["FB"] }, { name: "Visual Arts", grades: ["B"] },
            { name: "Informatics", grades: ["B", "B"] }, { name: "History", grades: ["B"] }
        ]
    },
    {
        id: 12, lastName: "Dumitrescu", firstName: "Elena", email: "elena.d@student.ro",
        subjects: [
            { name: "Math", grades: ["FB", "FB"] }, { name: "English", grades: ["FB"] },
            { name: "Romanian", grades: ["FB", "FB"] }, { name: "Biology", grades: ["FB"] },
            { name: "Physical Education", grades: ["FB"] }, { name: "Visual Arts", grades: ["FB"] },
            { name: "Informatics", grades: ["FB", "FB"] }, { name: "History", grades: ["FB"] }
        ]
    },
    {
        id: 13, lastName: "Popescu", firstName: "Radu", email: "radu.p@student.ro",
        subjects: [
            { name: "Math", grades: ["I", "I"] }, { name: "English", grades: ["I"] },
            { name: "Romanian", grades: ["I", "S"] }, { name: "Biology", grades: ["I"] },
            { name: "Physical Education", grades: ["S"] }, { name: "Visual Arts", grades: ["I"] },
            { name: "Informatics", grades: ["I", "I"] }, { name: "History", grades: ["I"] }
        ]
    },
    {
        id: 14, lastName: "Ionescu", firstName: "Andreea", email: "andreea.i@student.ro",
        subjects: [
            { name: "Math", grades: ["S", "S"] }, { name: "English", grades: ["S", "B"] },
            { name: "Romanian", grades: ["S"] }, { name: "Biology", grades: ["S"] },
            { name: "Physical Education", grades: ["B"] }, { name: "Visual Arts", grades: ["S"] },
            { name: "Informatics", grades: ["S", "S"] }, { name: "History", grades: ["S"] }
        ]
    },
    {
        id: 15, lastName: "Vasilescu", firstName: "Ioana", email: "ioana.v@student.ro",
        subjects: [
            { name: "Math", grades: ["B", "B"] }, { name: "English", grades: ["B"] },
            { name: "Romanian", grades: ["B", "FB"] }, { name: "Biology", grades: ["B"] },
            { name: "Physical Education", grades: ["FB"] }, { name: "Visual Arts", grades: ["FB"] },
            { name: "Informatics", grades: ["B", "B"] }, { name: "History", grades: ["B"] }
        ]
    }
];

let nextId = 16;

const studentRepository = {
    getAll: () => students,
    getById: (id) => students.find(s => s.id === parseInt(id)),
    add: (studentData) => {
        const newStudent = { id: nextId++, ...studentData };
        students.push(newStudent);
        return newStudent;
    },
    update: (id, updatedData) => {
        const index = students.findIndex(s => s.id === parseInt(id));
        if (index === -1) return null;
        students[index] = { ...students[index], ...updatedData, id: parseInt(id) };
        return students[index];
    },
    delete: (id) => {
        const initialLength = students.length;
        students = students.filter(s => s.id !== parseInt(id));
        return students.length < initialLength;
    }
};

module.exports = studentRepository;