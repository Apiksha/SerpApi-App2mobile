import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({}, { strict: false });
const Result = mongoose.model('Result', resultSchema, 'results');

await mongoose.connect('mongodb+srv://serpApp2MobileAdminUser:O9UUuJQqQDppJpBx@serpapi.2f2jlfm.mongodb.net/?retryWrites=true&w=majority&appName=SerpApi');

const res = await Result.deleteMany({});
console.log(`Deleted ${res.deletedCount} documents from the collection.`);

await mongoose.disconnect();