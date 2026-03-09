const express = require('express');
const router = express.Router();
const RationController = require('../controllers/RationController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/stock', protect, authorize('Govt'), RationController.createStock);
router.post('/ration', protect, authorize('Shop'), RationController.issueRation);
router.get('/all', protect, RationController.getAllAssets);
// router.get('/history/:id', RationController.getHistory);

module.exports = router;
