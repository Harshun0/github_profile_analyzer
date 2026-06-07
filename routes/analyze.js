const express = require('express');
const { analyzeProfile } = require('../controllers/analyzeController');

const router = express.Router();

router.post('/:username', analyzeProfile);

module.exports = router;
