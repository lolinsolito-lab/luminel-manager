const fs = require('fs');
const auditPath = 'C:/Users/jaram/.gemini/antigravity-ide/brain/c98a1235-f6e4-43f4-b23f-bb703cfd0970/360_audit_main.md';
const tree = fs.readFileSync('c:/luminel manager/project_tree.txt', 'utf8');

let content = fs.readFileSync(auditPath, 'utf8');

const regex = /## 2\. Architettura del Progetto Completo \([\s\S]*?(?=---)/;
const newSection = `## 2. Architettura del Progetto Completo (Mappa 360° - Super Dettagliata)
Il progetto è sviluppato su uno stack **React (Vite) + Supabase (DB/Auth) + Stripe (Pagamenti)**. Di seguito la mappa letterale completa di tutti i file e directory del progetto.

\`\`\`text
C:/luminel manager/
${tree}
\`\`\`

`;

if (regex.test(content)) {
  content = content.replace(regex, newSection);
  fs.writeFileSync(auditPath, content, 'utf8');
  console.log("Updated via node script.");
} else {
  console.log("Regex didn't match.");
}
