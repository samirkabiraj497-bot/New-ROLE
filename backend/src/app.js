const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// TODO: add routes and error handling middleware

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/comparisons', comparisonRoutes);

const errorHandler = require('./middleware/error');

// Catch-all route for unknown endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

module.exports = app;
