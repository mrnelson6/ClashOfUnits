const fs = require('fs');

// Extract and eval just the APPENDIX_ROW_MAP
const src = fs.readFileSync('../docs/srm/app.js', 'utf8');
const match = src.match(/const APPENDIX_ROW_MAP = \[([\s\S]*?)\];/);
eval('var APPENDIX_ROW_MAP = [' + match[1] + '];');

// Read CSV
const csv = fs.readFileSync('data/Appendix _A__ A Clash of Units Scoring Rule Modifications - Rules by Year.csv', 'utf8');
const csvLines = csv.trim().split('\n');

console.log('Row map:', APPENDIX_ROW_MAP.length, 'entries');
console.log('CSV:', csvLines.length, 'lines');
console.log();

if (APPENDIX_ROW_MAP.length !== csvLines.length) {
  console.log('LENGTH MISMATCH:', APPENDIX_ROW_MAP.length, 'vs', csvLines.length);
  console.log();
}

let mismatches = 0;
const maxRows = Math.max(APPENDIX_ROW_MAP.length, csvLines.length);
for (let i = 0; i < maxRows; i++) {
  const cat = APPENDIX_ROW_MAP[i];
  const csvName = (csvLines[i] || '').split(',')[0].replace(/^"|"$/g, '').trim();
  if (cat !== null && cat !== undefined) {
    const catLower = cat.toLowerCase().substring(0, 12);
    const csvLower = csvName.toLowerCase().substring(0, 12);
    if (!csvLower.includes(catLower.substring(0, 8)) && !catLower.includes(csvLower.substring(0, 8))) {
      console.log(`Row ${i+1}: MISMATCH  map="${cat}"  csv="${csvName}"`);
      mismatches++;
    }
  }
}
if (mismatches === 0) console.log('All category rows align!');
else console.log(mismatches + ' mismatches');
