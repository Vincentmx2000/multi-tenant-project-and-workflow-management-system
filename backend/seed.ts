/**
 * backend/seed.ts
 *
 * Standalone database seed script.
 * Run with:  npx tsx seed.ts   (from the backend/ directory)
 *
 * Safe to re-run — skips any company or user that already exists.
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose, { ConnectOptions } from 'mongoose';
import bcrypt from 'bcryptjs';
import Company from './models/Company';
import User from './models/User';
import { Role } from './types';

// ─── Connection helpers ───────────────────────────────────────────────────────
const MONGO_OPTIONS: ConnectOptions = {
  serverSelectionTimeoutMS: 15000,
  retryWrites: true,
};
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (): Promise<void> => {
  mongoose.connection.on('error', (err: Error) =>
    console.error('[MongoDB] Runtime connection error:', err.message)
  );

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[MongoDB] Connection attempt ${attempt}/${MAX_ATTEMPTS}…`);
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI is not defined');
      }
      await mongoose.connect(uri, MONGO_OPTIONS);
      console.log('[MongoDB] Connected successfully.');
      return;
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

// ─── Seed data ────────────────────────────────────────────────────────────────
const COMPANY_NAME = 'Seed Test Co';
const PASSWORD_PLAIN = 'test1234';

interface SeedUser {
  name: string;
  email: string;
  role: Role;
}

const SEED_USERS: SeedUser[] = [
  { name: 'Owner User',   email: 'owner@seed.com',   role: 'Owner'   },
  { name: 'Admin User',   email: 'admin@seed.com',   role: 'Admin'   },
  { name: 'Manager User', email: 'manager@seed.com', role: 'Manager' },
  { name: 'Member User',  email: 'member@seed.com',  role: 'Member'  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
const seed = async (): Promise<void> => {
  // 1. Connect to MongoDB
  await connectWithRetry();
  console.log('');

  // 2. Company — create or reuse
  let company = await Company.findOne({ name: COMPANY_NAME });
  if (company) {
    console.log(`[SKIP]    Company already exists: "${COMPANY_NAME}" (id: ${company._id})`);
  } else {
    company = await Company.create({ name: COMPANY_NAME });
    console.log(`[CREATED] Company: "${company.name}" (id: ${company._id})`);
  }

  // 3. Hash password once — same cost factor (10) as the register flow
  const hashedPassword = await bcrypt.hash(PASSWORD_PLAIN, 10);

  // 4. Users — create or skip per email
  console.log('');
  for (const { name, email, role } of SEED_USERS) {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`[SKIP]    User already exists: ${email} (role: ${existing.role})`);
      continue;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      companyId: company._id,
      role,
    });

    console.log(`[CREATED] User: ${user.email}  role: ${user.role}  id: ${user._id}`);
  }

  // 5. Done
  console.log('\nSeed complete.');
  console.log(`\nLogin credentials for all seed users:`);
  console.log(`  Password : ${PASSWORD_PLAIN}`);
  console.log(`  Company ID (for Register page): ${company._id}\n`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
