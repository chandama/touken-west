# Touken West

A searchable database of historical Japanese swords featuring 15,097 documented blades from the 7th century through the Edo period.

## Overview

This React application provides an interactive interface to explore a comprehensive catalog of Japanese swords (touken/刀剣). The database includes detailed information about blade dimensions, authentication status, historical periods, smithing schools, and provenance.

## Features

- **Full-text search** across all sword data fields
- **Advanced filtering** by type, school, period, and province
- **Detailed view** with complete specifications for each sword
- **Responsive design** for desktop and mobile devices
- **Pagination** for efficient browsing of large datasets

## Data Coverage

The database includes:
- 15,097 sword entries
- Coverage from Late Heian period through Edo period
- Multiple blade types: Tachi, Katana, Tanto, Wakizashi, and more
- Major smithing schools: Awataguchi, Ichimonji, Osafune, Sanjo, Gojo, and others
- Authentication levels from Kokuho (National Treasure) to Hozon

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd touken-west
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production to the `build` folder
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
touken-west/
├── data/
│   └── index.csv           # Sword database (15,097 entries)
├── public/
│   └── index.html          # HTML entry point
├── src/
│   ├── components/         # React components
│   │   ├── SearchBar.jsx   # Search interface
│   │   ├── FilterPanel.jsx # Filter controls
│   │   ├── SwordTable.jsx  # Data table with pagination
│   │   └── SwordDetail.jsx # Detail modal view
│   ├── hooks/
│   │   └── useSwordData.js # Custom hook for data loading
│   ├── utils/
│   │   └── csvParser.js    # CSV parsing utilities
│   ├── styles/
│   │   ├── index.css       # Global styles
│   │   └── App.css         # Component styles
│   ├── App.js              # Main application component
│   └── index.js            # React entry point
├── CLAUDE.md               # Project documentation for Claude Code
├── package.json
└── README.md
```

## Usage

### Searching

Use the search bar to find swords by any field including:
- Smith name (e.g., "Masamune", "Yoshimitsu")
- School (e.g., "Awataguchi", "Soshu")
- Signature/Mei
- Historical descriptions

### Filtering

Apply filters to narrow results by:
- **Type**: Tachi, Katana, Tanto, Wakizashi, etc.
- **School**: Major smithing schools
- **Period**: Historical periods (Heian, Kamakura, Nanbokucho, etc.)
- **Province**: Geographic origin (Yamashiro, Bizen, Yamato, etc.)

### Viewing Details

Click any row in the table to view complete details including:
- Basic information (type, school, smith, signature)
- Dimensions (length, curvature, width measurements)
- Tang details (condition, holes, engravings)
- Historical context (province, period, authentication)
- Descriptions and provenance
- References and attachments

## Data Schema

See [CLAUDE.md](CLAUDE.md) for detailed information about:
- Column definitions
- Data conventions
- Authentication levels
- Historical periods
- Reference codes
- Blade types and schools

## Technologies

- **React 18** - UI framework
- **PapaParse** - CSV parsing
- **React Scripts** - Build tooling

## Contributing

This is a data repository. If you have corrections or additions to the sword database, please ensure data follows the schema conventions documented in CLAUDE.md.

## License

Data compiled from historical records and public cultural heritage documentation.

## Acknowledgments

This database documents centuries of Japanese metallurgical tradition and includes references to:
- National museums (Tokyo, Kyoto, Nara)
- Cultural property designations
- Historical publications and catalogs
- Museum and private collections
