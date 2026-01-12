
import { GoogleGenAI, Type } from "@google/genai";
import { SpecieType, Region, MarketQuote } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchMarketData(specie: SpecieType, region: Region): Promise<MarketQuote> {
  const prompt = `Atue como um analista de mercado agropecuário brasileiro (Scot Consultoria/CEPEA).
  Forneça a cotação atual para ${specie} no estado de ${region}.
  Considere as tendências de hoje. Se for Bovino ou Bubalino, use Arroba (@). Se for Suíno ou Frango, use R$/kg vivo ou carcaça.
  Retorne EXATAMENTE no formato JSON solicitado.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          price: { type: Type.NUMBER, description: 'O valor numérico da cotação.' },
          unit: { type: Type.STRING, description: 'A unidade: @ ou kg.' },
          source: { type: Type.STRING, description: 'Fonte (ex: CEPEA, Scot).' },
          date: { type: Type.STRING, description: 'Data da cotação formatada.' },
          trend: { type: Type.STRING, enum: ['up', 'down', 'stable'], description: 'Tendência de mercado.' },
          commentary: { type: Type.STRING, description: 'Breve análise do mercado para esta espécie e região.' }
        },
        required: ['price', 'unit', 'source', 'date', 'trend', 'commentary']
      }
    }
  });

  try {
    return JSON.parse(response.text) as MarketQuote;
  } catch (error) {
    console.error("Erro ao processar dados do mercado:", error);
    // Fallback data if API fails or returns invalid JSON
    return {
      price: 285.50,
      unit: specie === SpecieType.SUINO || specie === SpecieType.FRANGO ? 'kg' : '@',
      source: 'Estimativa de Mercado',
      date: new Date().toLocaleDateString(),
      trend: 'stable',
      commentary: 'Não foi possível obter dados em tempo real. Exibindo valores médios estimados.'
    };
  }
}
