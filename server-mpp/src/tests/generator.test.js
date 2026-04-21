// server-mpp/src/tests/generator.test.js
const request = require('supertest');
const express = require('express');

// Mock-uim Faker ca să ocolim erorile de ES Modules
jest.mock('@faker-js/faker', () => ({
    faker: {
        person: {
            lastName: () => 'NumeFals',
            firstName: () => 'PrenumeFals'
        },
        helpers: {
            arrayElement: () => 'FB'
        }
    }
}));

const generatorController = require('../controllers/generatorController');

const app = express();
app.use(express.json());

const mockIo = {
    emit: jest.fn()
};

app.use((req, res, next) => {
    req.io = mockIo;
    next();
});

app.post('/api/generator/start', generatorController.startGenerator);
app.post('/api/generator/stop', generatorController.stopGenerator);

describe('Generator Controller API (Silver Challenge)', () => {

    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    afterEach(() => {
        // Creăm un mock manual pentru res ca stopGenerator să nu crape
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Apelăm cu obiectele de care are nevoie (req, res)
        generatorController.stopGenerator({}, mockRes);

        mockIo.emit.mockClear();
    });

    test('POST /api/generator/start - ar trebui să pornească generatorul', async () => {
        const res = await request(app).post('/api/generator/start');

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Generatorul a pornit cu succes!");

        jest.advanceTimersByTime(3500);

        expect(mockIo.emit).toHaveBeenCalledTimes(1);
        expect(mockIo.emit).toHaveBeenCalledWith('student_added', expect.any(Object));
    });

    test('POST /api/generator/start - ar trebui să dea eroare dacă e deja pornit', async () => {
        await request(app).post('/api/generator/start');
        const res = await request(app).post('/api/generator/start');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Generatorul rulează deja!");
    });

    test('POST /api/generator/stop - ar trebui să oprească generatorul', async () => {
        await request(app).post('/api/generator/start');
        const res = await request(app).post('/api/generator/stop');

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Generatorul s-a oprit.");
    });

    test('POST /api/generator/stop - ar trebui să dea eroare dacă nu e pornit', async () => {
        const res = await request(app).post('/api/generator/stop');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Generatorul nu era pornit.");
    });

    test('Generator ar trebui să prindă eroarea dacă studentService.createStudent crapă', async () => {
        const studentService = require('../services/studentService');
        // Forțăm o eroare în service
        jest.spyOn(studentService, 'createStudent').mockImplementationOnce(() => {
            throw new Error("Simulated Error");
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await request(app).post('/api/generator/start');
        jest.advanceTimersByTime(3500);

        expect(consoleSpy).toHaveBeenCalledWith("Eroare la generare:", "Simulated Error");
        consoleSpy.mockRestore();
    });
});