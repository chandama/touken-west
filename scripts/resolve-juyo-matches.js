const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Enhanced matching script that reads PDFs to extract Type and Nagasa
 * to resolve ambiguous matches
 */

const JUYO_SOURCE_BASE = '/mnt/c/Users/chand/Desktop/Nihonto/Juyo Zufu';

// Extract text from PDF using pdftotext (if available) or read tool
function extractPDFText(pdfPath) {
  try {
    // Try using pdftotext first
    const text = execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf-8' });
    return text;
  } catch (e) {
    console.warn(`Could not extract text from ${path.basename(pdfPath)}: ${e.message}`);
    return null;
  }
}

// Parse blade info from PDF text
function parsePDFInfo(text) {
  if (!text) return null;

  const info = {};

  // Extract type (katana, tanto, wakizashi, tachi, etc.)
  const typeMatch = text.match(/^\s*(katana|tanto|wakizashi|tachi|kodachi|yoroi-doshi|ken)\s*,/im);
  if (typeMatch) {
    info.type = typeMatch[1].toLowerCase();
  }

  // Extract nagasa (blade length)
  // Format: "nagasa 72.5 cm" or "nagasa: 72.5 cm"
  const nagasaMatch = text.match(/nagasa[:\s]+(\d+\.?\d*)\s*cm/i);
  if (nagasaMatch) {
    info.nagasa = parseFloat(nagasaMatch[1]);
  }

  return Object.keys(info).length > 0 ? info : null;
}

// Normalize blade type for comparison
function normalizeType(type) {
  if (!type) return '';
  const normalized = type.toLowerCase().trim();

  // Handle variations
  const typeMap = {
    'tanto': 'tanto',
    'tantō': 'tanto',
    'katana': 'katana',
    'wakizashi': 'wakizashi',
    'tachi': 'tachi',
    'kodachi': 'kodachi',
    'yoroi-doshi': 'yoroidoshi',
    'yoroidoshi': 'yoroidoshi',
    'ken': 'ken',
    'tsurugi': 'ken'
  };

  return typeMap[normalized] || normalized;
}

// Find best match using PDF data
function findBestMatch(pdfInfo, candidates) {
  if (!pdfInfo || !pdfInfo.type || !pdfInfo.nagasa) {
    return null;
  }

  const matches = candidates.filter(c => {
    const typeMatch = normalizeType(c.type) === normalizeType(pdfInfo.type);
    const lengthMatch = Math.abs(parseFloat(c.nagasa) - pdfInfo.nagasa) < 0.5; // Within 0.5cm tolerance
    return typeMatch && lengthMatch;
  });

  if (matches.length === 1) {
    return matches[0];
  } else if (matches.length > 1) {
    // Still ambiguous - return closest length match
    return matches.reduce((closest, current) => {
      const closestDiff = Math.abs(parseFloat(closest.nagasa) - pdfInfo.nagasa);
      const currentDiff = Math.abs(parseFloat(current.nagasa) - pdfInfo.nagasa);
      return currentDiff < closestDiff ? current : closest;
    });
  }

  return null;
}

// Resolve ambiguous matches
async function resolveAmbiguous(mappingFile) {
  const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));

  console.log(`\n=== Resolving ${mapping.ambiguous.length} Ambiguous Matches ===\n`);

  const resolved = [];
  const stillAmbiguous = [];

  for (const item of mapping.ambiguous) {
    const pdfFile = item.files.find(f => f.endsWith('.pdf'));
    if (!pdfFile) {
      console.log(`⚠ No PDF found for Juyo Item #${item.juyoItem}`);
      stillAmbiguous.push(item);
      continue;
    }

    const pdfPath = path.join(
      JUYO_SOURCE_BASE,
      mapping.session,
      mapping.category,
      pdfFile
    );

    console.log(`Reading: ${pdfFile}`);
    const text = extractPDFText(pdfPath);
    const pdfInfo = parsePDFInfo(text);

    if (!pdfInfo) {
      console.log(`  ✗ Could not extract info from PDF`);
      stillAmbiguous.push(item);
      continue;
    }

    console.log(`  Found: ${pdfInfo.type}, ${pdfInfo.nagasa}cm`);

    const match = findBestMatch(pdfInfo, item.candidates);

    if (match) {
      console.log(`  ✓ Matched to Index ${match.index}\n`);

      resolved.push({
        index: match.index,
        juyoSession: mapping.session,
        juyoCategory: mapping.category,
        juyoItemNumber: item.juyoItem,
        school: match.school || '',
        smith: match.smith || '',
        type: match.type,
        nagasa: match.nagasa,
        files: item.files.map(filename => ({
          filename,
          path: path.join(JUYO_SOURCE_BASE, mapping.session, mapping.category, filename),
          type: filename.endsWith('.pdf') ? 'pdf' : 'jpg'
        })),
        pdfExtracted: pdfInfo
      });
    } else {
      console.log(`  ✗ No match found in database\n`);
      stillAmbiguous.push({
        ...item,
        pdfInfo
      });
    }
  }

  console.log(`\n=== Resolution Results ===`);
  console.log(`✓ Resolved: ${resolved.length}`);
  console.log(`⚠ Still ambiguous: ${stillAmbiguous.length}\n`);

  // Combine with original perfect matches
  const allMappings = [...mapping.mappings, ...resolved];

  // Update mapping file
  const updatedMapping = {
    ...mapping,
    stats: {
      ...mapping.stats,
      matched: allMappings.length,
      ambiguous: stillAmbiguous.length,
      resolvedByPDF: resolved.length
    },
    mappings: allMappings.sort((a, b) => parseInt(a.index) - parseInt(b.index)),
    ambiguous: stillAmbiguous,
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync(mappingFile, JSON.stringify(updatedMapping, null, 2));
  console.log(`Updated mapping saved to: ${mappingFile}`);

  return updatedMapping;
}

// Run if called directly
if (require.main === module) {
  const mappingFile = path.join(__dirname, '../data/juyo-48-koto-mapping.json');
  resolveAmbiguous(mappingFile).catch(console.error);
}

module.exports = { resolveAmbiguous, extractPDFText, parsePDFInfo };
