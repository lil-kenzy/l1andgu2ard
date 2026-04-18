/**
 * initDb.js — Create all required MongoDB indexes for LANDGUARD
 *
 * Usage (from project root):  node scripts/initDb.js
 * Usage (from scripts folder): node initDb.js
 */

// Support running from either the project root or the scripts folder
require('dotenv').config({ path: '../.env' });
require('dotenv').config();

const mongoose = require('mongoose');

const INDEXES = [
  // properties collection
  {
    collection: 'properties',
    index: { geometry: '2dsphere' },
    options: {},
    label: 'properties.geometry (2dsphere)',
  },
  {
    collection: 'properties',
    index: { ghanaPostGPSAddress: 'text' },
    options: {},
    label: 'properties.ghanaPostGPSAddress (text)',
  },
  {
    collection: 'properties',
    index: { status: 1, createdAt: -1 },
    options: {},
    label: 'properties.{ status, createdAt }',
  },

  // users collection
  {
    collection: 'users',
    index: { 'personalInfo.ghanaCardNumber': 1 },
    options: {},
    label: 'users.personalInfo.ghanaCardNumber',
  },
  {
    collection: 'users',
    index: { 'personalInfo.phoneNumber': 1 },
    options: {},
    label: 'users.personalInfo.phoneNumber',
  },
  {
    collection: 'users',
    index: { location: '2dsphere' },
    options: { sparse: true },
    label: 'users.location (2dsphere)',
  },

  // messages collection
  {
    collection: 'messages',
    index: { conversationId: 1 },
    options: {},
    label: 'messages.conversationId',
  },
  {
    collection: 'messages',
    index: { senderId: 1, receiverId: 1 },
    options: {},
    label: 'messages.{ senderId, receiverId }',
  },

  // auditlogs collection
  {
    collection: 'auditlogs',
    index: { createdAt: -1 },
    options: {},
    label: 'auditlogs.createdAt',
  },
];

// MongoDB driver error codes for index conflicts
const INDEX_OPTIONS_CONFLICT = 85;
const INDEX_KEY_SPECS_CONFLICT = 86;

async function initDb() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('❌  MONGODB_URI is not set. Check your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('✅  Connected to MongoDB\n');

    const db = mongoose.connection.db;

    for (const { collection, index, options, label } of INDEXES) {
      try {
        await db.collection(collection).createIndex(index, options);
        console.log(`  ✔  Created index: ${label}`);
      } catch (err) {
        // Code 85 = IndexOptionsConflict, 86 = IndexKeySpecsConflict — already exists with same keys
        if (err.code === INDEX_OPTIONS_CONFLICT || err.code === INDEX_KEY_SPECS_CONFLICT) {
          console.log(`  ℹ  Index already exists (skipped): ${label}`);
        } else {
          console.error(`  ✖  Failed to create index [${label}]:`, err.message);
        }
      }
    }

    console.log('\n🎉  Database initialization complete!\n');
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected from MongoDB');
  }
}

initDb().catch((err) => {
  console.error('❌  Unexpected error:', err.message);
  process.exit(1);
});
