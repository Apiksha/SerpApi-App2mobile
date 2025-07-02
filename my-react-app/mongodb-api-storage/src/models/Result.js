import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  title: { type: String, required: true },
  latitude_and_longitude: { type: String, required: true },
  ratings: { type: String },
  review: { type: String },
  type: { type: String },
  types: { type: String },
  type_id: { type: String },
  address: { type: String },
  operating_hours: { type: String },
  phone: { type: String },
  website: { type: String },
  service_options: { type: String },
  popular_for: { type: String },
  highlights: { type: String },
  offerings: { type: String },
  dining_options: { type: String },
  amenities: { type: String },
  atmosphere: { type: String },
  crowd: { type: String },
  payments: { type: String },
  parking: { type: String },
  pets: { type: String },
  reserve_a_table: { type: String },
  order_online: { type: String }
});

const Result = mongoose.model('Result', resultSchema);

export default Result;