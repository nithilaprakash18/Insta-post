const fs = require('fs');
const path = require('path');

const genHtml = fs.readFileSync(path.join(__dirname, '../tools/legacy/generate/generator.html'), 'utf8');

const needles = [
  '.slide{position:relative;width:200px;aspect-ratio:4/5;',
  'top:${p.y/1.25}%',
  'h:w*AR[k]',
  'const kind=a=>a.type===\'text\'?a.role||\'sub\':a.type;',
  'const GR=(f,o,b)=>`url(\"data:image/svg+xml,${encodeURIComponent(`<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'${f}\' numOctaves=\'3\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\' opacity=\'${o}\'/></svg>`)}\")`;'
];

let allOk = true;
needles.forEach((needle, idx) => {
  const has = genHtml.includes(needle);
  console.log(`Needle ${idx + 1}: ${has ? 'FOUND' : 'MISSING'}`);
  if (!has) allOk = false;
});

if (allOk) {
  console.log('SUCCESS: All 5 Vite replacement needles match generator.html verbatim.');
} else {
  console.error('ERROR: Missing needles!');
  process.exit(1);
}
