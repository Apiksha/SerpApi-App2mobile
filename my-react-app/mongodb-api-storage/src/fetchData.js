import mongoose from 'mongoose';
import fs from 'fs';

const resultSchema = new mongoose.Schema({}, { strict: false });
const Result = mongoose.model('Result', resultSchema, 'results');

await mongoose.connect('mongodb+srv://serpApp2MobileAdminUser:O9UUuJQqQDppJpBx@serpapi.2f2jlfm.mongodb.net/?retryWrites=true&w=majority&appName=SerpApi');

const allResults = await Result.find({}).lean();

if (!allResults.length) {
  console.log('No data found.');
  process.exit(0);
}

const headers = Array.from(
  allResults.reduce((set, doc) => {
    Object.keys(doc).forEach(key => set.add(key));
    return set;
  }, new Set())
);

const csvRows = [
  headers.join(','),
  ...allResults.map(doc =>
    headers.map(field => {
      let value = doc[field];
      if (Array.isArray(value)) value = value.join('; ');
      if (typeof value === 'object' && value !== null) value = JSON.stringify(value);
      return `"${(value ?? '').toString().replace(/"/g, '""')}"`;
    }).join(',')
  )
];

fs.writeFileSync('data.csv', csvRows.join('\n'), 'utf8');
console.log('CSV file written as data.csv');

await mongoose.disconnect();