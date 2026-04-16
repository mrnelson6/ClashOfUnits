# Clash of Units

Fantasy football tools and analysis for the Clash of Units league.

Live site: [clashofunits.ttnelson.com](https://clashofunits.ttnelson.com)

## Structure

```
ClashOfUnits/
├── docs/                      # GitHub Pages source (served at /)
│   ├── index.html             # Hub landing page
│   ├── style.css
│   ├── CNAME                  # Custom domain
│   └── srm/                   # SRM Adjustment Equalizer tool
│       ├── index.html
│       ├── style.css
│       ├── app.js
│       ├── data.js            # Generated from analysis
│       └── srm_normalized.csv # Downloadable data
└── srm/                       # Python analysis pipeline
    ├── pull_data.py           # Downloads NFL data from nflverse
    ├── category_mapping.py    # Defines all 142 scoring categories
    ├── compute_frequencies.py # Computes freq/impact/normalization
    ├── srmcategories.txt      # Raw league scoring rules
    ├── srm_normalized.csv     # Output
    └── data/                  # Cached NFL data (gitignored)
```

## Tools

### SRM Adjustment Equalizer (`/srm`)

Interactive analysis showing how the current flat +/-1 scoring rule modification system creates a ~41,000x spread in impact across the 142 scoring categories. Includes:

- Bubble and bar chart visualizations
- Head-to-head impact comparison calculator
- Fully sortable/filterable data table of all 142 categories
- Live normalization sandbox (median / mean / custom / Matt's bucketed recommendation)
- Configurable factor caps and rounding

## Regenerating the data

```bash
cd srm
pip install -r requirements.txt
python pull_data.py              # downloads ~200k NFL plays
python compute_frequencies.py --csv   # computes frequencies + CSV

# To sync the CSV into the web page:
cp srm_normalized.csv ../docs/srm/
# Then regenerate data.js (see pull_data.py / compute_frequencies.py for reference)
```

## Deploying

Pushes to `main` auto-deploy via GitHub Pages (source = `docs/` folder).
