import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexuscraft';

const migratePasswords = async () => {
  try {
    console.log('🔒 Connecting to MongoDB for password migration...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected.');

    const users = await User.find({});
    let migratedCount = 0;
    let alreadySecureCount = 0;

    for (const user of users) {
      if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
        alreadySecureCount++;
      } else if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        migratedCount++;
      }
    }

    console.log(`\n🎉 Password Migration Completed Successfully:`);
    console.log(`  - Total Accounts Inspected: ${users.length}`);
    console.log(`  - Plaintext Accounts Migrated to BCrypt (Cost 12): ${migratedCount}`);
    console.log(`  - Accounts Already BCrypt Encrypted: ${alreadySecureCount}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

migratePasswords();
