const mongoose = require('mongoose');

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 15000,
  retryWrites: true,
};

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  // Post-connect error listener — catches SSL drops and other runtime errors
  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Runtime connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected from database.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Reconnected to database.');
  });

  // Retry loop — up to MAX_ATTEMPTS before giving up
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[MongoDB] Connection attempt ${attempt}/${MAX_ATTEMPTS}…`);
      await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
      console.log('[MongoDB] Connected successfully.');
      return; // success — exit the function
    } catch (error) {
      console.error(`[MongoDB] Attempt ${attempt} failed: ${error.message}`);

      if (attempt < MAX_ATTEMPTS) {
        console.log(`[MongoDB] Retrying in ${RETRY_DELAY_MS / 1000}s…`);
        await sleep(RETRY_DELAY_MS);
      } else {
        console.error('[MongoDB] All connection attempts exhausted. Exiting.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
