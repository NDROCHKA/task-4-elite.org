const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI is not set. The website is available, but database features are offline.');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
  }
}

module.exports = connectDatabase;
