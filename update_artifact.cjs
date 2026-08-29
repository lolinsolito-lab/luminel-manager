const fs = require('fs');

const tree = fs.readFileSync('c:/luminel manager/project_tree.txt', 'utf8');
const auditPath = 'C:/Users/jaram/.gemini/antigravity-ide/brain/c98a1235-f6e4-43f4-b23f-bb703cfd0970/360_audit_main.md';
let content = fs.readFileSync(auditPath, 'utf8');

const newTreeSection = `## 2. Architettura del Progetto Completo (Albero Super Dettagliato)
Il progetto è sviluppato su uno stack **React (Vite) + Supabase (DB/Auth) + Stripe (Pagamenti)**. 
Di seguito l'albero completo e letterale di tutti i file del progetto, senza raggruppamenti.

\`\`\`text
${tree}
\`\`\`
`;

content = content.replace(/## 2\. Architettura del Progetto Completo \(Mappa 360°\)[\s\S]*?(?=---)/, newTreeSection + '\n');

fs.writeFileSync(auditPath, content, 'utf8');
console.log('Artifact updated');
