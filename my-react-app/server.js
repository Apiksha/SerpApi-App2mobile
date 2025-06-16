import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Define the /search route first before static files
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const apiKey = 'b639b0f8af5028f0761f98f096b7620f85e712bb1211675610b9e98e992946a1';
  const apiUrl = `https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(query)}&api_key=${apiKey}`;

  try {
    console.log('Fetching from SerpAPI:', apiUrl);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`SerpAPI returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('SerpAPI response received');
    res.json(data);
  } catch (err) {
    console.error('Error fetching SerpAPI:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch results from SerpAPI',
      details: err.message 
    });
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});