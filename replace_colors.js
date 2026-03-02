const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/iqra-quiz/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  { from: /#58cc02/g, to: '#059669' }, // emerald-600
  { from: /#46a302/g, to: '#047857' }, // emerald-700
  { from: /bg-green-50/g, to: 'bg-emerald-50' },
  { from: /bg-green-500/g, to: 'bg-emerald-500' },
  { from: /border-green-700/g, to: 'border-emerald-700' },
  { from: /text-blue-500/g, to: 'text-amber-500' },
  { from: /bg-blue-50/g, to: 'bg-amber-50' },
  { from: /border-blue-400/g, to: 'border-amber-400' },
  { from: /text-blue-600/g, to: 'text-amber-600' },
  { from: /bg-blue-500/g, to: 'bg-amber-500' },
  { from: /border-blue-700/g, to: 'border-amber-700' },
  { from: /text-blue-400/g, to: 'text-amber-400' },
  { from: /bg-\[#f0f2f5\]/g, to: 'bg-stone-50' },
  { from: /bg-white sm:bg-gray-100/g, to: 'bg-stone-50 sm:bg-stone-100' },
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Colors replaced successfully!');
