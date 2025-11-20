const fs = require('fs');
const path = require('path');

/**
 * Match sword documents using the official Juyo index
 * This provides authoritative Session-Book-Index mapping
 */

const JUYO_INDEX_CSV = path.join(__dirname, '../data/Juyo1-70_data.csv');
const DB_CSV = path.join(__dirname, '../data/index.csv');
const JUYO_ZUFU_BASE = '/mnt/c/Users/chand/Desktop/Nihonto/Juyo Zufu';

// Simple CSV parser
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

// Load databases
function loadData() {
  console.log('Loading databases...');
  const juyoIndex = parseCSV(fs.readFileSync(JUYO_INDEX_CSV, 'utf-8'));
  const swordsDB = parseCSV(fs.readFileSync(DB_CSV, 'utf-8'));

  console.log(`  Juyo Index: ${juyoIndex.length} entries`);
  console.log(`  Swords DB: ${swordsDB.length} entries`);

  return { juyoIndex, swordsDB };
}

// Extract Juyo session number from Authentication field
function extractJuyoInfo(authString) {
  if (!authString) return null;

  // Match patterns like "Juyo 48", "Tokubetsu Juyo 26"
  const match = authString.match(/(?:Tokubetsu\s+)?Juyo(?:\s+Token)?\s+(\d+)/i);
  if (!match) return null;

  return {
    session: match[1],
    isTokubetsu: /tokubetsu/i.test(authString)
  };
}

// Normalize names for matching with enhanced Unicode support
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    // First normalize Unicode (NFD = decompose to base + combining marks)
    .normalize('NFD')
    // Remove all combining diacritical marks (includes macrons, accents, etc.)
    .replace(/[\u0300-\u036f]/g, '')
    // Also explicitly handle common macron characters that might not decompose
    .replace(/ō/g, 'o')
    .replace(/ū/g, 'u')
    .replace(/ā/g, 'a')
    .replace(/ē/g, 'e')
    .replace(/ī/g, 'i')
    // Remove spaces
    .replace(/\s+/g, '')
    // Remove all non-alphanumeric characters
    .replace(/[^\w]/g, '');
}

// Normalize blade type
function normalizeType(type) {
  if (!type) return '';
  const t = type.toLowerCase().trim();
  const typeMap = {
    'tanto': 'tanto',
    'tantō': 'tanto',
    'katana': 'katana',
    'wakizashi': 'wakizashi',
    'tachi': 'tachi',
    'kodachi': 'kodachi'
  };
  return typeMap[t] || t;
}

// Find database match for Juyo index entry
function findDatabaseMatch(juyoEntry, swordsDB) {
  // Filter by Juyo session first
  const sessionMatches = swordsDB.filter(sword => {
    const juyoInfo = extractJuyoInfo(sword.Authentication);
    return juyoInfo && juyoInfo.session === juyoEntry.Session;
  });

  if (sessionMatches.length === 0) {
    return null;
  }

  // Match by type and attribution
  const candidates = sessionMatches.filter(sword => {
    const typeMatch = normalizeType(sword.Type) === normalizeType(juyoEntry.Item);

    // Match attribution (smith name)
    const juyoAttribution = normalizeName(juyoEntry.Attribution);
    const normalizedSmith = normalizeName(sword.Smith);
    const normalizedSchool = normalizeName(sword.School);

    // Try exact matches first
    let smithMatch = normalizedSmith === juyoAttribution ||
                     normalizedSchool === juyoAttribution;

    // Try partial matches
    if (!smithMatch) {
      smithMatch = normalizedSmith.includes(juyoAttribution) ||
                   juyoAttribution.includes(normalizedSmith) ||
                   normalizedSchool.includes(juyoAttribution) ||
                   juyoAttribution.includes(normalizedSchool);
    }

    // Handle "School Smith" combinations like "Ryumon Nobuyoshi"
    if (!smithMatch && juyoEntry.Attribution.includes(' ')) {
      const parts = juyoEntry.Attribution.split(/\s+/);
      // Try last word only (usually the smith name)
      const lastPart = normalizeName(parts[parts.length - 1]);
      smithMatch = normalizedSmith.includes(lastPart) || lastPart.includes(normalizedSmith);

      // Also try first word (might be school)
      if (!smithMatch) {
        const firstPart = normalizeName(parts[0]);
        smithMatch = normalizedSchool.includes(firstPart) || firstPart.includes(normalizedSchool);
      }
    }

    return typeMatch && smithMatch;
  });

  if (candidates.length === 1) {
    return candidates[0];
  } else if (candidates.length > 1) {
    // Multiple matches - try matching by mei
    const meiMatch = candidates.find(c => {
      const cMei = normalizeName(c.Mei);
      const jMei = normalizeName(juyoEntry.Mei);
      return cMei && jMei && (cMei.includes(jMei) || jMei.includes(cMei));
    });

    return meiMatch || candidates[0]; // Return first if no mei match
  }

  return null;
}

// Scan folder for documents
function scanDocumentsFolder(session, category) {
  const folderPath = path.join(JUYO_ZUFU_BASE, session, category);

  if (!fs.existsSync(folderPath)) {
    console.warn(`Folder not found: ${folderPath}`);
    return [];
  }

  const files = fs.readdirSync(folderPath);
  const documentGroups = {};

  files.forEach(filename => {
    const match = filename.match(/^(\d+)\s+(.+?)\.(jpg|pdf)$/i);
    if (!match) return;

    const itemIndex = match[1];
    if (!documentGroups[itemIndex]) {
      documentGroups[itemIndex] = {
        itemIndex,
        files: []
      };
    }

    documentGroups[itemIndex].files.push({
      filename,
      type: match[3].toLowerCase()
    });
  });

  return Object.values(documentGroups);
}

// Main matching process
function matchDocuments(session = '48', category = 'Koto') {
  console.log(`\n=== Matching Juyo ${session} ${category} using Official Index ===\n`);

  const { juyoIndex, swordsDB } = loadData();

  // Filter Juyo index for this session
  const sessionEntries = juyoIndex.filter(entry =>
    entry.Session === session && entry.Book === '1'
  );

  console.log(`Found ${sessionEntries.length} entries in Juyo Index for Session ${session}\n`);

  // Scan documents
  const documentGroups = scanDocumentsFolder(session, category);
  console.log(`Found ${documentGroups.length} document groups in folder\n`);

  const mappings = [];
  const unmatched = [];
  const noFiles = [];

  sessionEntries.forEach(juyoEntry => {
    const dbMatch = findDatabaseMatch(juyoEntry, swordsDB);

    // Find corresponding files
    const docGroup = documentGroups.find(d => d.itemIndex === juyoEntry.Index);

    if (!dbMatch) {
      if (docGroup) {
        unmatched.push({
          juyoSession: session,
          juyoBook: juyoEntry.Book,
          juyoIndex: juyoEntry.Index,
          attribution: juyoEntry.Attribution,
          type: juyoEntry.Item,
          mei: juyoEntry.Mei,
          files: docGroup.files,
          reason: 'No database match'
        });
      } else {
        noFiles.push({
          juyoSession: session,
          juyoBook: juyoEntry.Book,
          juyoIndex: juyoEntry.Index,
          attribution: juyoEntry.Attribution,
          type: juyoEntry.Item,
          mei: juyoEntry.Mei,
          reason: 'No files found'
        });
      }
      return;
    }

    if (!docGroup) {
      noFiles.push({
        databaseIndex: dbMatch.Index,
        juyoSession: session,
        juyoBook: juyoEntry.Book,
        juyoIndex: juyoEntry.Index,
        attribution: juyoEntry.Attribution,
        type: juyoEntry.Item,
        mei: juyoEntry.Mei,
        reason: 'Files not in folder (may be Shinto/etc)'
      });
      return;
    }

    // Perfect match!
    mappings.push({
      databaseIndex: dbMatch.Index,
      juyoSession: session,
      juyoBook: juyoEntry.Book,
      juyoItemIndex: juyoEntry.Index,
      school: dbMatch.School,
      smith: dbMatch.Smith,
      type: dbMatch.Type,
      nagasa: dbMatch.Nagasa,
      mei: dbMatch.Mei,
      juyoMei: juyoEntry.Mei,
      attribution: juyoEntry.Attribution,
      files: docGroup.files.map(f => ({
        filename: f.filename,
        path: path.join(JUYO_ZUFU_BASE, session, category, f.filename),
        type: f.type
      }))
    });
  });

  // Sort by database index
  mappings.sort((a, b) => parseInt(a.databaseIndex) - parseInt(b.databaseIndex));

  // Report
  console.log(`=== Results ===`);
  console.log(`✓ Matched: ${mappings.length}`);
  console.log(`⚠ Unmatched (has files): ${unmatched.length}`);
  console.log(`ℹ No files found: ${noFiles.length}\n`);

  if (unmatched.length > 0 && unmatched.length <= 10) {
    console.log('=== UNMATCHED (with files) ===');
    unmatched.forEach(item => {
      console.log(`  Juyo ${item.juyoSession}-${item.juyoBook}-${item.juyoIndex}: ${item.attribution}, ${item.type}`);
      console.log(`    Files: ${item.files.map(f => f.filename).join(', ')}`);
    });
    console.log('');
  }

  // Save output
  const output = {
    session,
    category,
    generatedAt: new Date().toISOString(),
    method: 'juyo-official-index',
    stats: {
      totalJuyoEntries: sessionEntries.length,
      totalDocumentGroups: documentGroups.length,
      matched: mappings.length,
      unmatched: unmatched.length,
      noFiles: noFiles.length
    },
    mappings,
    unmatched,
    noFiles
  };

  const outputPath = path.join(__dirname, `../data/juyo-${session}-${category.toLowerCase()}-final-mapping.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`✓ Mapping saved to: ${outputPath}`);

  return output;
}

// Run if called directly
if (require.main === module) {
  const session = process.argv[2] || '48';
  const category = process.argv[3] || 'Koto';
  matchDocuments(session, category);
}

module.exports = { matchDocuments, extractJuyoInfo };
