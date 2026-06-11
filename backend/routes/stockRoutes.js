const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/', stockController.getAllWatchlist);
router.post('/', stockController.addToWatchlist);
router.put('/:id', stockController.updateChecklistScore);
router.delete('/:id', stockController.removeFromWatchlist);
router.get('/:symbol/price', stockController.getLiveStockPrice);

module.exports = router;
