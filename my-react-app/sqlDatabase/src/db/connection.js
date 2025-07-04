import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

let sslOptions = {};

// ✅ If you have a CA cert path, use it
if (process.env.DB_SSL_CA) {
  sslOptions = {
    ssl: {
      ca: fs.readFileSync(process.env.DB_SSL_CA).toString(),
      rejectUnauthorized: false   // disables strict check for self-signed
    }
  };
} else {
  // ✅ Fallback: disable cert verification to skip self-signed error
  sslOptions = {
    ssl: {
      rejectUnauthorized: false
    }
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: sslOptions,
    logging: false,
  }
);

export default sequelize;
