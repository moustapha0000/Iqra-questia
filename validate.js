const fs = require('fs');
const content = fs.readFileSync('./src/iqra-quiz/data.ts', 'utf8');

const units = {};
const regex = /const (UNIT_\d+_[A-Z]{2}): Question\[\] = \[([\s\S]*?)\];/g;
let match;

while ((match = regex.exec(content)) !== null) {
  const name = match[1];
  const questionsStr = match[2];
  const qCount = (questionsStr.match(/\{ id:/g) || []).length;
  units[name] = qCount;
}

let missingOrLow = [];
let totalCount = 0;
for (let i = 1; i <= 30; i++) {
  ['FR', 'EN', 'AR'].forEach(lang => {
    const name = `UNIT_${i}_${lang}`;
    if (!units[name]) {
      missingOrLow.push(`${name}: MISSING`);
    } else if (units[name] < 10) {
      missingOrLow.push(`${name}: ${units[name]} questions`);
    } else {
      totalCount++;
    }
  });
}

if (missingOrLow.length === 0) {
  console.log(`All 30 units are present and have at least 10 questions in all 3 languages. Total valid units: ${totalCount}`);
} else {
  console.log("Issues found:");
  console.log(missingOrLow.join('\n'));
}
