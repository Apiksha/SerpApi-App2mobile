import { DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

const Result = sequelize.define('Result', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude_and_longitude: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ratings: DataTypes.STRING,
  review: DataTypes.STRING,
  type: DataTypes.STRING,
  types: DataTypes.TEXT,
  type_id: DataTypes.STRING,
  address: DataTypes.TEXT,
  operating_hours: DataTypes.TEXT,
  phone: DataTypes.STRING,
  website: DataTypes.TEXT,
  service_options: DataTypes.TEXT,
  popular_for: DataTypes.TEXT,
  highlights: DataTypes.TEXT,
  offerings: DataTypes.TEXT,
  dining_options: DataTypes.TEXT,
  amenities: DataTypes.TEXT,
  atmosphere: DataTypes.TEXT,
  crowd: DataTypes.TEXT,
  payments: DataTypes.TEXT,
  parking: DataTypes.TEXT,
  pets: DataTypes.TEXT,
  reserve_a_table: DataTypes.TEXT,
  order_online: DataTypes.TEXT,
}, {
  tableName: 'results',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['title', 'latitude_and_longitude'],
    }
  ]
});

export default Result;
