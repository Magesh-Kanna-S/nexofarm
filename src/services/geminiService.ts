import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getFarmerAdvisory(clusterDemand: any, farmerProfile: any) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    As an AI agricultural advisor for SmartFarm Connect, provide sowing recommendations for a farmer.
    
    Cluster Demand Data: ${JSON.stringify(clusterDemand)}
    Farmer Profile: ${JSON.stringify(farmerProfile)}
    
    Recommend 3 crops to sow based on demand, land size, and seasonal suitability.
    Provide reasoning for each recommendation.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING },
            recommendedQuantity: { type: Type.NUMBER },
            sowingWindow: { type: Type.STRING },
            harvestTimeline: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["crop", "recommendedQuantity", "sowingWindow", "harvestTimeline", "reasoning"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function getDemandForecast(subscriptionData: any) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the following consumer subscription data and forecast demand for the next month.
    
    Subscription Data: ${JSON.stringify(subscriptionData)}
    
    Provide a summary of expected demand per crop and identify potential shortages.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          forecast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                crop: { type: Type.STRING },
                expectedQuantity: { type: Type.NUMBER },
                trend: { type: Type.STRING, enum: ["increasing", "stable", "decreasing"] }
              }
            }
          },
          insights: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
}
