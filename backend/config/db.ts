import mongoose, { ConnectOptions } from 'mongoose';

const MONGO_OPTIONS: ConnectOptions = {
  serverSelectionTimeoutMS: 15000,
  retryWrites: true,
};

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async (): Promise<void> => {
  // Post-connect error listener — catches SSL drops and other runtime errors
  mongoose.connection.on('error', (err: Error) => {
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
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }
      await mongoose.connect(mongoUri, MONGO_OPTIONS);
      console.log('[MongoDB] Connected successfully.');
      return; // success — exit the function
    } catch (error) {
      const err = error as Error;
      console.error(`[MongoDB] Attempt ${attempt} failed: ${err.message}`);

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

export default connectDB;
