// server-mpp/src/routes/generatorRoutes.js
const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');

router.post('/start', generatorController.startGenerator);
router.post('/stop', generatorController.stopGenerator);

module.exports = router;