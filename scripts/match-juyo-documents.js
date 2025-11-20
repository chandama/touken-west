const fs = require('fs');
const path = require('path');

/**
 * Script to match Juyo Zufu documents to database entries
 * Matches by: School + Smith + Type + Nagasa (blade length)
 */

const JUYO_SOURCE_BASE = '/mnt/c/Users/chand/Desktop/Nihonto/Juyo Zufu';
const CSV_PATH = path.join(__dirname, '../data/index.csv');
const OUTPUT_DIR = path.join(__dirname, '../public/documents');
const MAPPING_OUTPUT = path.join(__dirname, '../data/document-mappings.json');

// Simple CSV parser (handles quoted fields with commas)
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
}

// Parse database entries
function loadDatabase() {
  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
  return parseCSV(csvText);
}

// Extract Juyo session number from Authentication field
function extractJuyoSession(authString) {
  if (!authString) return null;

  // Match patterns like "Juyo 48", "Tokubetsu Juyo 26", "Juyo Token 48"
  const match = authString.match(/(?:Tokubetsu\s+)?Juyo(?:\s+Token)?\s+(\d+)/i);
  return match ? match[1] : null;
}

// Normalize smith name for matching
function normalizeSmithName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '');
}

// Parse filename to extract juyo item number and smith info
function parseFilename(filename) {
  // Format: "1 Awataguchi Kuniyasu.jpg"
  const match = filename.match(/^(\d+)\s+(.+?)\.(jpg|pdf)$/i);
  if (!match) return null;

  return {
    juyoItemNumber: match[1],
    smithInfo: match[2],
    extension: match[3].toLowerCase()
  };
}

// Scan Juyo folder for documents
function scanJuyoFolder(session, category) {
  const folderPath = path.join(JUYO_SOURCE_BASE, session, category);

  if (!fs.existsSync(folderPath)) {
    console.warn(`Folder not found: ${folderPath}`);
    return [];
  }

  const files = fs.readdirSync(folderPath);
  const documents = {};

  files.forEach(filename => {
    const parsed = parseFilename(filename);
    if (!parsed) return;

    const key = parsed.juyoItemNumber;
    if (!documents[key]) {
      documents[key] = {
        juyoItemNumber: key,
        smithInfo: parsed.smithInfo,
        files: []
      };
    }

    documents[key].files.push({
      filename: filename,
      path: path.join(folderPath, filename),
      type: parsed.extension
    });
  });

  return Object.values(documents);
}

// Match document to database entry
function findMatch(doc, swords, session) {
  // Extract school and smith from filename
  // Format examples: "Awataguchi Kuniyasu", "Rai Kunitoshi", "Ayanokoji Ayanokoji"
  const parts = doc.smithInfo.split(/\s+/);

  let candidateSchool, candidateSmith;

  if (parts.length >= 2) {
    candidateSchool = parts[0];
    candidateSmith = parts.slice(1).join(' ');
  } else {
    candidateSchool = parts[0];
    candidateSmith = parts[0];
  }

  // Find all swords matching this Juyo session, school, and smith
  const matches = swords.filter(sword => {
    const swordSession = extractJuyoSession(sword.Authentication);
    if (swordSession !== session) return false;

    const schoolMatch = normalizeSmithName(sword.School) === normalizeSmithName(candidateSchool);
    const smithMatch = normalizeSmithName(sword.Smith) === normalizeSmithName(candidateSmith);

    return schoolMatch && smithMatch;
  });

  return matches;
}

// Main matching process
function matchDocuments(session = '48', category = 'Koto') {
  console.log(`\n=== Matching Juyo ${session} ${category} Documents ===\n`);

  const swords = loadDatabase();
  const documents = scanJuyoFolder(session, category);

  console.log(`Found ${documents.length} document groups in Juyo ${session}/${category}`);
  console.log(`Database has ${swords.length} total entries\n`);

  const mappings = [];
  const ambiguous = [];
  const unmatched = [];

  documents.forEach(doc => {
    const matches = findMatch(doc, swords, session);

    if (matches.length === 0) {
      unmatched.push({
        juyoItem: doc.juyoItemNumber,
        smithInfo: doc.smithInfo,
        files: doc.files.map(f => f.filename)
      });
    } else if (matches.length === 1) {
      // Perfect match!
      mappings.push({
        index: matches[0].Index,
        juyoSession: session,
        juyoCategory: category,
        juyoItemNumber: doc.juyoItemNumber,
        school: matches[0].School,
        smith: matches[0].Smith,
        type: matches[0].Type,
        nagasa: matches[0].Nagasa,
        files: doc.files
      });
    } else {
      // Multiple matches - need additional criteria
      ambiguous.push({
        juyoItem: doc.juyoItemNumber,
        smithInfo: doc.smithInfo,
        files: doc.files.map(f => f.filename),
        candidates: matches.map(m => ({
          index: m.Index,
          type: m.Type,
          nagasa: m.Nagasa,
          mei: m.Mei,
          period: m.Period
        }))
      });
    }
  });

  // Report results
  console.log(`✓ Matched: ${mappings.length}`);
  console.log(`⚠ Ambiguous: ${ambiguous.length}`);
  console.log(`✗ Unmatched: ${unmatched.length}\n`);

  if (ambiguous.length > 0) {
    console.log('=== AMBIGUOUS MATCHES (need manual review) ===');
    ambiguous.forEach(item => {
      console.log(`\nJuyo Item #${item.juyoItem}: ${item.smithInfo}`);
      console.log(`Files: ${item.files.join(', ')}`);
      console.log('Candidate database entries:');
      item.candidates.forEach(c => {
        console.log(`  - Index ${c.index}: ${c.type}, ${c.nagasa}cm, ${c.mei}, ${c.period}`);
      });
    });
    console.log('');
  }

  if (unmatched.length > 0) {
    console.log('=== UNMATCHED FILES ===');
    unmatched.forEach(item => {
      console.log(`Juyo Item #${item.juyoItem}: ${item.smithInfo} - ${item.files.join(', ')}`);
    });
    console.log('');
  }

  // Save results
  const output = {
    session: session,
    category: category,
    generatedAt: new Date().toISOString(),
    stats: {
      totalDocuments: documents.length,
      matched: mappings.length,
      ambiguous: ambiguous.length,
      unmatched: unmatched.length
    },
    mappings,
    ambiguous,
    unmatched
  };

  const outputPath = path.join(__dirname, `../data/juyo-${session}-${category.toLowerCase()}-mapping.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Results saved to: ${outputPath}`);

  return output;
}

// Run if called directly
if (require.main === module) {
  matchDocuments().catch(console.error);
}

module.exports = { matchDocuments, extractJuyoSession };
