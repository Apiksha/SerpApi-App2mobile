import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Initialize Sequelize
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
        ca: fs.readFileSync(process.env.DB_SSL_CA).toString()
      }
    },
    logging: false
  }
);

// Define model
const Result = sequelize.define('Result', {
  title: DataTypes.STRING,
  latitude_and_longitude: DataTypes.STRING
}, {
  tableName: 'results',
  timestamps: true
});

const deleteAll = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Azure MySQL');

    const count = await Result.destroy({ where: {}, truncate: true });
    console.log(`🗑️ All records deleted from 'results' table.`);

    await sequelize.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Error deleting data:', error.message);
  }
};

deleteAll();
