
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestTicketMetadata = async (description: string, app: string): Promise<{ summary: string; priority: string } | null> => {
  try {
    const prompt = `
      You are an IT Service Desk AI assistant.
      Analyze the following ticket description for the application "${app}".
      
      Description: "${description}"
      
      Tasks:
      1. Create a concise summary (max 10 words).
      2. Suggest a priority level (Low, Medium, High, Critical) based on urgency and impact keywords.
      
      Return ONLY a JSON object with keys "summary" and "priority".
      Example: {"summary": "Login failure on ERP", "priority": "High"}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;

  } catch (error) {
    console.error("Gemini suggestion failed:", error);
    return null;
  }
};

export const triageIssue = async (description: string, availableApps: string[], base64Image?: string): Promise<{ summary: string; priority: string; app: string } | null> => {
  try {
    const appList = availableApps.join(', ');
    const textPart = {
      text: `
        You are an expert IT Support Triage agent.
        A user has described an issue: "${description}"
        
        Tasks:
        1. Summarize the issue into a clear title (max 10 words).
        2. Pick the most likely application. You MUST use one of these exact values (copy as-is): ${appList}. If unsure, pick the closest match (e.g. network/printer/email → use the app id for IT infrastructure).
        3. Assign a priority: Low, Medium, High, or Critical.
        
        Return ONLY a JSON object with keys "summary", "app", and "priority". The "app" value must be exactly one of: ${appList}.
      `
    };

    const parts: any[] = [textPart];
    if (base64Image) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Gemini triage failed:", error);
    return null;
  }
};

export const getInitialSolution = async (description: string, app: string, summary: string): Promise<string> => {
  try {
    const prompt = `
      You are a senior IT Support Engineer. A ticket has just been raised.
      Application: ${app}
      Summary: ${summary}
      Description: ${description}
      
      Provide 3-4 clear, step-by-step troubleshooting steps or a possible solution the user can try right now while waiting for a live engineer.
      Keep it professional, helpful, and concise. Use markdown for bullets.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "I'm analyzing your request. An engineer will be with you shortly.";
  } catch (error) {
    console.error("Gemini solution generation failed:", error);
    return "Please check your network connection and retry the operation. An engineer has been notified.";
  }
};
