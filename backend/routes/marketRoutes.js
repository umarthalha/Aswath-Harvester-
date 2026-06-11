const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

router.get('/nifty', marketController.getNiftyIndexStatus);
router.get('/stock/:symbol', marketController.getStockAnalysisMetrics);

module.exports = router;
