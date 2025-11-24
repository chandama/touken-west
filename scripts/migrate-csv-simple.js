#!/usr/bin/env node

/**
 * Simple MongoDB Migration Script
 * Uses native MongoDB driver to avoid mongoose conflicts
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');
const Papa = require('papaparse');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not found in .env file');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🚀 Starting CSV to MongoDB migration...\n');

    // Connect
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('nihonto_db');

    // Migrate Swords
    console.log('\n📊 Migrating swords from CSV...');
    const csvPath = path.join(__dirname, '../data/index.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    const swords = parsed.data.map(sword => ({
      ...sword,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    console.log(`   Found ${swords.length} swords in CSV`);

    // Clear existing
    const swordsCollection = db.collection('swords');
    await swordsCollection.deleteMany({});
    console.log('   Cleared existing swords');

    // Insert in batches
    const batchSize = 1000;
    let inserted = 0;

    for (let i = 0; i < swords.length; i += batchSize) {
      const batch = swords.slice(i, i + batchSize);
      await swordsCollection.insertMany(batch);
      inserted += batch.length;
      console.log(`   Inserted ${inserted}/${swords.length} swords...`);
    }

    // Create indexes
    console.log('\n🔍 Creating indexes...');
    await swordsCollection.createIndex({ Index: 1 }, { unique: true });
    await swordsCollection.createIndex({ School: 1 });
    await swordsCollection.createIndex({ Type: 1 });
    await swordsCollection.createIndex({ Smith: 1 });
    console.log('   ✅ Indexes created');

    // Migrate Users (if exists)
    console.log('\n👥 Migrating users...');
    const usersPath = path.join(__dirname, '../data/users.json');
    try {
      const usersContent = await fs.readFile(usersPath, 'utf8');
      const users = JSON.parse(usersContent);

      if (users.length > 0) {
        const usersCollection = db.collection('users');
        await usersCollection.deleteMany({});
        await usersCollection.insertMany(users.map(u => ({
          ...u,
          createdAt: new Date(u.createdAt || Date.now()),
          updatedAt: new Date()
        })));
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        console.log(`   ✅ Migrated ${users.length} users`);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      console.log('   No users.json found - skipping');
    }

    // Migrate Changelog (if exists)
    console.log('\n📝 Migrating changelog...');
    const changelogPath = path.join(__dirname, '../data/changelog.json');
    try {
      const changelogContent = await fs.readFile(changelogPath, 'utf8');
      const changelog = JSON.parse(changelogContent);

      if (changelog.length > 0) {
        const changelogCollection = db.collection('changelog');
        await changelogCollection.deleteMany({});
        await changelogCollection.insertMany(changelog.map(c => ({
          ...c,
          timestamp: new Date(c.timestamp)
        })));
        await changelogCollection.createIndex({ timestamp: -1 });
        console.log(`   ✅ Migrated ${changelog.length} changelog entries`);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      console.log('   No changelog.json found - skipping');
    }

    // Verify
    console.log('\n🔍 Verifying migration...');
    const finalCount = await swordsCollection.countDocuments();
    const userCount = await db.collection('users').countDocuments();
    const changelogCount = await db.collection('changelog').countDocuments();

    console.log(`   Swords: ${finalCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Changelog: ${changelogCount}`);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

main();
