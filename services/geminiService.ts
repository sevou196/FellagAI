import { GoogleGenAI } from "@google/genai";
import { ModelType, AspectRatio } from "../types";

export class GeminiService {
  private static async checkApiKey(model: ModelType): Promise<void> {
    // For Pro/Veo models, user must select their own key via the aistudio helper
    if (model === ModelType.PRO) {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          throw new Error("API_KEY_REQUIRED");
        }
      }
    }
  }

  static async generateImage(
    prompt: string,
    model: ModelType,
    aspectRatio: AspectRatio
  ): Promise<string> {
    await this.checkApiKey(model);

    // Create instance immediately before call to ensure latest key is used
    // process.env.API_KEY is injected by the environment after selection
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Configuration depends on the model
    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    };

    // If using Pro, we can request higher resolution (e.g., 4K for "Ultra-realistic")
    if (model === ModelType.PRO) {
      config.imageConfig.imageSize = "4K";
    }

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [{ text: prompt }],
        },
        config: config,
      });

      // Iterate through parts to find inlineData
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || "image/png";
            return `data:${mimeType};base64,${base64Data}`;
          }
        }
      }

      throw new Error("No image data found in response");
    } catch (error: any) {
      console.error("Gemini Image Generation Error:", error);
      
      if (error.message?.includes("Requested entity was not found") && model === ModelType.PRO) {
         // This can happen if the selected key is invalid or lost. 
         // The UI should catch this and prompt to re-select.
         throw new Error("API_KEY_INVALID");
      }
      
      throw error;
    }
  }
}