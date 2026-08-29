const fs = require('fs');
const path = require('path');
const filePath = 'c:\\luminel manager\\components\\Clients.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Disable Sync DB button
content = content.replace(
    `<button onClick={handleSyncDatabase} className="text-xs font-bold text-stone-400 hover:text-gold-600 flex items-center gap-1 uppercase tracking-wide"><RefreshCw className="w-3 h-3" /> {t('clients.syncDb')}</button>`,
    `<button disabled className="text-xs font-bold text-stone-300 flex items-center gap-1 uppercase tracking-wide opacity-60 cursor-not-allowed relative group"><RefreshCw className="w-3 h-3" /> {t('clients.syncDb')} <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Presto disponibile</span></button>`
);

// 2. Disable Send Gift button
content = content.replace(
    `<button onClick={(e) => handleOpenGiftModal(e, selectedClient)} className="px-4 py-3 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-colors text-sm font-bold flex items-center justify-center gap-2"><Gift className="w-4 h-4" /> Send Gift</button>`,
    `<button disabled className="px-4 py-3 bg-stone-100/50 text-stone-400 rounded-xl transition-colors text-sm font-bold flex items-center justify-center gap-2 opacity-60 cursor-not-allowed relative group"><Gift className="w-4 h-4" /> Send Gift <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Presto disponibile</span></button>`
);

// 3. Remove calls to the functions so it compiles without them
content = content.replace(/await syncTask\(newTask\);/g, '// await syncTask(newTask);');
content = content.replace(/await sendPromo\(promoClient[\s\S]*?\);/g, '// await sendPromo(promoClient, promoData.offer, promoData.message);');
content = content.replace(/await triggerFullSync\('CLIENTS', clients\);/g, '// await triggerFullSync("CLIENTS", clients);');

fs.writeFileSync(filePath, content);
console.log("Clients.tsx patched");
