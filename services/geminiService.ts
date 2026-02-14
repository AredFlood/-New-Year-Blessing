import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses contact names from an uploaded image (screenshot of a contact list).
 */
export const parseContactsFromImage = async (base64Image: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: 'Extract all the names of people visible in this contact list screenshot. Return ONLY a valid JSON array of strings, e.g., ["张三", "李四"]. Do not include phone numbers or other text. Do not use markdown code blocks.',
          },
        ],
      },
    });

    let jsonText = response.text || "[]";
    // Clean up potential markdown formatting
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

    const names = JSON.parse(jsonText);
    return Array.isArray(names) ? names : [];
  } catch (error) {
    console.error("Error parsing contacts:", error);
    return [];
  }
};

/**
 * Transcribes audio input using Gemini 2.5 Flash Native Audio.
 */
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/wav', // Assuming recorder outputs WAV or compatible
              data: base64Audio,
            },
          },
          {
            text: 'Please transcribe the speech in this audio exactly as it is spoken. The language is likely Chinese (Mandarin).',
          },
        ],
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return "";
  }
};

/**
 * Generates personalized greetings based on input.
 */
export const generateGreetings = async (
  name: string,
  relationship: string,
  memories: string
): Promise<any> => {
  // Define default values clearly if they are missing
  const safeRelationship = relationship && relationship.trim() ? relationship : 'Friend (朋友)';
  const safeMemories = memories && memories.trim() ? memories : '感谢过去一年的陪伴与支持，祝新年快乐 (Thanks for the company and support over the past year).';

  const prompt = `
    You are a master of Chinese New Year greetings and social etiquette.
    
    Recipient Name: ${name}
    Relationship: ${safeRelationship}
    Special Memories/Context: ${safeMemories}

    Task: Generate 3 distinct types of New Year greetings (in Chinese) for this person based on the memories provided.
    
    1. "formal" (正式书面版): Elegant, respectful, suitable for elders or professional contacts. Use idioms appropriately.
    2. "casual" (日常口语版): Warm, friendly, authentic, suitable for WeChat messages to close friends.
    3. "creative" (花式创意版): Provide 3 distinct creative options.
       - IMPORTANT: One of these options MUST be a "Name Acrostic Poem" (姓名藏头诗) using the characters of the name "${name}".
       - The other two can be short poems, humorous jokes, or pun-based wishes suitable for the New Year.
    
    Output JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formal: { type: Type.STRING },
            casual: { type: Type.STRING },
            creative: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating greetings:", error);
    throw new Error("Failed to generate greetings.");
  }
};