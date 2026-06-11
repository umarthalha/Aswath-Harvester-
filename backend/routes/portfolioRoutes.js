const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

router.get('/', portfolioController.getAllPositions);
router.post('/', portfolioController.addPosition);
router.get('/summary', portfolioController.getPortfolioSummary);
router.put('/:id', portfolioController.updatePosition);
router.delete('/:id', portfolioController.deletePosition);

module.exports = router;
