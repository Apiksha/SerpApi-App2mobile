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
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  const apiKey = 'b639b0f8af5028f0761f98f096b7620f85e712bb1211675610b9e98e992946a1';

  try {
    const response = await fetch(
      `https://serpapi.com/search?engine=google_maps&q=${encodeURIComponent(query)}&api_key=${apiKey}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching SerpAPI:', err);
    res.status(500).json({ error: 'Failed to fetch results from SerpAPI' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});