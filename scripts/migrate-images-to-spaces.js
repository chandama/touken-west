#!/usr/bin/env node

/**
 * Migrate Local Images to DigitalOcean Spaces
 *
 * This script:
 * 1. Uploads all images from public/documents/uploads/ to Spaces
 * 2. Updates MongoDB sword records with new Spaces URLs
 * 3. Maintains the same filename structure
 *
 * Usage: node scripts/migrate-images-to-spaces.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs').promises;
const path = require('path');
const { MongoClient } = require('mongodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configuration
const UPLOADS_DIR = path.join(__dirname, '../public/documents/uploads');
const MONGODB_URI = process.env.MONGODB_URI;
const BATCH_SIZE = 50; // Upload 50 files at a time

// S3 Client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: process.env.SPACES_ENDPOINT,
  region: process.env.SPACES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY,
  },
});

const SPACES_BUCKET = process.env.SPACES_BUCKET;
const CDN_ENDPOINT = process.env.SPACES_CDN_ENDPOINT;

// Statistics
const stats = {
  totalFiles: 0,
  uploaded: 0,
  skipped: 0,
  errors: 0,
  swordsUpdated: 0,
  startTime: Date.now(),
};

/**
 * Upload file to Spaces
 */
async function uploadToSpaces(filePath, filename) {
  const fileContent = await fs.readFile(filePath);

  // Determine the key (path in Spaces)
  let key;
  if (filename.startsWith('thumb-')) {
    key = `images/thumbnails/${filename}`;
  } else {
    key = `images/originals/${filename}`;
  }

  const command = new PutObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: key,
    Body: fileContent,
    ACL: 'public-read',
    ContentType: filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
  });

  await s3Client.send(command);

  // Return CDN URL
  return `${CDN_ENDPOINT}/${key}`;
}

/**
 * Get all files from uploads directory
 */
async function getLocalFiles() {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    return files.filter(f => !f.startsWith('.') && f !== '.gitkeep');
  } catch (error) {
    console.error('Error reading uploads directory:', error.message);
    return [];
  }
}

/**
 * Process files in batches
 */
async function migrateImages() {
  console.log('\n📸 Migrating images to DigitalOcean Spaces...\n');

  // Get all files
  const files = await getLocalFiles();
  stats.totalFiles = files.length;

  if (files.length === 0) {
    console.log('   No files found to migrate');
    return {};
  }

  console.log(`   Found ${files.length} files to upload`);
  console.log(`   Target: ${SPACES_BUCKET}`);
  console.log(`   CDN: ${CDN_ENDPOINT}\n`);

  // Track URL mappings (old path -> new URL)
  const urlMappings = {};

  // Process in batches
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(files.length / BATCH_SIZE);

    console.log(`   Batch ${batchNum}/${totalBatches} (${batch.length} files)...`);

    await Promise.all(
      batch.map(async (filename) => {
        try {
          const filePath = path.join(UPLOADS_DIR, filename);
          const newUrl = await uploadToSpaces(filePath, filename);

          // Map old local path to new URL
          const oldPath = `/documents/uploads/${filename}`;
          urlMappings[oldPath] = newUrl;

          stats.uploaded++;

          if (stats.uploaded % 100 === 0) {
            const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
            const rate = (stats.uploaded / elapsed).toFixed(1);
            console.log(`      Progress: ${stats.uploaded}/${stats.totalFiles} (${rate} files/sec)`);
          }
        } catch (error) {
          console.error(`      Error uploading ${filename}:`, error.message);
          stats.errors++;
        }
      })
    );
  }

  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  console.log(`\n   ✅ Uploaded ${stats.uploaded} files in ${elapsed}s`);
  if (stats.errors > 0) {
    console.log(`   ⚠️  ${stats.errors} files failed to upload`);
  }

  return urlMappings;
}

/**
 * Update MongoDB records with new URLs
 */
async function updateMongoDBRecords(urlMappings) {
  if (Object.keys(urlMappings).length === 0) {
    console.log('\n   No URL mappings to update');
    return;
  }

  console.log('\n📝 Updating MongoDB records...\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('nihonto_db');
    const swordsCollection = db.collection('swords');

    // Find all swords with media attachments
    const swordsWithMedia = await swordsCollection.find({
      MediaAttachments: { $nin: ['NA', '[]', '', null] }
    }).toArray();

    console.log(`   Found ${swordsWithMedia.length} swords with media attachments`);

    let updated = 0;
    let unchanged = 0;

    for (const sword of swordsWithMedia) {
      try {
        const mediaAttachments = JSON.parse(sword.MediaAttachments);
        let modified = false;

        // Update each attachment's URLs
        mediaAttachments.forEach(attachment => {
          // Update main URL
          if (urlMappings[attachment.url]) {
            attachment.url = urlMappings[attachment.url];
            modified = true;
          }

          // Update thumbnail URL
          if (attachment.thumbnailUrl && urlMappings[attachment.thumbnailUrl]) {
            attachment.thumbnailUrl = urlMappings[attachment.thumbnailUrl];
            modified = true;
          }
        });

        if (modified) {
          // Update the record
          await swordsCollection.updateOne(
            { _id: sword._id },
            { $set: { MediaAttachments: JSON.stringify(mediaAttachments) } }
          );
          updated++;

          if (updated % 100 === 0) {
            console.log(`      Updated ${updated}/${swordsWithMedia.length} records...`);
          }
        } else {
          unchanged++;
        }
      } catch (error) {
        console.error(`      Error updating sword ${sword.Index}:`, error.message);
        stats.errors++;
      }
    }

    stats.swordsUpdated = updated;

    console.log(`\n   ✅ Updated ${updated} sword records`);
    if (unchanged > 0) {
      console.log(`   ℹ️  ${unchanged} records already had correct URLs (or no matching files)`);
    }

  } catch (error) {
    console.error('   ❌ MongoDB update error:', error.message);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting image migration to DigitalOcean Spaces...\n');
  console.log('='.repeat(60));

  // Verify configuration
  if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI not found in .env');
    process.exit(1);
  }
  if (!process.env.SPACES_ACCESS_KEY_ID || !process.env.SPACES_SECRET_ACCESS_KEY) {
    console.error('❌ ERROR: Spaces credentials not found in .env');
    process.exit(1);
  }
  if (!SPACES_BUCKET) {
    console.error('❌ ERROR: SPACES_BUCKET not found in .env');
    process.exit(1);
  }

  console.log('Configuration:');
  console.log(`  Source: ${UPLOADS_DIR}`);
  console.log(`  Bucket: ${SPACES_BUCKET}`);
  console.log(`  CDN: ${CDN_ENDPOINT}`);
  console.log(`  Batch size: ${BATCH_SIZE} files`);
  console.log('='.repeat(60));

  try {
    // Step 1: Upload images
    const urlMappings = await migrateImages();

    // Step 2: Update MongoDB
    await updateMongoDBRecords(urlMappings);

    // Summary
    const totalTime = ((Date.now() - stats.startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log('✨ Migration Summary');
    console.log('='.repeat(60));
    console.log(`Total files found: ${stats.totalFiles}`);
    console.log(`Successfully uploaded: ${stats.uploaded}`);
    console.log(`Sword records updated: ${stats.swordsUpdated}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Total time: ${totalTime}s`);
    console.log(`Average speed: ${(stats.uploaded / totalTime).toFixed(1)} files/sec`);
    console.log('='.repeat(60));

    if (stats.errors > 0) {
      console.log('\n⚠️  Some files failed to upload. Review errors above.');
      process.exit(1);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify images are accessible via CDN');
    console.log('2. Test image loading in the application');
    console.log('3. Consider backing up local files before deleting them');
    console.log(`4. Local files are still in: ${UPLOADS_DIR}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
