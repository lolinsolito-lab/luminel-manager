
// Utility to generate a daily quote based on date specific logic
// Supports special holidays and a rotating list for standard days.

interface QuoteAsset {
  text: string;
  author: string;
  image: string;
}

// Collection of High-Quality Backgrounds (Unsplash)
const backgrounds = {
  nature: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2070&auto=format&fit=crop",
  zen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
  architecture: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
  flower: "https://images.unsplash.com/photo-1490750967868-bcdf92dd2184?q=80&w=2070&auto=format&fit=crop",
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
  abstract: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
  light: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop",
  luxury: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=2070&auto=format&fit=crop"
};

// 1. SPECIAL DATES (MM-DD)
const specialDates: Record<string, { text: string; author: string; image: string }> = {
  '01-01': {
    text: "Ogni nuovo inizio proviene dalla fine di qualche altro inizio.",
    author: "Seneca",
    image: backgrounds.nature
  },
  '03-08': { 
    text: "Le donne sono i veri architetti della società.",
    author: "Festa della Donna",
    image: backgrounds.flower
  },
  '03-19': {
    text: "Un padre è qualcuno a cui guardare, non importa quanto diventi alto.",
    author: "Festa del Papà",
    image: backgrounds.architecture
  },
  '03-21': {
    text: "La primavera è il modo in cui la natura dice: 'Facciamo festa!'",
    author: "Equinozio di Primavera",
    image: backgrounds.nature
  },
  '05-01': {
    text: "Il lavoro allontana da noi tre grandi mali: la noia, il vizio e il bisogno.",
    author: "Festa del Lavoro",
    image: backgrounds.architecture
  },
  '08-15': {
    text: "Riposati. Un campo che ha riposato dà un raccolto abbondante.",
    author: "Ferragosto",
    image: backgrounds.zen
  },
  '10-31': {
    text: "Ci sono notti in cui i lupi stanno in silenzio e solo la luna ulula.",
    author: "Halloween",
    image: backgrounds.abstract
  },
  '11-01': {
    text: "La memoria è il tesoro e il guardiano di tutte le cose.",
    author: "Ognissanti",
    image: backgrounds.light
  },
  '12-25': {
    text: "Non è quanto diamo, ma quanto amore mettiamo nel dare.",
    author: "Natale",
    image: backgrounds.luxury
  },
  '12-31': {
    text: "Scrivi sul tuo cuore che ogni giorno è il giorno più bello dell'anno.",
    author: "Fine Anno",
    image: backgrounds.luxury
  }
};

// 2. GENERAL POOL (Cycling based on Day of Year)
const genericQuotes = [
  { text: "La bellezza inizia nel momento in cui decidi di essere te stesso.", author: "Coco Chanel", img: backgrounds.light },
  { text: "Investi in te stesso, è l'unico investimento che non fallisce mai.", author: "Anonimo", img: backgrounds.mountain },
  { text: "La qualità non è mai un incidente; è sempre il risultato di uno sforzo intelligente.", author: "John Ruskin", img: backgrounds.architecture },
  { text: "Il successo è la somma di piccoli sforzi, ripetuti giorno dopo giorno.", author: "Robert Collier", img: backgrounds.zen },
  { text: "L'unica persona che sei destinato a diventare è la persona che decidi di essere.", author: "Ralph Waldo Emerson", img: backgrounds.nature },
  { text: "Non aspettare. Il tempo non sarà mai 'giusto'.", author: "Napoleon Hill", img: backgrounds.abstract },
  { text: "Il modo migliore per predire il futuro è crearlo.", author: "Peter Drucker", img: backgrounds.architecture },
  { text: "Sii il cambiamento che vuoi vedere nel mondo.", author: "Mahatma Gandhi", img: backgrounds.nature },
  { text: "Fai quello che puoi, con quello che hai, dove sei.", author: "Theodore Roosevelt", img: backgrounds.zen },
  { text: "Tutto ciò che puoi immaginare è reale.", author: "Pablo Picasso", img: backgrounds.abstract },
  { text: "La semplicità è la nota fondamentale di ogni vera eleganza.", author: "Coco Chanel", img: backgrounds.luxury },
  { text: "L'eleganza non è farsi notare, ma farsi ricordare.", author: "Giorgio Armani", img: backgrounds.luxury },
  { text: "Il benessere è il primo dovere della vita.", author: "Oscar Wilde", img: backgrounds.zen },
  { text: "La calma è la culla del potere.", author: "Josiah Gilbert Holland", img: backgrounds.nature },
  { text: "Respira. È solo una brutta giornata, non una brutta vita.", author: "Anonimo", img: backgrounds.zen },
  { text: "La tua vibrazione attrae la tua tribù.", author: "Filosofia Olistica", img: backgrounds.light },
  { text: "Cura il tuo corpo. È l'unico posto in cui devi vivere.", author: "Jim Rohn", img: backgrounds.flower },
  { text: "L'energia fluisce dove va l'attenzione.", author: "Principio Huna", img: backgrounds.abstract },
  { text: "Non contare i giorni, fai in modo che i giorni contino.", author: "Muhammad Ali", img: backgrounds.mountain },
  { text: "La felicità non è una meta, è un modo di viaggiare.", author: "Margaret Lee Runbeck", img: backgrounds.nature }
];

export const getDailyQuote = (): QuoteAsset => {
  const today = new Date();
  
  // Format MM-DD
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const dateKey = `${month}-${day}`;

  // 1. Check Special Dates
  if (specialDates[dateKey]) {
    return specialDates[dateKey];
  }

  // 2. Calculate Day of Year (1-366)
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // 3. Rotate through generic quotes
  const quoteIndex = dayOfYear % genericQuotes.length;
  const selected = genericQuotes[quoteIndex];

  return {
    text: selected.text,
    author: selected.author,
    image: selected.img
  };
};
