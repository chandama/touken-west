# Bulk CSV Upload Documentation

## Overview

The bulk upload endpoint allows you to create multiple sword records at once by uploading a CSV file. The system includes duplicate detection and comprehensive error handling.

## Endpoint

```
POST /api/swords/bulk
Content-Type: multipart/form-data
```

## CSV Format

The CSV file must include a header row with the following column names (all columns are optional):

| Column | Description | Default if empty |
|--------|-------------|------------------|
| School | Sword-making school | NA |
| Smith | Individual swordsmith name | Unknown |
| Mei | Signature/inscription | Mumei |
| Type | Blade classification (Tachi, Katana, Tanto, etc.) | NA |
| Nagasa | Blade length in centimeters | NA |
| Sori | Curvature measurement in centimeters | NA |
| Moto | Width at base (motohaba) in centimeters | NA |
| Saki | Width at tip (sakihaba) in centimeters | NA |
| Nakago | Tang condition (Ubu, Suriage, etc.) | NA |
| Ana | Number of mekugi-ana (holes) in tang | NA |
| Length | Tang length in centimeters | NA |
| Hori | Engravings/grooves (Hi, Hori, etc.) | NA |
| Authentication | Certification level and location | NA |
| Province | Region of origin | NA |
| Period | Historical period | NA |
| References | Reference codes from publications | NA |
| Description | Historical notes, provenance | NA |
| Attachments | Associated items (Koshirae, Sayagaki, etc.) | NA |
| Tags | Comma-separated tags for categorization | (empty) |

### Example CSV

```csv
School,Smith,Mei,Type,Nagasa,Sori,Moto,Saki,Nakago,Ana,Length,Hori,Authentication,Province,Period,References,Description,Attachments,Tags
Rai,Kunimitsu,来国光,Tanto,25.5,0.3,2.8,1.9,Ubu,1,8.5,Hi,Juyo 45,Yamashiro,Kamakura,TB 456,Example tanto blade,Koshirae,test-blade
Awataguchi,Yoshimitsu,粟田口吉光,Tanto,23.8,0.2,2.5,1.7,Ubu,1,7.8,NA,Tokubetsu Juyo 8,Yamashiro,Kamakura,TJNZ 012,Famous smith,Sayagaki,test-blade
```

## Duplicate Detection

The system automatically detects duplicates based on the following fields:
- **Smith** (exact match)
- **Mei** (exact match)
- **Type** (exact match)
- **Nagasa** (within ±0.01cm tolerance for floating point precision)

If a duplicate is found, the row is skipped and reported in the `duplicateDetails` response field.

## Response Format

```json
{
  "success": true,
  "results": {
    "total": 10,
    "created": 8,
    "skipped": 1,
    "duplicates": 1,
    "errors": 0,
    "newSwords": [
      {
        "Index": "15098",
        "Smith": "Kunimitsu",
        "Mei": "来国光",
        "Type": "Tanto"
      }
    ],
    "duplicateDetails": [
      {
        "row": 5,
        "csvData": "Kunimitsu 来国光 (Tanto)",
        "existingIndex": "392"
      }
    ],
    "errorDetails": []
  }
}
```

## Usage Examples

### Using cURL

```bash
curl -X POST http://localhost:3002/api/swords/bulk \
  -F "file=@path/to/swords.csv"
```

### Using the Test Script

```bash
# Upload test swords
node scripts/test-bulk-upload.js scripts/bulk-upload-example.csv

# Clean up test swords after testing
node scripts/cleanup-test-swords.js bulk-upload-test
```

### Using Node.js

```javascript
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const form = new FormData();
form.append('file', fs.createReadStream('swords.csv'));

const response = await axios.post('http://localhost:3002/api/swords/bulk', form, {
  headers: { ...form.getHeaders() }
});

console.log('Created:', response.data.results.created);
console.log('Duplicates:', response.data.results.duplicates);
```

## Features

### Automatic Index Assignment
- The system automatically assigns sequential Index numbers
- Index numbers continue from the highest existing Index in the database

### Changelog Integration
- Each created sword generates a changelog entry
- Change type is set to `new_sword`
- All non-empty, non-NA fields are logged as changes

### Error Handling
- Empty rows are automatically skipped
- CSV parsing errors are reported with row numbers
- Processing continues even if individual rows fail
- Detailed error information is returned for debugging

### UTF-8 Support
- Full support for Japanese characters (kanji, hiragana, katakana)
- Proper handling of multi-byte characters in all fields

## Testing Workflow

1. **Prepare test CSV** with a few sample records tagged with a unique identifier (e.g., `bulk-upload-test`)

2. **Upload the CSV**:
   ```bash
   node scripts/test-bulk-upload.js scripts/bulk-upload-example.csv
   ```

3. **Verify results** in the terminal output and check the web interface

4. **Clean up test data**:
   ```bash
   node scripts/cleanup-test-swords.js bulk-upload-test
   ```

## Best Practices

1. **Use Tags for Testing**: Always add a unique tag to test records for easy cleanup
2. **Check for Duplicates**: Review duplicate reports before re-uploading
3. **Validate CSV Format**: Ensure headers match expected column names exactly
4. **UTF-8 Encoding**: Save CSV files with UTF-8 encoding to preserve Japanese characters
5. **Backup Database**: Create a backup before large imports
6. **Start Small**: Test with a small batch before uploading large datasets
7. **Review Changelog**: Check changelog entries to verify all data was imported correctly

## Limitations

- Maximum file size: 10MB
- Only CSV files are accepted (`.csv` extension)
- The Index field in the CSV is ignored (auto-generated)
- MediaAttachments cannot be uploaded via CSV (must use individual media upload endpoint)

## Troubleshooting

### CSV Parsing Errors
- Ensure the file is saved as UTF-8
- Check that there are no unquoted commas in field values
- Verify the header row matches expected column names

### Duplicate Detection
- Review the `duplicateDetails` in the response
- Check if Smith, Mei, Type, and Nagasa match an existing record
- Duplicates are based on exact matches, not partial matches

### Server Errors
- Ensure the admin server is running (`node admin-server/server.js`)
- Check that the CSV file path is correct
- Verify file permissions

## Scripts

- **`scripts/test-bulk-upload.js`**: Upload a CSV file and display results
- **`scripts/cleanup-test-swords.js`**: Remove test swords by tag
- **`scripts/bulk-upload-example.csv`**: Example CSV with 2 test swords
