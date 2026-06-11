const express = require('express');
const router = express.Router();
const dematController = require('../controllers/dematController');

router.get('/accounts', dematController.getAccounts);
router.post('/accounts', dematController.createAccount);
router.put('/accounts/:id', dematController.updateAccount);
router.delete('/accounts/:id', dematController.deleteAccount);

router.get('/holdings', dematController.getHoldings);
router.post('/holdings', dematController.addHolding);
router.put('/holdings/:id', dematController.updateHolding);
router.delete('/holdings/:id', dematController.deleteHolding);
router.post('/holdings/import', dematController.bulkCSVImportHoldings);

router.post('/sell', dematController.sellHoldingPosition);
router.post('/refresh', dematController.forceTriggerManualPricingSync);
router.get('/summary', dematController.getUnifiedPortfolioSummary);
router.get('/summary/:accountId', dematController.getUnifiedPortfolioSummary);

module.exports = router;
