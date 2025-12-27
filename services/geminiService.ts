
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResponse } from "../types";

// Always initialize with named parameter and direct process.env.API_KEY reference
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePlantImage = async (base64Image: string): Promise<AnalysisResponse> => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    你是一位世界级的智慧农业AI。
    请分析提供的植物图像，提取其“剪影数据”。
    关注形态学指标：高度、冠幅、叶片密度和整体结构。
    提供可操作的农业建议。
    所有返回的内容（植物名称、描述、建议、异常）必须使用中文。
    严格以JSON格式返回。
  `;

  const prompt = `
    分析这张植物照片。重点关注其剪影和生长指标。
    估算：
    1. 植物名称 (plantName)
    2. 指标 (metrics)：高度 (heightCm, 厘米), 冠幅 (canopyWidthCm, 厘米), 叶面积指数 (leafAreaIndex, 0.1-5.0), 健康评分 (healthScore, 0-100), 以及生长阶段 (growthStage)。
    3. 剪影描述 (silhouetteDescription)：描述植物的形状特征。
    4. 检测异常 (detectedAnomalies)：如病虫害、萎蔫、发黄等，若无则为空数组。
    5. 给农民的建议 (recommendations)。
  `;

  // Use ai.models.generateContent with single content object and correct config structure
  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING },
          metrics: {
            type: Type.OBJECT,
            properties: {
              heightCm: { type: Type.NUMBER },
              canopyWidthCm: { type: Type.NUMBER },
              leafAreaIndex: { type: Type.NUMBER },
              healthScore: { type: Type.NUMBER },
              growthStage: { type: Type.STRING },
              detectedAnomalies: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["heightCm", "canopyWidthCm", "leafAreaIndex", "healthScore", "growthStage", "detectedAnomalies"]
          },
          silhouetteDescription: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["plantName", "metrics", "silhouetteDescription", "recommendations"]
      }
    }
  });

  // response.text is a property, not a function
  const text = response.text || "{}";
  return JSON.parse(text) as AnalysisResponse;
};

export const generatePlantSilhouette = async (base64Image: string): Promise<string | null> => {
  const model = "gemini-2.5-flash-image";
  const prompt = "Generate a pure black and white binary silhouette mask of the plant in this image. The plant should be black and the background white. Ensure high contrast and accurate shape preservation.";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Silhouette generation failed:", error);
    return null;
  }
};
