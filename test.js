const fs = require('fs');
const assert = require('assert');
const html = fs.readFileSync('index.html', 'utf8');
assert(html.includes('ArcGIS Map Viewer'), 'index.html should include the title text');
console.log('Test passed');
