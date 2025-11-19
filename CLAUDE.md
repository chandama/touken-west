# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a data repository containing a comprehensive catalog of Japanese swords (touken/刀剣). The repository contains a single CSV file with 15,097 entries documenting historical Japanese blades from the 7th century through the Edo period.

## Data Structure

The main data file is `data/index.csv` with 19 columns:

- **Index**: Sequential ID (1-15097)
- **School**: Sword-making school (e.g., Sanjo, Gojo, Awataguchi, Ichimonji, Osafune)
- **Smith**: Individual swordsmith name
- **Mei**: Signature/inscription (often in Japanese characters; "Mumei" means unsigned)
- **Type**: Blade classification (Tachi, Katana, Tanto, Wakizashi, Ken, Chokuto, Naginata, Yari)
- **Nagasa**: Blade length in centimeters
- **Sori**: Curvature measurement in centimeters
- **Moto**: Width at base (motohaba) in centimeters
- **Saki**: Width at tip (sakihaba) in centimeters
- **Nakago**: Tang condition (Ubu = original, Suriage = shortened)
- **Ana**: Number of mekugi-ana (holes) in tang
- **Length**: Tang length in centimeters
- **Hori**: Engravings/grooves (Hi = groove, Hori = carving, NA = none)
- **Authentication**: Certification level and current location (Kokuho, Juyo Bunkazai, Juyo, museums, collections)
- **Province**: Region of origin (Yamashiro, Bizen, Yamato, Soshu, Mino, etc.)
- **Period**: Historical period (Late Heian, Early Kamakura, Nanbokucho, Muromachi, Edo)
- **References**: Reference codes from publications and catalogs
- **Description**: Historical notes, provenance, famous names (Denrai = historical ownership, Meito = famous named swords)
- **Attachments**: Associated items (Koshirae = mountings, Sayagaki = appraisal inscriptions, Origami = certificates)

## Data Conventions

### Missing/Unknown Values
- **NA**: Not applicable or data not available
- **XX**: Unknown or uncertain information
- Empty fields: Information not recorded

### Notation Patterns
- **Mumei (無銘)**: Unsigned blade
- **[Square brackets]**: Attributions, alternative readings, or uncertain identifications
- **Denrai**: Historical ownership/provenance chain
- **Meito**: Famous swords with special historical names
- **Saiha (再刃)**: Re-tempered blade
- **Kiritsuke**: Cut or modified inscription
- **Orikaeshi**: Folded inscription
- **Gakumei**: Added signature on nakago
- **Ubu**: Original, unaltered tang
- **Suriage**: Shortened tang (blade was cut down)

### Authentication Levels
- **Kokuho**: National Treasure (highest designation)
- **Juyo Bunkazai**: Important Cultural Property
- **Tokubetsu Juyo**: Especially Important Sword
- **Juyo**: Important Sword (numbered designations like "Juyo 26")
- **Juyo Bijutsuhin**: Important Art Object
- **Tokubetsu Hozon**: Especially Worthy of Preservation
- **Hozon**: Worthy of Preservation

### Historical Periods
- **Ancient**: Kofun, Nara (7th-8th century)
- **Heian**: Late/Early (~794-1185)
- **Kamakura**: Early/Late (~1185-1333) - Golden age of sword making
- **Nanbokucho**: (~1336-1392) - Era of large blades
- **Muromachi**: (~1336-1573)
- **Edo**: Early/Late (~1603-1868)

### Blade Types
- **Tachi (太刀)**: Long sword worn edge-down, typically with more curvature
- **Katana (刀)**: Long sword worn edge-up, later period style
- **Tanto (短刀)**: Dagger (under ~30cm)
- **Wakizashi (脇差)**: Short sword (~30-60cm)
- **Kodachi (小太刀)**: Short tachi
- **Ken (剣)**: Straight double-edged sword
- **Chokuto (直刀)**: Ancient straight sword
- **Naginata (薙刀)**: Pole weapon blade
- **Yari (槍)**: Spear point

### Major Schools
- **Sanjo**: Yamashiro province, Late Heian period (Munechika, Yoshiie)
- **Gojo**: Yamashiro province, Late Heian period
- **Awataguchi**: Yamashiro province, Kamakura period (Kuniyoshi, Norikuni, Yoshimitsu)
- **Ichimonji**: Bizen province, Kamakura period
- **Osafune**: Bizen province, Kamakura-Muromachi periods (Nagamitsu, Kanemitsu)
- **Rai**: Yamashiro province, Kamakura-Nanbokucho
- **Soshu Masamune**: Soshu province, Kamakura period (Masamune, Sadamune)

## Working with the Data

### Character Encoding
The CSV uses UTF-8 encoding and contains Japanese characters (kanji, hiragana). Ensure any tools or scripts handle UTF-8 properly.

### Data Validation
When adding or modifying entries:
- Index must be sequential and unique
- Type should match standard blade classifications
- Measurements (Nagasa, Sori, Moto, Saki) should be in centimeters
- Authentication should follow standard Japanese designation terminology
- Period should align with historical dating conventions
- Use "NA" for missing data, not empty strings where possible
- Preserve Japanese characters in Mei, Description, and other fields

### Common Analysis Tasks
- Filtering by School, Smith, or Type
- Analyzing blade dimensions (Nagasa, Sori) by period or school
- Identifying National Treasures and Important Cultural Properties
- Tracing provenance (Denrai chains)
- Cross-referencing with publication codes in References column
- Analyzing tang condition (Ubu vs Suriage) distribution

### Reference Codes
Common abbreviations in the References column:
- **TB**: Token Bijutsu (numbered volumes)
- **JNZ**: Juyo Nihonto Zufu
- **TJNZ**: Tokubetsu Juyo Nihonto Zufu
- **KOZA**: Nihonto Koza series
- **MKS**: Meito Kanteishu
- **CUL**: Cultural Properties databases
- **JBRN**: Bunkazai Reference Number
- Museum codes: TNM (Tokyo National Museum), KNM (Kyoto National Museum), etc.

## Historical Context

This catalog documents both extant swords and those with known historical records. Many entries reference:
- **Museum collections**: Tokyo/Kyoto/Nara National Museums
- **Shrine dedications**: Swords dedicated to Shinto shrines
- **Imperial collections**: Gyobutsu (imperial family items)
- **Daimyo families**: Tokugawa, Shimazu, Uesugi, Maeda, Date, etc.
- **Famous historical figures**: Toyotomi Hideyoshi, Tokugawa Ieyasu, Uesugi Kenshin, Oda Nobunaga

The data represents centuries of Japanese metallurgical tradition and feudal history, with each entry documenting not just a weapon but a cultural artifact.
