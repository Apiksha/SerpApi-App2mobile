import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes must come FIRST, before static file handling
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  const apiUrl = `https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(query)}&api_key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Static file serving comes AFTER API routes
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route must be LAST
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${environment} mode on port ${PORT}`);
  console.log(`Production mode: ${isProduction}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});