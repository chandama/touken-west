const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Copy and rename Juyo documents to project using systematic naming
 * Naming convention: juyo-{session}-{book}-{item:03d}-{slug}.{ext}
 * Example: juyo-48-1-001-awataguchi-kuniyasu.jpg
 */

const PUBLIC_DOCS_DIR = path.join(__dirname, '../public/documents');

// Create slug from attribution name
function createSlug(attribution) {
  return attribution
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50); // Limit length
}

// Copy and rename files
function copyDocuments(mappingFile, outputSubdir = 'juyo-48-koto') {
  const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));

  const outputDir = path.join(PUBLIC_DOCS_DIR, outputSubdir);

  // Create output directory
  if (!fs.existsSync(PUBLIC_DOCS_DIR)) {
    fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n=== Copying Documents to Project ===`);
  console.log(`Output directory: ${outputDir}\n`);

  const updatedMappings = [];
  let successCount = 0;
  let errorCount = 0;

  mapping.mappings.forEach((item, index) => {
    const session = item.juyoSession;
    const book = item.juyoBook;
    const itemIndex = item.juyoItemIndex.padStart(3, '0');
    const slug = createSlug(item.attribution);

    const newFiles = [];

    item.files.forEach(file => {
      const ext = file.type;
      const newFilename = `juyo-${session}-${book}-${itemIndex}-${slug}.${ext}`;
      const newPath = path.join(outputDir, newFilename);
      const relativePath = `/documents/${outputSubdir}/${newFilename}`;

      try {
        // Copy file
        fs.copyFileSync(file.path, newPath);

        newFiles.push({
          filename: newFilename,
          path: relativePath,  // Relative path for web serving
          originalPath: file.path,
          type: ext
        });

        successCount++;
      } catch (error) {
        console.error(`✗ Error copying ${file.filename}: ${error.message}`);
        errorCount++;
      }
    });

    // Update mapping with new paths
    updatedMappings.push({
      ...item,
      files: newFiles
    });

    if ((index + 1) % 25 === 0) {
      console.log(`  Processed ${index + 1}/${mapping.mappings.length}...`);
    }
  });

  console.log(`\n✓ Copied ${successCount} files`);
  if (errorCount > 0) {
    console.log(`✗ Errors: ${errorCount}`);
  }

  // Save updated mapping
  const updatedMapping = {
    ...mapping,
    mappings: updatedMappings,
    documentDirectory: `/documents/${outputSubdir}`,
    updatedAt: new Date().toISOString()
  };

  const outputMappingPath = path.join(__dirname, `../data/juyo-${mapping.session}-${mapping.category.toLowerCase()}-documents.json`);
  fs.writeFileSync(outputMappingPath, JSON.stringify(updatedMapping, null, 2));

  console.log(`\n✓ Updated mapping saved to: ${outputMappingPath}`);
  console.log(`\nFiles are now in: ${outputDir}`);

  return updatedMapping;
}

// Run if called directly
if (require.main === module) {
  const mappingFile = path.join(__dirname, '../data/juyo-48-koto-final-mapping.json');
  const outputSubdir = 'juyo-48-koto';

  copyDocuments(mappingFile, outputSubdir);
}

module.exports = { copyDocuments, createSlug };
