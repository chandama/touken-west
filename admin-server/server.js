const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const Papa = require('papaparse');
const sharp = require('sharp');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Enable CORS for local development
app.use(cors());
app.use(express.json());

// Configure file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(__dirname, '../public/documents/uploads');
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Create filename with timestamp and original name
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-z0-9.-]/gi, '_');
    const uniqueName = `${timestamp}-${sanitized}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PDF allowed.'));
    }
  },
});

// Helper: Read CSV
async function readCSV() {
  const csvPath = path.join(__dirname, '../data/index.csv');
  const csvContent = await fs.readFile(csvPath, 'utf8');
  const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  return parsed.data;
}

// Helper: Write CSV
async function writeCSV(data) {
  const csv = Papa.unparse(data, { header: true });
  const csvPath = path.join(__dirname, '../data/index.csv');
  const publicCsvPath = path.join(__dirname, '../public/data/index.csv');

  await fs.writeFile(csvPath, csv, 'utf8');
  await fs.writeFile(publicCsvPath, csv, 'utf8');
}

// Helper: Read Changelog
async function readChangelog() {
  const changelogPath = path.join(__dirname, '../data/changelog.json');
  try {
    const content = await fs.readFile(changelogPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Helper: Write Changelog
async function writeChangelog(changelog) {
  const changelogPath = path.join(__dirname, '../data/changelog.json');
  await fs.writeFile(changelogPath, JSON.stringify(changelog, null, 2), 'utf8');
}

// Helper: Add changelog entry
async function addChangelogEntry(swordIndex, swordData, changes) {
  const changelog = await readChangelog();

  const entry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    swordIndex,
    swordSmith: swordData.Smith || 'Unknown',
    swordType: swordData.Type || 'Unknown',
    changes: Object.entries(changes).map(([field, { before, after }]) => ({
      field,
      before: before || '(empty)',
      after: after || '(empty)'
    }))
  };

  changelog.unshift(entry); // Add to beginning of array

  // Keep only last 1000 entries
  if (changelog.length > 1000) {
    changelog.splice(1000);
  }

  await writeChangelog(changelog);
  return entry;
}

// Helper: Parse search input into quoted and unquoted terms
function parseSearchInput(input) {
  if (!input || typeof input !== 'string') {
    return { quoted: [], unquoted: [] };
  }

  const quoted = [];
  const unquoted = [];

  // Regex to match quoted phrases and unquoted words
  const regex = /"([^"]*)"|(\S+)/g;

  let match;
  while ((match = regex.exec(input)) !== null) {
    if (match[1] !== undefined) {
      // Quoted phrase (group 1)
      const phrase = match[1].trim();
      if (phrase) {
        quoted.push(phrase);
      }
    } else if (match[2] !== undefined) {
      // Unquoted word (group 2)
      const word = match[2].trim();
      if (word) {
        unquoted.push(word);
      }
    }
  }

  return { quoted, unquoted };
}

// Helper: Check if a value matches search terms (quoted and unquoted)
function matchesSearchTerms(value, quotedTerms, unquotedTerms) {
  if (!value) return false;

  const lowerValue = String(value).toLowerCase();

  // All quoted terms must match exactly with word boundaries (case-insensitive)
  const quotedMatch = quotedTerms.every(term => {
    const lowerTerm = term.toLowerCase();

    // Escape special regex characters in the search term
    const escapedTerm = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Special handling for authentication terms to exclude modified versions
    if (lowerTerm.startsWith('juyo')) {
      // If searching for "Juyo X", first check if "Tokubetsu Juyo X" exists
      const tokubetsuPattern = new RegExp(
        `(^|\\s|,|:|;|\\(|\\[|\\{)tokubetsu\\s${escapedTerm}($|\\s|,|:|;|\\)|\\]|\\}|\\.)`,
        'i'
      );
      if (tokubetsuPattern.test(lowerValue)) {
        // If "Tokubetsu Juyo X" is found, this is NOT a match for just "Juyo X"
        return false;
      }
    } else if (lowerTerm.startsWith('hozon')) {
      // If searching for "Hozon", first check if "Tokubetsu Hozon" exists
      const tokubetsuPattern = new RegExp(
        `(^|\\s|,|:|;|\\(|\\[|\\{)tokubetsu\\s${escapedTerm}($|\\s|,|:|;|\\)|\\]|\\}|\\.)`,
        'i'
      );
      if (tokubetsuPattern.test(lowerValue)) {
        return false;
      }
    } else if (lowerTerm.startsWith('bunkazai')) {
      // If searching for "Bunkazai", first check if "Juyo Bunkazai" exists
      const juyoPattern = new RegExp(
        `(^|\\s|,|:|;|\\(|\\[|\\{)juyo\\s${escapedTerm}($|\\s|,|:|;|\\)|\\]|\\}|\\.)`,
        'i'
      );
      if (juyoPattern.test(lowerValue)) {
        return false;
      }
    }

    // Create regex with word boundaries
    const pattern = new RegExp(
      `(^|\\s|,|:|;|\\(|\\[|\\{)${escapedTerm}($|\\s|,|:|;|\\)|\\]|\\}|\\.)`,
      'i'
    );

    return pattern.test(lowerValue);
  });

  // All unquoted terms must be present (partial match)
  const unquotedMatch = unquotedTerms.every(term => {
    const lowerTerm = term.toLowerCase();
    return lowerValue.includes(lowerTerm);
  });

  return quotedMatch && unquotedMatch;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admin server running' });
});

// Get all swords with pagination and filtering
app.get('/api/swords', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      school = '',
      type = '',
      hasMedia = ''
    } = req.query;

    // Get search parameter(s) - can be a string or array
    let searchTerms = req.query.search || [];
    if (typeof searchTerms === 'string') {
      searchTerms = searchTerms ? [searchTerms] : [];
    }

    let swords = await readCSV();

    // Filter by search - supports multiple search terms with AND logic
    // All search terms must match for a sword to be included
    if (searchTerms.length > 0) {
      swords = swords.filter(sword => {
        // Every search term must match (AND logic)
        return searchTerms.every(searchTerm => {
          // Parse search input for quoted and unquoted terms
          const { quoted, unquoted } = parseSearchInput(searchTerm);

          // Check if any field in the sword matches the search terms
          return Object.values(sword).some(value => {
            return matchesSearchTerms(value, quoted, unquoted);
          });
        });
      });
    }

    // Filter by school
    if (school) {
      swords = swords.filter(s => s.School === school);
    }

    // Filter by type
    if (type) {
      swords = swords.filter(s => s.Type === type);
    }

    // Filter by media status
    if (hasMedia === 'true') {
      swords = swords.filter(s => {
        const media = s.MediaAttachments;
        return media && media !== 'NA' && media !== '[]';
      });
    } else if (hasMedia === 'false') {
      swords = swords.filter(s => {
        const media = s.MediaAttachments;
        return !media || media === 'NA' || media === '[]';
      });
    }

    // Paginate
    const total = swords.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedSwords = swords.slice(startIndex, endIndex);

    res.json({
      swords: paginatedSwords,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Error fetching swords:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get unique filter options
app.get('/api/filters', async (req, res) => {
  try {
    const swords = await readCSV();

    const schools = [...new Set(swords.map(s => s.School).filter(Boolean))].sort();
    const types = [...new Set(swords.map(s => s.Type).filter(Boolean))].sort();

    res.json({ schools, types });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single sword by index
app.get('/api/swords/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const swords = await readCSV();
    const sword = swords.find(s => s.Index === index);

    if (!sword) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    // Parse media attachments
    if (sword.MediaAttachments && sword.MediaAttachments !== 'NA') {
      try {
        sword.MediaAttachmentsArray = JSON.parse(sword.MediaAttachments);
      } catch {
        sword.MediaAttachmentsArray = [];
      }
    } else {
      sword.MediaAttachmentsArray = [];
    }

    res.json(sword);
  } catch (error) {
    console.error('Error fetching sword:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload media for a sword
app.post('/api/swords/:index/media', upload.single('file'), async (req, res) => {
  try {
    const { index } = req.params;
    const { category, caption, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Uploading media for sword ${index}:`, {
      filename: file.filename,
      category,
      caption
    });

    // Generate thumbnail if image
    if (file.mimetype.startsWith('image/')) {
      const thumbnailPath = path.join(
        path.dirname(file.path),
        `thumb-${file.filename}`
      );

      await sharp(file.path)
        .resize(400, 300, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    }

    // Update CSV with new media attachment
    const swords = await readCSV();
    const swordIndex = swords.findIndex(s => s.Index === index);

    if (swordIndex === -1) {
      // Clean up uploaded file
      await fs.unlink(file.path).catch(() => {});
      return res.status(404).json({ error: 'Sword not found' });
    }

    const sword = swords[swordIndex];

    // Parse existing media attachments
    let mediaAttachments = [];
    if (sword.MediaAttachments && sword.MediaAttachments !== 'NA') {
      try {
        mediaAttachments = JSON.parse(sword.MediaAttachments);
        if (!Array.isArray(mediaAttachments)) {
          mediaAttachments = [];
        }
      } catch {
        mediaAttachments = [];
      }
    }

    // Add new attachment
    const fileUrl = `/documents/uploads/${file.filename}`;
    const thumbnailUrl = file.mimetype.startsWith('image/')
      ? `/documents/uploads/thumb-${file.filename}`
      : null;

    const newAttachment = {
      url: fileUrl,
      thumbnailUrl,
      category: category || 'Other',
      caption: caption || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      uploadedAt: new Date().toISOString(),
      filename: file.filename,
      mimeType: file.mimetype,
    };

    mediaAttachments.push(newAttachment);

    // Update sword record
    sword.MediaAttachments = JSON.stringify(mediaAttachments);

    // Write back to CSV
    await writeCSV(swords);

    console.log(`Successfully uploaded media for sword ${index}`);

    res.json({
      success: true,
      file: newAttachment,
      sword,
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove media from sword
app.delete('/api/swords/:index/media', async (req, res) => {
  try {
    const { index } = req.params;
    const { filename } = req.body;

    console.log(`Removing media from sword ${index}:`, filename);

    const swords = await readCSV();
    const swordIndex = swords.findIndex(s => s.Index === index);

    if (swordIndex === -1) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    const sword = swords[swordIndex];

    // Parse and filter media attachments
    let mediaAttachments = [];
    if (sword.MediaAttachments && sword.MediaAttachments !== 'NA') {
      try {
        mediaAttachments = JSON.parse(sword.MediaAttachments);
      } catch {
        mediaAttachments = [];
      }
    }

    // Filter out the attachment
    const filteredAttachments = mediaAttachments.filter(m => m.filename !== filename);

    sword.MediaAttachments = filteredAttachments.length > 0
      ? JSON.stringify(filteredAttachments)
      : 'NA';

    // Delete files from filesystem
    const filePath = path.join(__dirname, '../public/documents/uploads', filename);
    const thumbPath = path.join(__dirname, '../public/documents/uploads', `thumb-${filename}`);

    await fs.unlink(filePath).catch(err => console.log('Could not delete file:', err.message));
    await fs.unlink(thumbPath).catch(() => {}); // Ignore thumbnail errors

    // Write back to CSV
    await writeCSV(swords);

    console.log(`Successfully removed media from sword ${index}`);

    res.json({ success: true, sword });
  } catch (error) {
    console.error('Error removing media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update sword metadata
app.patch('/api/swords/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const updates = req.body;

    const swords = await readCSV();
    const swordIndex = swords.findIndex(s => s.Index === index);

    if (swordIndex === -1) {
      return res.status(404).json({ error: 'Sword not found' });
    }

    const sword = swords[swordIndex];

    // Track changes for changelog
    const changes = {};

    // Update allowed fields (all major sword properties except Index)
    const allowedFields = [
      'School', 'Smith', 'Mei', 'Type', 'Nagasa', 'Sori',
      'Moto', 'Saki', 'Nakago', 'Ana', 'Length', 'Hori',
      'Authentication', 'Province', 'Period', 'References',
      'Description', 'Attachments', 'Tags'
    ];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        const oldValue = sword[field] || '';
        const newValue = updates[field] || '';

        // Only record if value actually changed
        if (oldValue !== newValue) {
          changes[field] = { before: oldValue, after: newValue };
          sword[field] = newValue;
        }
      }
    });

    // Only write if there were actual changes
    if (Object.keys(changes).length > 0) {
      await writeCSV(swords);

      // Record changes in changelog (pass sword data for display)
      await addChangelogEntry(index, sword, changes);

      console.log(`Updated sword ${index} with ${Object.keys(changes).length} changes`);
    }

    res.json({ success: true, sword: swords[swordIndex] });
  } catch (error) {
    console.error('Error updating sword:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get changelog entries
app.get('/api/changelog', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const changelog = await readChangelog();

    // Paginate
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedChangelog = changelog.slice(startIndex, endIndex);

    res.json({
      entries: paginatedChangelog,
      total: changelog.length,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(changelog.length / limitNum),
    });
  } catch (error) {
    console.error('Error fetching changelog:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Admin server running on http://localhost:${PORT}`);
  console.log(`   Network: http://0.0.0.0:${PORT}`);
  console.log(`   API endpoint: http://localhost:${PORT}/api`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
