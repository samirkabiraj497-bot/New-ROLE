const express = require('express');
const { getComparison } = require('../controllers/comparisonController');
const { getReviewAnalysis } = require('../controllers/reviewController');
const { getRecommendations } = require('../controllers/recommendationController');

const router = express.Router();

router.get('/:id/compare', getComparison);
router.get('/:id/quality', getReviewAnalysis);
router.post('/recommendations', getRecommendations);

module.exports = router;
