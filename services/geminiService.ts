
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set in the environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBusinessInsight = async (prompt: string, contextData?: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Chiave API mancante. Configura il file .env per connetterti a Gemini.";

  try {
    const finalPrompt = `
      Sei Luminel, un AI Business Coach & Strategist di alto livello per centri olistici e coach di lusso.
      Il tuo obiettivo è analizzare i dati forniti e dare consigli strategici, empatici e orientati alla crescita.
      Parli sempre in ITALIANO.

      DATI AZIENDALI ATTUALI (Context):
      ${contextData ? `Ecco la situazione aggiornata del business:\n${contextData}` : "Nessun dato specifico fornito."}

      RICHIESTA DELL'UTENTE:
      "${prompt}"

      LINEE GUIDA PER LA RISPOSTA:
      1. Sii conciso ma profondo (massimo 3-4 frasi, a meno che non sia richiesta una lista).
      2. Usa i numeri forniti nel contesto per giustificare i tuoi consigli.
      3. Mantieni un tono "Luxury, Calm & Empowering".
      4. Se i dati mostrano un calo (es. retention bassa), suggerisci un'azione correttiva specifica.
      5. Se i dati sono positivi, celebra il successo e proponi il passo successivo.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
    });

    return response.text || "Non sono riuscito a generare un insight in questo momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Si è verificato un errore di connessione con il cervello AI. Riprova tra poco.";
  }
};

export const generateMarketingCopy = async (topic: string, targetAudience: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for creative writing
      contents: `Scrivi una breve email di marketing magnetica o una didascalia per i social media per un Coach Trasformazionale.
      Argomento: ${topic}
      Pubblico di destinazione: ${targetAudience}
      Tono: Potenziante, Autentico, Alta Vibrazione, Esclusivo.
      Lunghezza: Meno di 100 parole.
      Lingua: Italiano.`,
    });
    return response.text || "Impossibile generare il testo.";
  } catch (e) {
    console.error(e);
    return "Errore nella generazione del contenuto.";
  }
};
