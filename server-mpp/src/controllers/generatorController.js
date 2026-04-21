// server-mpp/src/controllers/generatorController.js
const { faker } = require('@faker-js/faker');
const studentService = require('../services/studentService');

let intervalId = null; // Aici ținem minte dacă bucla merge sau nu

exports.startGenerator = (req, res) => {
    // Dacă e deja pornit, nu-l lăsăm să pornească de două ori
    if (intervalId) {
        return res.status(400).json({ message: "Generatorul rulează deja!" });
    }

    const io = req.io; // Luăm instanța de WebSockets (portavocea) din request

    // Păcălim sistemul și pornim bucla (o dată la 3 secunde)
    intervalId = setInterval(() => {
        const fakeStudent = {
            lastName: faker.person.lastName(),
            firstName: faker.person.firstName(),
            // Alegem o notă random din cele permise
            grade: faker.helpers.arrayElement(['FB', 'B', 'S', 'I'])
        };

        try {
            // 1. Salvăm elevul fals în memoria serverului folosind Service-ul existent
            const newStudent = studentService.createStudent(fakeStudent);

            // 2. MAGIA SILVER: Strigăm pe WebSockets către TOATE browserele conectate
            io.emit('student_added', newStudent);

            console.log(`🤖 Generator: S-a adăugat elevul ${newStudent.lastName} ${newStudent.firstName}`);
        } catch (error) {
            console.error("Eroare la generare:", error.message);
        }
    }, 3000); // 3000 milisecunde = 3 secunde

    res.status(200).json({ message: "Generatorul a pornit cu succes!" });
};

exports.stopGenerator = (req, res) => {
    if (intervalId) {
        clearInterval(intervalId); // Oprim bucla
        intervalId = null;
        console.log('🛑 Generatorul a fost oprit.');
        return res.status(200).json({ message: "Generatorul s-a oprit." });
    }
    res.status(400).json({ message: "Generatorul nu era pornit." });
};