// src/controllers/studentController.js
const studentService = require('../services/studentService');

const studentController = {
    getAll: (req, res) => {
        // Citim pagina din URL (ex: ?page=1&limit=10)
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;

        const result = studentService.getStudentsPaginated(page, limit);
        res.status(200).json(result);
    },

    getById: (req, res) => {
        const student = studentService.getStudentById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.status(200).json(student);
    },

    create: (req, res) => {
        try {
            const newStudent = studentService.createStudent(req.body);
            res.status(201).json(newStudent); // 201 înseamnă "Created"
        } catch (error) {
            res.status(400).json({ message: error.message }); // 400 înseamnă "Bad Request" (A picat validarea)
        }
    },

    update: (req, res) => {
        try {
            const updatedStudent = studentService.updateStudent(req.params.id, req.body);
            if (!updatedStudent) return res.status(404).json({ message: "Student not found" });
            res.status(200).json(updatedStudent);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    delete: (req, res) => {
        const success = studentService.deleteStudent(req.params.id);
        if (!success) return res.status(404).json({ message: "Student not found" });
        res.status(204).send(); // 204 înseamnă "No Content" (Șters cu succes)
    }
};

module.exports = studentController;