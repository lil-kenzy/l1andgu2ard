/**
 * setAdmin.js — Promote an existing user to government_admin
 *
 * Usage (from project root):  node scripts/setAdmin.js [userId]
 * Usage (from scripts folder): node setAdmin.js [userId]
 *
 * Default userId: 69e2bac7d523decfdf65f7a6
 */

// Support running from either the project root or the scripts folder
require('dotenv').config({ path: '../.env' });
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../src/models/User');

// Default ObjectId to promote — replace with your own user ID or pass it as a CLI argument.
// Example: node scripts/setAdmin.js <yourUserId>
const DEFAULT_ADMIN_ID = '69e2bac7d523decfdf65f7a6';
const userId = process.argv[2] || DEFAULT_ADMIN_ID;

async function setAdmin() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('❌  MONGODB_URI is not set. Check your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('✅  Connected to MongoDB');

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`❌  Invalid ObjectId: "${userId}"`);
      process.exit(1);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          role: 'government_admin',
          isActive: true,
          isSuspended: false,
          'sellerInfo.verificationStatus': 'verified',
        },
      },
      { new: true }
    ).select('personalInfo role isActive isSuspended sellerInfo');

    if (!user) {
      console.error(`❌  No user found with id: ${userId}`);
      console.error('    Make sure the user has registered before running this script.');
      process.exit(1);
    }

    console.log('\n🎉  User promoted to government_admin successfully!');
    console.log('──────────────────────────────────────────────');
    console.log(`  Name  : ${user.personalInfo.fullName}`);
    console.log(`  Phone : ${user.personalInfo.phoneNumber}`);
    console.log(`  Role  : ${user.role}`);
    console.log(`  Active: ${user.isActive}`);
    console.log('──────────────────────────────────────────────\n');
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected from MongoDB');
  }
}

setAdmin().catch((err) => {
  console.error('❌  Unexpected error:', err.message);
  process.exit(1);
});
