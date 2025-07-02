import express from 'express';
import mongoose from 'mongoose';
import resultsRoutes from './routes/results.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

mongoose.connect('mongodb+srv://serpApp2MobileAdminUser:O9UUuJQqQDppJpBx@serpapi.2f2jlfm.mongodb.net/?retryWrites=true&w=majority&appName=SerpApi');

app.use('/api/results', resultsRoutes);

app.listen(7000, () => {
  console.log('Server running on http://localhost:7000');
});