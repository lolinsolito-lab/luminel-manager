const fs = require('fs');
const path = require('path');

function generateTree(dir, indent = '') {
  let result = '';
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        result += `${indent}?? ${file}/\n`;
        result += generateTree(fullPath, indent + '  ');
      } else {
        result += `${indent}?? ${file}\n`;
      }
    } catch(e) {}
  }
  return result;
}

const tree = generateTree('c:/luminel manager');
fs.writeFileSync('c:/luminel manager/project_tree.txt', tree, 'utf8');
