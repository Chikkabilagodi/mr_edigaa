import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, Sender } from "../types";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    // Ideally this comes from process.env.API_KEY as per instructions
    const apiKey = process.env.API_KEY || ''; 
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const sendMessageToGemini = async (
  currentMessage: string,
  history: Message[],
  memoryEnabled: boolean
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Transform internal history to Gemini Content format
    // Only include history if memory is enabled
    let geminiHistory: Content[] = [];
    
    if (memoryEnabled) {
      geminiHistory = history.map((msg) => ({
        role: msg.sender,
        parts: [{ text: msg.text } as Part],
      }));
    }

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: geminiHistory,
    });

    const result = await chat.sendMessage({
      message: currentMessage
    });

    return result.text || "";
  } catch (error) {
    console.error("Error communicating with Arohi:", error);
    return "I apologize, but I'm having trouble connecting to my thoughts right now. Please try again in a moment.";
  }
};
