const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scannerController');

router.get('/stocks', scannerController.scanStocks);
router.get('/presets', scannerController.getSavedPresets);
router.post('/presets', scannerController.savePreset);
router.delete('/presets/:id', scannerController.deletePreset);

module.exports = router;
