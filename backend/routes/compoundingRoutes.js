const express = require('express');
const router = express.Router();
const compoundingController = require('../controllers/compoundingController');

router.get('/', compoundingController.getAllLogs);
router.post('/', compoundingController.addLogEntry);
router.get('/stats', compoundingController.getCompoundingStats);

module.exports = router;
