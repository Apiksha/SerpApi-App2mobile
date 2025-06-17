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

// Update CORS configuration to be more permissive in production
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const apiKey = process.env.SERPAPI_KEY || 'b639b0f8af5028f0761f98f096b7620f85e712bb1211675610b9e98e992946a1';
    const apiUrl = `https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(q)}&api_key=${apiKey}`;

    console.log('Environment:', environment);
    console.log('Production mode:', isProduction);
    console.log('Fetching from SerpAPI:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
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
    console.log('SerpAPI response received successfully');
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

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${environment} mode on port ${PORT}`);
  console.log(`Production mode: ${isProduction}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});