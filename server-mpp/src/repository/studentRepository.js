// src/repository/studentRepository.js

// Aceasta este "Baza noastră de date" ținută doar în memoria RAM (Array)
let students = [
    {
        id: 1, lastName: "Popa", firstName: "Maria", grade: "FB", email: "maria.p@student.ro",
        birthDate: "12/05/2015", cnp: "6150512410011", username: "MariaP2015", uniqueNumber: "7Y148510",
        parentDad: "Popa Viorel", parentMom: "Popa Elena", mentions: "A very diligent student with great attention to detail."
    },
    {
        id: 2, lastName: "Ionescu", firstName: "Maia", grade: "B", email: "maia.i@student.ro",
        birthDate: "23/08/2015", cnp: "6150823410022", username: "MaiaI", uniqueNumber: "7Y148511",
        parentDad: "Ionescu Dan", parentMom: "Ionescu Carmen", mentions: "Maia is making rapid progress in mathematics."
    },
    {
        id: 3, lastName: "Szabo", firstName: "Eduard", grade: "S", email: "eduard.s@student.ro",
        birthDate: "05/02/2016", cnp: "5160205410033", username: "EdiSz", uniqueNumber: "7Y148512",
        parentDad: "Szabo Levente", parentMom: "Szabo Ionela", mentions: "Eduard needs to focus more on his reading skills."
    },
    {
        id: 4, lastName: "Pop", firstName: "Tiberiu", grade: "I", email: "tiberiu.p@student.ro",
        birthDate: "14/11/2015", cnp: "5151114410044", username: "TibiP", uniqueNumber: "7Y148513",
        parentDad: "Pop Ovidiu", parentMom: "Pop Maria", mentions: "Tiberiu requires additional support with his writing."
    },
    {
        id: 5, lastName: "Negru", firstName: "Denisa", grade: "FB", email: "denisa.n@student.ro",
        birthDate: "29/03/2016", cnp: "6160329410055", username: "DeniN", uniqueNumber: "7Y148514",
        parentDad: "Negru Marin", parentMom: "Negru Adina", mentions: "A bright presence in the classroom and very active."
    },
    {
        id: 6, lastName: "Dumbravean", firstName: "Ionela", grade: "B", email: "ionela.d@student.ro",
        birthDate: "01/07/2015", cnp: "6150701410066", username: "IonelaD", uniqueNumber: "7Y148515",
        parentDad: "Dumbravean Ioan", parentMom: "Dumbravean Ana", mentions: "Ionela draws beautifully during breaks."
    },
    {
        id: 7, lastName: "Vasilescu", firstName: "Andrei", grade: "S", email: "andrei.v@student.ro",
        birthDate: "18/09/2015", cnp: "5150918410077", username: "AndreiV", uniqueNumber: "7Y148516",
        parentDad: "Vasilescu George", parentMom: "Vasilescu Mirela", mentions: "Andrei has started to participate more during lessons."
    },
    {
        id: 8, lastName: "Munteanu", firstName: "Alina", grade: "FB", email: "alina.m@student.ro",
        birthDate: "10/10/2015", cnp: "6151010410088", username: "AlinaM", uniqueNumber: "7Y148517",
        parentDad: "Munteanu Paul", parentMom: "Munteanu Silvia", mentions: "Alina is the leader of the project team."
    },
    {
        id: 9, lastName: "Radu", firstName: "Florin", grade: "S", email: "florin.r@student.ro",
        birthDate: "22/01/2016", cnp: "5160122410099", username: "FlorinR", uniqueNumber: "7Y148518",
        parentDad: "Radu Cristian", parentMom: "Radu Ioana", mentions: "Florin's efforts are clearly visible in history class."
    },
    {
        id: 10, lastName: "Georgescu", firstName: "Ana", grade: "FB", email: "ana.g@student.ro",
        birthDate: "15/04/2016", cnp: "6160415410100", username: "AnaGeo", uniqueNumber: "7Y148519",
        parentDad: "Georgescu Mihai", parentMom: "Georgescu Dana", mentions: "Ana excels in all subjects this semester."
    },
    {
        id: 11, lastName: "Stanescu", firstName: "Bogdan", grade: "B", email: "bogdan.s@student.ro",
        birthDate: "03/12/2015", cnp: "5151203410111", username: "BogdanS", uniqueNumber: "7Y148520",
        parentDad: "Stanescu Alex", parentMom: "Stanescu Raluca", mentions: "Bogdan is a very fair and reliable teammate."
    },
    {
        id: 12, lastName: "Dumitrescu", firstName: "Elena", grade: "FB", email: "elena.d@student.ro",
        birthDate: "19/06/2015", cnp: "6150619410122", username: "ElenaD", uniqueNumber: "7Y148521",
        parentDad: "Dumitrescu Lucian", parentMom: "Dumitrescu Vera", mentions: "Elena has a very rich vocabulary for her age."
    },
    {
        id: 13, lastName: "Popescu", firstName: "Radu", grade: "I", email: "radu.p@student.ro",
        birthDate: "27/02/2016", cnp: "5160227410133", username: "RaduP", uniqueNumber: "7Y148522",
        parentDad: "Popescu Matei", parentMom: "Popescu Laura", mentions: "Radu needs to practice the multiplication table more often."
    },
    {
        id: 14, lastName: "Ionescu", firstName: "Andreea", grade: "S", email: "andreea.i@student.ro",
        birthDate: "11/05/2015", cnp: "6150511410144", username: "AndreeaI", uniqueNumber: "7Y148523",
        parentDad: "Ionescu Radu", parentMom: "Ionescu Gina", mentions: "Andreea is shy, but she is making wonderful progress."
    },
    {
        id: 15, lastName: "Vasilescu", firstName: "Ioana", grade: "B", email: "ioana.v@student.ro",
        birthDate: "30/08/2015", cnp: "6150830410155", username: "IoanaV", uniqueNumber: "7Y148524",
        parentDad: "Vasilescu Sorin", parentMom: "Vasilescu Monica", mentions: "Ioana is very creative during music lessons."
    }
];

// Generator de ID-uri (pentru cand adaugam un elev nou)
let nextId = 16;

const studentRepository = {
    // 1. READ ALL
    getAll: () => {
        return students;
    },

    // 2. READ BY ID
    getById: (id) => {
        return students.find(s => s.id === parseInt(id));
    },

    // 3. CREATE
    add: (studentData) => {
        const newStudent = { id: nextId++, ...studentData };
        students.push(newStudent);
        return newStudent;
    },

    // 4. UPDATE
    update: (id, updatedData) => {
        const index = students.findIndex(s => s.id === parseInt(id));
        if (index === -1) return null; // Nu am gasit elevul

        // Actualizăm păstrând ID-ul original
        students[index] = { ...students[index], ...updatedData, id: parseInt(id) };
        return students[index];
    },

    // 5. DELETE
    delete: (id) => {
        const initialLength = students.length;
        students = students.filter(s => s.id !== parseInt(id));
        return students.length < initialLength; // Returnează true dacă s-a șters cu succes
    }
};

module.exports = studentRepository;