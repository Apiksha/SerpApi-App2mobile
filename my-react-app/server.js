import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

import resultsRoutes from './sqlDatabase/src/routes/results.js';
import sequelize from './sqlDatabase/src/db/connection.js';
import './sqlDatabase/src/models/Result.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const environment = process.env.NODE_ENV || 'development';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/search', async (req, res) => {
  try {
    const { q, ll, page = 1 } = req.query;
    if (!q || !ll) {
      return res.status(400).json({ error: 'Both q (keyword) and ll (coordinates) are required' });
    }

    const start = (parseInt(page, 10) - 1) * 20;

    const apiKey = process.env.SERPAPI_KEY || '4442a4b9024ea830088270bc5f9632af4cd524e32c0876d7206aa472a67ff628';
    const apiUrl = `https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(q)}&ll=${encodeURIComponent(ll)}&start=${start}&api_key=${apiKey}`;

    console.log('Environment:', environment);
    console.log('Production mode:', isProduction);
    console.log('Fetching from SerpAPI:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpAPI Error Response:', errorText);
      throw new Error(`SerpAPI returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return res.json(data);

  } catch (err) {
    console.error('Detailed error:', err);
    return res.status(500).json({
      error: 'Failed to fetch results from SerpAPI',
      details: err.message,
      environment: environment,
      isProduction: isProduction
    });
  }
});

app.use('/api/results', resultsRoutes);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to MySQL database');
    return sequelize.sync();
  })
  .then(() => {
    console.log('✅ Sequelize models synced');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running in ${environment} mode on port ${PORT}`);
      console.log(`Production mode: ${isProduction}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to start server:', err.message);
  });
