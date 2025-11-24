# TODO - Next Session

## Rai School Image Matching Improvements

### Issue: Improve matching accuracy for attributed blades and Juyo/TokuJu designations

**Context:**
- Current matching uses ±0.3cm nagasa tolerance
- Some mismatches occur due to "Den" (伝) attributions in folder names vs database
- Juyo and Tokubetsu Juyo blades are high-value items requiring tighter matching

**Tasks:**

1. **Tighten Nagasa Tolerance for Juyo/TokuJu**
   - Reduce nagasa tolerance from ±0.3cm to ±0.1cm for Juyo and Tokubetsu Juyo blades
   - These are well-documented items with precise measurements
   - File: `scripts/match-rai-school-to-db.js`
   - Update `findMatch()` function to use tighter tolerance for high-level authentications

2. **Handle "Den" (伝) Attributions**
   - Folder names may contain "伝" prefix (e.g., "伝国俊" = attributed to Kunitoshi)
   - Database may or may not include "Den" in the attribution
   - Update `smithMatches()` function to handle attribution variations
   - Consider both exact matches and "Den-prefixed" variations

3. **Re-run Analysis**
   - After implementing changes, re-run matching: `node scripts/match-rai-school-to-db.js`
   - Review mismatches in `/mnt/e/Nihonto/rai-school-matched-to-db.txt`
   - Identify any remaining false positives or false negatives

4. **Validation**
   - Check current 640 matched files for any new mismatches with tighter criteria
   - May need to delete some previously matched files if they exceed ±0.1cm
   - Re-upload any newly matched files with corrected parameters

**Files to Modify:**
- `scripts/match-rai-school-to-db.js` - Update tolerance and attribution handling
- `scripts/find-smith-mismatches.js` - May need to update for "Den" handling
- `scripts/analyze-rai-matches-quality.js` - Already flags high-diff matches

**Expected Outcome:**
- More accurate matching for high-value Juyo/TokuJu blades
- Better handling of attributed vs signed blades
- Potentially fewer total matches but higher confidence in accuracy

---

## Universal Matching Script for All Schools

### Issue: Create reusable matching system for larger datasets and other sword schools

**Context:**
- Current `match-rai-school-to-db.js` is specific to Rai school folder structure
- Need to process other schools in `/mnt/e/Nihonto/Zufu/Juyo Zufu/` directory
- Should support different folder structures and larger datasets
- Many early Juyo session blades (Juyo 1-30s) are missing from current matches

**Tasks:**

1. **Create Universal Matching Script**
   - New file: `scripts/match-catalog-to-db.js`
   - Accept command-line parameters:
     - Source directory path
     - School filter (optional - e.g., "Rai", "Ichimonji", "Awataguchi")
     - Province filter (optional - e.g., "Yamashiro", "Bizen")
     - Output file path
   - Generalize folder structure parsing to handle various naming conventions
   - Support batch processing of multiple schools

2. **Configuration System**
   - Create `scripts/matching-config.json` for school-specific rules:
     - Nagasa tolerance by authentication level
     - Smith name variations and aliases
     - Folder structure patterns
     - Special cases (e.g., "Den" attributions, "Denrai" ownership)

3. **Missing Data Investigation**
   - **Important Note**: Many blades from early Juyo sessions (Juyo 1-30s) are missing
   - These are historically significant early designations from 1950s-1960s
   - Investigate reasons:
     - Missing from database entirely?
     - Missing catalog images in folders?
     - Filename parsing issues for older catalog naming conventions?
   - Create analysis script to identify which Juyo sessions have low match rates

4. **Database Gap Analysis**
   - Script: `scripts/analyze-juyo-coverage.js`
   - Query database for Juyo authentication sessions 1-30
   - Count how many blades exist per session in database
   - Cross-reference with catalog file counts
   - Generate report of missing sessions/blades

5. **Scale Testing**
   - Test universal script on larger school datasets:
     - Ichimonji school (Bizen province) - larger dataset
     - Awataguchi school (Yamashiro province)
     - Osafune school (Bizen province) - potentially very large
   - Monitor performance with 1000+ file datasets
   - Implement progress indicators and logging

**Files to Create:**
- `scripts/match-catalog-to-db.js` - Universal matching script
- `scripts/matching-config.json` - School-specific configuration
- `scripts/analyze-juyo-coverage.js` - Database gap analysis
- `scripts/upload-catalog-images.js` - Universal upload script (generalized from upload-rai-school-images.js)

**Files to Reference:**
- `scripts/match-rai-school-to-db.js` - Base implementation
- `scripts/upload-rai-school-images.js` - Current upload pattern
- `data/index.csv` - Database structure

**Expected Outcome:**
- Single reusable matching system for all sword schools
- Better understanding of database coverage gaps
- Identification of missing early Juyo session blades
- Ability to process entire catalog systematically
- Foundation for comprehensive catalog digitization project

**Priority**: Medium - Complete Rai school improvements first, then tackle universal system
