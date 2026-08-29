const fs = require('fs');
let content = fs.readFileSync('c:/luminel manager/components/LandingV2.tsx', 'utf8');

// Find the split section comment and insert CategoriesSection before it
// Search for the line that has the split section
const marker = '<section style={{ maxWidth: \'88rem\', margin: \'0 auto\', padding: \'2rem 1.5rem 6rem\'';

if (content.includes(marker)) {
  content = content.replace(marker, '<CategoriesSection />\n\n        ' + marker);
  fs.writeFileSync('c:/luminel manager/components/LandingV2.tsx', content, 'utf8');
  console.log('SUCCESS: CategoriesSection inserted');
} else {
  console.log('MARKER NOT FOUND, dumping nearby content...');
  const idx = content.indexOf('SPLIT');
  console.log(content.substring(idx - 50, idx + 300));
}
