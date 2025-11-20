# Analysis of Unmatched Juyo 48 Koto Cases

## Summary
- **Total Unmatched:** 18 cases with files
- **Actually in Database:** ~15 cases (can be matched with improved logic)
- **Not in Database:** ~3 cases (may need investigation)

## Root Causes

### 1. **Unicode Macron Normalization Issue** (Most Common)
Characters like ō, ū aren't being normalized properly to o, u

**Affected Cases:**
- Ayanokōji → Ayanokoji (3 swords: Juyo #3, #4, #5)
- Ryōkai → Ryokai (1 sword: Juyo #12)
- Hōjōji → Hojoji (1 sword: Juyo #131)
- Shintōgo → Shintogo (4 swords: Juyo #53, #54, #55, #56)

**Database Entries Found:**
```
431  - Ayanokoji Tachi (74cm)
446  - Ayanokoji Katana (71.1cm)
448  - Ayanokoji Katana (70.2cm)
1563 - Ryokai Tachi (71.6cm)
12781 - Hojoji Naoshi (47.2cm)
3578 - Shintogo Kunimitsu Tanto (29.5cm) - Meito Kojiri Toshi
3591 - Shintogo Kunimitsu Tanto (25.8cm)
3621 - Shintogo Kunimitsu Tanto (24cm)
3631 - Shintogo Kunimitsu Tanto (23.1cm)
```

### 2. **School Prefix in Smith Name**
Some attributions include school name + smith name, but database only has smith name

**Affected Cases:**
- "Ryūmon Nobuyoshi" (Juyo #30)
  - Juyo Index: Attribution = "Ryūmon Nobuyoshi"
  - Database: School = "Senjuin", Smith = "Ryumon Nobuyoshi"
  - **Found:** Index 2463

- "Mino Kanenori" (Juyo #47)
  - Juyo Index: Attribution = "Mino Kanenori"
  - Database: Should be School = "Mino", Smith = "Kanenori"
  - **NOT FOUND in database with Juyo 48**

### 3. **Type Mismatch or Multiple Candidates**
**Chōgi Cases:**
- Juyo #103: Chōgi (Katana) → Database Index 9683 ✓
- Juyo #104: Chōgi (Naoshi) → Database Index 9712 ✓

**Enju Cases:**
- Juyo #134: Enju Kuniyoshi (Tachi) → Database Index 14193 (listed as Katana 64.3cm) ⚠️
  - Possible Tachi→Katana conversion issue

### 4. **Truly Not in Database**
These may genuinely not be in the database:

- Juyo #59: Sengo Masashige (Tantō) - **NOT FOUND**
- Juyo #114: Kiyomitsu (1554) (Katana) - **NOT FOUND**
- Juyo #47: Mino Kanenori (Katana) - **NOT FOUND**

**Note on later Juyo items:**
- Juyo #2: Yasuie (1318) (Tantō)
- Juyo #3: Horikawa Kunihiro (Katana)
These might be from a different book/session numbering

## Solutions

### Solution 1: Enhanced Unicode Normalization
Update the `normalizeSmithName()` function:

```javascript
function normalizeSmithName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    // Normalize all macron characters
    .normalize('NFD')  // Decompose to base + combining marks
    .replace(/[\u0304\u0300-\u036f]/g, '')  // Remove combining diacritical marks
    .replace(/ō/g, 'o')
    .replace(/ū/g, 'u')
    .replace(/ā/g, 'a')
    .replace(/ē/g, 'e')
    .replace(/ī/g, 'i')
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '');
}
```

### Solution 2: School-Aware Matching
For attributions like "Ryūmon Nobuyoshi":
1. Try matching full attribution against smith name
2. If failed, split on space and try last word only
3. Check if first word matches school

### Solution 3: Manual Resolution JSON
Create a manual mapping for edge cases:

```json
{
  "48-1-3": {
    "databaseIndex": 431,
    "notes": "Ayanokoji Tachi - macron issue"
  },
  "48-1-4": {
    "databaseIndex": 446,
    "notes": "Ayanokoji Katana 71.1cm"
  },
  "48-1-59": null,
  "notes": "Sengo Masashige not in database"
}
```

## Detailed Case-by-Case Analysis

| Juyo # | Attribution | Type | DB Index | Issue | Solution |
|--------|-------------|------|----------|-------|----------|
| 3 | Ayanokōji | Tachi | 431 | Macron normalization | Fix normalizer |
| 4 | Ayanokōji | Katana | 446 | Macron normalization | Fix normalizer |
| 5 | Ayanokōji | Katana | 448 | Macron normalization | Fix normalizer |
| 12 | Ryōkai | Tachi | 1563 | Macron normalization | Fix normalizer |
| 30 | Ryūmon Nobuyoshi | Tachi | 2463 | School prefix + macron | Enhance matching |
| 47 | Mino Kanenori | Katana | ? | Not found | Manual check |
| 53 | Shintōgo Kunimitsu | Tantō | 3591 | Macron normalization | Fix normalizer |
| 54 | Shintōgo Kunimitsu | Tantō | 3621 | Macron normalization | Fix normalizer |
| 55 | Shintōgo Kunimitsu | Tantō | 3631 | Macron normalization | Fix normalizer |
| 56 | Shintōgo Kunimitsu | Tantō | 3578 | Macron + Meito name | Fix normalizer |
| 59 | Sengo Masashige | Tantō | ? | Not in database | Verify |
| 103 | Chōgi | Katana | 9683 | Macron normalization | Fix normalizer |
| 104 | Chōgi | Naoshi | 9712 | Macron normalization | Fix normalizer |
| 114 | Kiyomitsu (1554) | Katana | ? | Not found | Manual check |
| 131 | Hōjōji | Naoshi | 12781 | Macron normalization | Fix normalizer |
| 134 | Enju Kuniyoshi | Tachi | 14193 | Type mismatch? | Verify |

## Recommendation

1. **Implement enhanced normalization** - Should resolve ~12 cases
2. **Run matching script again** - Will likely increase matches from 123 to ~135
3. **Manually verify remaining cases** - Check if they're truly missing from database
4. **Create manual override mapping** - For special cases that can't be automatically matched

## Next Steps

Would you like me to:
1. Implement the enhanced normalization function?
2. Create a manual mapping file for the remaining edge cases?
3. Re-run the matching to see improved results?
