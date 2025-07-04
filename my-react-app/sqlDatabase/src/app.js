import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import resultsRoutes from './routes/results.js';
import sequelize from './db/connection.js';
import './models/Result.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to MySQL database');

    return sequelize.sync();
  })
  .then(() => {
    console.log('✅ Sequelize models synced');

    app.use('/api/results', resultsRoutes);

    const PORT = process.env.PORTS || 7000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err.message);
  });
