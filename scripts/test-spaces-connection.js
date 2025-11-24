#!/usr/bin/env node

/**
 * Test DigitalOcean Spaces Connection
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  endpoint: process.env.SPACES_ENDPOINT,
  region: process.env.SPACES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY,
  },
});

const SPACES_BUCKET = process.env.SPACES_BUCKET;

async function testConnection() {
  console.log('🔍 Testing DigitalOcean Spaces Connection...\n');
  console.log('Configuration:');
  console.log(`  Endpoint: ${process.env.SPACES_ENDPOINT}`);
  console.log(`  Region: ${process.env.SPACES_REGION}`);
  console.log(`  Bucket: ${SPACES_BUCKET}`);
  console.log(`  Access Key: ${process.env.SPACES_ACCESS_KEY_ID?.substring(0, 10)}...`);
  console.log('');

  try {
    // Test 1: List objects in bucket
    console.log('Test 1: Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: SPACES_BUCKET,
      MaxKeys: 5,
    });

    const listResponse = await s3Client.send(listCommand);
    console.log(`✅ Success! Bucket exists and is accessible.`);
    console.log(`   Found ${listResponse.KeyCount || 0} objects (showing first 5)`);

    // Test 2: Upload a test file
    console.log('\nTest 2: Uploading test file...');
    const testContent = 'This is a test file from nihonto-db migration script';
    const putCommand = new PutObjectCommand({
      Bucket: SPACES_BUCKET,
      Key: 'test/connection-test.txt',
      Body: Buffer.from(testContent),
      ACL: 'public-read',
      ContentType: 'text/plain',
    });

    await s3Client.send(putCommand);
    console.log('✅ Success! Test file uploaded.');

    const testUrl = `${process.env.SPACES_CDN_ENDPOINT}/test/connection-test.txt`;
    console.log(`   Test file URL: ${testUrl}`);

    console.log('\n🎉 All tests passed! Your Spaces configuration is correct.');
    console.log('   You can now run the image migration script.');

  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error(`   Error: ${error.message}`);
    console.error('\nCommon issues:');
    console.error('  1. Wrong bucket name - check it matches exactly in DigitalOcean');
    console.error('  2. Wrong access credentials - regenerate keys if needed');
    console.error('  3. Wrong endpoint - should match your Space region');
    console.error('  4. Keys have extra spaces or incorrect characters');
    process.exit(1);
  }
}

testConnection();
