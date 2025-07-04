import { Sequelize, DataTypes } from 'sequelize';
import fs from 'fs';
import dotenv from 'dotenv';

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
        ca: fs.readFileSync('./DigiCertGlobalRootCA.crt.pem').toString()
      }
    },
    logging: false
  }
);

const Result = sequelize.define('Result', {
  title: DataTypes.STRING,
  latitude_and_longitude: DataTypes.STRING,
  ratings: DataTypes.STRING,
  review: DataTypes.STRING,
  type: DataTypes.STRING,
  types: DataTypes.STRING,
  type_id: DataTypes.STRING,
  address: DataTypes.STRING,
  operating_hours: DataTypes.STRING,
  phone: DataTypes.STRING,
  website: DataTypes.STRING,
  service_options: DataTypes.STRING,
  popular_for: DataTypes.STRING,
  highlights: DataTypes.STRING,
  offerings: DataTypes.STRING,
  dining_options: DataTypes.STRING,
  amenities: DataTypes.STRING,
  atmosphere: DataTypes.STRING,
  crowd: DataTypes.STRING,
  payments: DataTypes.STRING,
  parking: DataTypes.STRING,
  pets: DataTypes.STRING,
  reserve_a_table: DataTypes.STRING,
  order_online: DataTypes.STRING
}, {
  tableName: 'results',
  timestamps: true
});

const exportToCSV = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Azure MySQL');

    const results = await Result.findAll({ raw: true });

    if (results.length === 0) {
      console.log('⚠️ No results found in database.');
      return;
    }

    const headers = Object.keys(results[0]);
    const csvRows = [
      headers.join(','),
      ...results.map(row =>
        headers.map(field => {
          let value = row[field];
          if (Array.isArray(value)) value = value.join('; ');
          else if (typeof value === 'object' && value !== null) value = JSON.stringify(value);
          else if (value === null || value === undefined) value = '';
          return `"${value.toString().replace(/"/g, '""')}"`; // escape double quotes
        }).join(',')
      )
    ];

    fs.writeFileSync('data.csv', csvRows.join('\n'), 'utf8');
    console.log('✅ Data exported to results.csv');

    await sequelize.close();
  } catch (err) {
    console.error('❌ Error exporting:', err.message);
  }
};

exportToCSV();
