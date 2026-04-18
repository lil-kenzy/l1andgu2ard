/**
 * seed.js — Seed development test data for LANDGUARD
 *
 * Usage (from project root):  node scripts/seed.js
 * Usage (from scripts folder): node seed.js
 *
 * This script is idempotent — running it multiple times is safe.
 * It will NOT run in production (NODE_ENV=production).
 */

// Support running from either the project root or the scripts folder
require('dotenv').config({ path: '../.env' });
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Property = require('../src/models/Property');

if (process.env.NODE_ENV === 'production') {
  console.error('❌  Seed script must not be run in production!');
  process.exit(1);
}

// ─── Sample data ────────────────────────────────────────────────────────────

const TEST_BUYER = {
  role: 'buyer',
  personalInfo: {
    fullName: 'Kofi Mensah',
    ghanaCardNumber: 'GHA-000000001-0',
    phoneNumber: '+233200000001',
    email: 'kofi.mensah@example.com',
  },
  password: 'Test1234!',
  isActive: true,
  isVerified: true,
};

const TEST_SELLER = {
  role: 'seller',
  personalInfo: {
    fullName: 'Ama Owusu',
    ghanaCardNumber: 'GHA-000000002-0',
    phoneNumber: '+233200000002',
    email: 'ama.owusu@example.com',
  },
  sellerInfo: {
    businessRegNumber: 'BRN-TEST-001',
    tin: 'TIN-TEST-001',
    physicalAddress: 'Osu, Accra, Ghana',
    verificationStatus: 'verified',
  },
  password: 'Test1234!',
  isActive: true,
  isVerified: true,
};

// Sample properties in Accra, Ghana (GeoJSON Point coordinates: [lng, lat])
const SAMPLE_PROPERTIES = [
  {
    title: 'Prime Land Plot — East Legon',
    description: 'A 500 sqm plot in the prestigious East Legon area, close to schools and shopping.',
    price: 350000,
    currency: 'GHS',
    propertyType: 'land',
    transactionType: 'sale',
    location: {
      address: 'East Legon, Accra',
      region: 'Greater Accra',
      district: 'Accra Metropolitan',
      coordinates: [-0.1559, 5.6441],
    },
    geometry: {
      type: 'Point',
      coordinates: [-0.1559, 5.6441],
    },
    size: 500,
    sizeUnit: 'sqm',
    status: 'active',
    isVerified: true,
  },
  {
    title: '3-Bedroom House — Tema',
    description: 'Well-maintained 3-bedroom house with spacious compound in Tema Community 1.',
    price: 580000,
    currency: 'GHS',
    propertyType: 'house',
    transactionType: 'sale',
    location: {
      address: 'Community 1, Tema',
      region: 'Greater Accra',
      district: 'Tema Metropolitan',
      coordinates: [-0.0167, 5.6698],
    },
    geometry: {
      type: 'Point',
      coordinates: [-0.0167, 5.6698],
    },
    size: 180,
    sizeUnit: 'sqm',
    status: 'active',
    isVerified: true,
  },
  {
    title: 'Commercial Plot — Accra CBD',
    description: 'Strategic 1000 sqm commercial plot in the Accra central business district.',
    price: 1200000,
    currency: 'GHS',
    propertyType: 'commercial',
    transactionType: 'sale',
    location: {
      address: 'Central Business District, Accra',
      region: 'Greater Accra',
      district: 'Accra Metropolitan',
      coordinates: [-0.1969, 5.5502],
    },
    geometry: {
      type: 'Point',
      coordinates: [-0.1969, 5.5502],
    },
    size: 1000,
    sizeUnit: 'sqm',
    status: 'active',
    isVerified: false,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function upsertUser(data) {
  const phone = data.personalInfo.phoneNumber;
  const exists = await User.findOne({ 'personalInfo.phoneNumber': phone });
  if (exists) {
    console.log(`  ℹ  User already exists (skipped): ${data.personalInfo.fullName}`);
    return exists;
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, password: hashedPassword });
  console.log(`  ✔  Created user: ${user.personalInfo.fullName} [${user.role}]`);
  return user;
}

async function upsertProperty(data, sellerId) {
  const exists = await Property.findOne({ title: data.title });
  if (exists) {
    console.log(`  ℹ  Property already exists (skipped): ${data.title}`);
    return exists;
  }

  const property = await Property.create({ ...data, seller: sellerId });
  console.log(`  ✔  Created property: ${property.title}`);
  return property;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('❌  MONGODB_URI is not set. Check your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('✅  Connected to MongoDB\n');

    console.log('👤  Seeding users…');
    await upsertUser(TEST_BUYER);
    const seller = await upsertUser(TEST_SELLER);

    console.log('\n🏡  Seeding properties…');
    for (const prop of SAMPLE_PROPERTIES) {
      await upsertProperty(prop, seller._id);
    }

    console.log('\n🎉  Seed complete!\n');
    console.log('  Test buyer  → phone: +233200000001 / password: Test1234!');
    console.log('  Test seller → phone: +233200000002 / password: Test1234!\n');
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected from MongoDB');
  }
}

seed().catch((err) => {
  console.error('❌  Unexpected error:', err.message);
  process.exit(1);
});
