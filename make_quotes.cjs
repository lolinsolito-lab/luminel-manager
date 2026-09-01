const fs = require('fs');

async function generateQuotes() {
  console.log("Fetching quotes...");
  
  // Fetching a large list of quotes
  // dummyjson has 1454 quotes, we can fetch limit=365
  const response = await fetch('https://dummyjson.com/quotes?limit=365');
  const data = await response.json();
  
  const backgrounds = [
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1490750967868-bcdf92dd2184?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=2070&auto=format&fit=crop"
  ];

  const quotes = data.quotes.map((q, i) => {
    // assign a background deterministically
    const bg = backgrounds[i % backgrounds.length];
    // escape quotes in text
    const cleanText = q.quote.replace(/"/g, '\\"');
    return `  { text: "${cleanText}", author: "${q.author}", img: backgrounds[${i % backgrounds.length}] }`;
  });

  const fileContent = `// Utility to generate a daily quote based on date specific logic
// Supports special holidays and a rotating list of 365 standard days.

interface QuoteAsset {
  text: string;
  author: string;
  image: string;
}

// Collection of High-Quality Backgrounds
const backgrounds = [
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2070&auto=format&fit=crop", // 0
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop", // 1
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop", // 2
  "https://images.unsplash.com/photo-1490750967868-bcdf92dd2184?q=80&w=2070&auto=format&fit=crop", // 3
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop", // 4
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", // 5
  "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop", // 6
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=2070&auto=format&fit=crop"  // 7
];

// 1. SPECIAL DATES (MM-DD)
const specialDates: Record<string, { text: string; author: string; image: string }> = {
  '01-01': { text: "Ogni nuovo inizio proviene dalla fine di qualche altro inizio.", author: "Seneca", image: backgrounds[0] },
  '12-25': { text: "Non è quanto diamo, ma quanto amore mettiamo nel dare.", author: "Natale", image: backgrounds[7] },
  '12-31': { text: "Scrivi sul tuo cuore che ogni giorno è il giorno più bello dell'anno.", author: "Fine Anno", image: backgrounds[7] }
};

// 2. GENERAL POOL (365 Quotes)
const genericQuotes = [
${quotes.join(',\n')}
];

export const getDailyQuote = (): QuoteAsset => {
  const today = new Date();
  
  // Format MM-DD
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const dateKey = \`\${month}-\${day}\`;

  // 1. Check Special Dates
  if (specialDates[dateKey]) {
    return specialDates[dateKey];
  }

  // 2. Calculate Day of Year (1-366)
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // 3. Rotate through generic quotes (guaranteed to cover 365)
  const quoteIndex = (dayOfYear - 1) % genericQuotes.length;
  const selected = genericQuotes[quoteIndex];

  return {
    text: selected.text,
    author: selected.author,
    image: selected.img
  };
};
`;

  fs.writeFileSync('C:/luminel manager/utils/dailyQuotes.ts', fileContent);
  console.log("365 Quotes written to utils/dailyQuotes.ts");
}

generateQuotes();
