require('dotenv').config({ override: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const analyzeRoutes = require('./routes/analyze');
const profilesRoutes = require('./routes/profiles');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'GitHub Profile Analyzer API is running.' });
});

app.use('/api/analyze', analyzeRoutes);
app.use('/api/profiles', profilesRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`GitHub Profile Analyzer API listening on port ${PORT}`);
});

module.exports = app;
