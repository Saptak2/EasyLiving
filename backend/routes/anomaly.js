const express = require('express');
const router = express.Router();
const { detectAnomaly } = require('../controllers/anomalyController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, detectAnomaly);

module.exports = router;