const express = require('express');
const { searchProducts, getProduct } = require('../controllers/productController');

const router = express.Router();

router.get('/search', searchProducts);
router.get('/:id', getProduct);

module.exports = router;
