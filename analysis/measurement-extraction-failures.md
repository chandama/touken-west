# PDF Measurement Extraction Failure Analysis

## Summary
- **Total PDFs processed**: 113 (items 26-140)
- **Successful matches**: 85 (75.2%)
- **Failed to extract measurements**: 20 (17.7%)
- **No database match**: 8 (7.1%)
- **Errors**: 0 (0%)

---

## Type 1: Failed to Extract Measurements (20 PDFs)

These PDFs were missing one or more critical measurements (usually **Sakihaba** - width at tip).

### Pattern Analysis:
**Missing Sakihaba (Saki) - 20 cases:**
All 20 failures are missing the `Sakihaba` (width at tip) measurement. The PDF text likely uses different terminology or formatting.

| Item # | File | Nagasa | Sori | Moto | Saki |
|--------|------|--------|------|------|------|
| 32 | Yamato Yoshimitsu | 26.7 | ❌ | 2.4 | ❌ |
| 33 | Yamato Yoshimitsu | 23.3 | 0.4 | 2.05 | ❌ |
| 51 | Kashu Sanekage | 28.9 | ❌ | 2.4 | ❌ |
| 53-56 | Shintogo Kunimitsu (4 PDFs) | ✓ | ✓ | ✓ | ❌ |
| 57 | Akihiro | 29.95 | 0.3 | 2.4 | ❌ |
| 58 | Nakahara Kunimune | 70.3 | 2.1 | 2.6 | ❌ |
| 59 | Sengo Masashige | 27.7 | 0.3 | 2.65 | ❌ |
| 77 | Kagemitsu | 26.45 | ❌ | 2.1 | ❌ |
| 97 | Nariie | 43.7 | 0.8 | 2.75 | ❌ |
| 101 | Motoshige | 32.3 | 0.5 | 2.8 | ❌ |
| 104 | Chogi | 41.45 | 1.4 | 2.75 | ❌ |
| 111 | Morimitsu | 36.4 | 0.2 | 2.55 | ❌ |
| 113 | Shigenori | 35.8 | 0.4 | 2.9 | ❌ |
| 120 | Tsuguyoshi | 26.9 | 0.2 | 2.35 | ❌ |
| 121 | Toshitsugu | 27.2 | 0.1 | 2.3 | ❌ |
| 133 | Sa Kunihiro | 30.4 | 0.3 | 2.85 | ❌ |
| 135 | Kunisuke | 55 | 1.5 | 3.05 | ❌ |

### Root Cause:
The PDF text parsing regex doesn't match the format used for Sakihaba in these documents. Possible reasons:
- Different terminology (e.g., "先幅" vs "Sakihaba")
- Different formatting (measurements in a table vs. inline text)
- OCR quality issues
- Missing data in the original PDF

---

## Type 2: No Database Match (8 PDFs)

These PDFs had all measurements extracted successfully, but no sword in the database matched within ±0.15cm tolerance.

| Item # | File | Nagasa | Sori | Moto | Saki | Possible Issue |
|--------|------|--------|------|------|------|----------------|
| 46 | Kaneyuki | 67.6 | 1.4 | 2.9 | 2.45 | No DB match |
| 47 | Kanenori | 74.3 | 2.4 | 2.9 | 1.85 | No DB match |
| 63 | Sukekane Hamon | 68.7 | 2.2 | 2.8 | 1.9 | No DB match |
| 68 | Ichimonji | **4.1** | 1.2 | 2.75 | 2 | **Bad OCR** (Nagasa too small) |
| 75 | Nagamitsu | 68.5 | 1.5 | 2.6 | 1.65 | No DB match |
| 106 | Kencho | 53.75 | 1.2 | 2.9 | 2.55 | No DB match |
| 114 | Kiyomitsu | 71 | 2.8 | 3.3 | 2.45 | No DB match |
| 126 | Kiyotsuna | 67.3 | 2 | 3.1 | 1.9 | No DB match |

### Root Cause:
- **Measurement discrepancies**: Database values might differ slightly (>0.15cm)
- **OCR errors**: Item #68 shows obvious OCR error (Nagasa = 4.1cm is impossibly small for a sword)
- **Missing from database**: Some swords in the PDF catalog might not be in our database
- **Tolerance too strict**: ±0.15cm might be too tight for some cases

---

## Recommendations

### For Type 1 (Missing Sakihaba):
1. **Improve regex patterns** in `match-juyo48-pdfs.js:39-40`:
   ```javascript
   // Current pattern
   const sakiMatch = text.match(/(?:Sakihaba|Saki-haba|Tip width)[\s:]+(\d+\.?\d*)\s*cm/i);

   // Add Japanese terms and variations
   const sakiMatch = text.match(/(?:Sakihaba|Saki-haba|Tip width|先幅|先巾|Sakihaba)[\s:：]+(\d+\.?\d*)\s*cm/i);
   ```

2. **Manual extraction**: For the 20 failed PDFs, manually extract Sakihaba values

3. **Table parsing**: Implement structured table parsing for PDFs with measurement tables

### For Type 2 (No Database Match):
1. **Increase tolerance**: Try ±0.2cm or ±0.3cm for difficult matches
2. **Manual review**: Check if these 8 swords are actually in the database with different measurements
3. **Fuzzy matching**: Implement partial matching (e.g., match on 3 out of 4 measurements)
4. **Fix OCR errors**: Item #68 needs manual correction

---

## Files to Review

Failed PDFs are located in: `temp-juyo48-koto/`

**High priority for manual review:**
- `JT-48-1-068 Ichimonji.pdf` (obvious OCR error)
- All 4 Shintogo Kunimitsu PDFs (#53-56) - same smith, same issue
- Yamato Yoshimitsu PDFs (#32-33) - missing multiple measurements

**Script location:**
- Extraction script: `scripts/match-juyo48-pdfs.js`
- Regex patterns: Lines 16-50
