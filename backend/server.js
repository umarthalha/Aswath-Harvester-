const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize background automated daemon threads
require('./jobs/refreshMarketDataJob');
require('./jobs/liveMarketTickerJob');

// Feature Route Layout Mappings
const stockRoutes = require('./routes/stockRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const compoundingRoutes = require('./routes/compoundingRoutes');
const marketRoutes = require('./routes/marketRoutes');
const scannerRoutes = require('./routes/scannerRoutes');
const dematRoutes = require('./routes/dematRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();

// Connect to Database
connectDB();

// Global Security Infrastructure Middleware
app.use(helmet());
app.use(express.json());

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Secure API Rate Limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Server Core Health Verification Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date()
  });
});

// Mounted App Feature Gateways
app.use('/api/stocks', stockRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/compounding', compoundingRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/demat', dematRoutes);
app.use('/api/demat/alerts', alertRoutes);

// Fallback Unmapped Route Error Boundary Handling
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server executing in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
