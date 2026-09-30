const fs = require('fs');
const h = fs.readFileSync('martello-manual-ru.html', 'utf8');
const m = h.match(/folio-top">5<[\s\S]*?folio-top">6</);
const s = m[0].replace(/data:image[^"']+/g, '[IMG]');
console.log(s.slice(-3000));
