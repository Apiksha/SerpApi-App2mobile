import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(process.env.DB_SSL_CA).toString(),
      },
    },
    logging: false,
  }
);

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Azure MySQL database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export default sequelize;
