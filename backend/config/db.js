const mongoose = require('mongoose');


async function connectDB() {
const uri = process.env.MONGO_URI;
if (!uri) {
console.error('❌ MONGO_URI missing in .env');
process.exit(1);
}
try {
await mongoose.connect(uri, {
serverSelectionTimeoutMS: 10000,
});
console.log('✅ MongoDB connected');
} catch (err) {
console.error('❌ Mongo error:', err.message);
process.exit(1);
}
}


module.exports = { connectDB };