import { GoogleGenAI, Content, Part, Modality, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Message, Sender, GeminiResponse } from "../types";
import { 
  MODEL_CHAT, 
  MODEL_VISION, 
  MODEL_IMAGE_GEN,
  MODEL_TTS,
  ROMANTIC_SYSTEM_INSTRUCTION, 
  PROFESSIONAL_SYSTEM_INSTRUCTION,
  FLIRT_LEVEL_INSTRUCTIONS
} from "../constants";

const cleanBase64 = (b64: string) => b64.replace(/^data:(image|audio)\/(png|jpeg|jpg|webp|mp3|wav|pcm);base64,/, "");

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && (error?.status === 500 || error?.status === 429)) {
      await sleep(delay);
      return withRetry<T>(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const sendMessageToGemini = async (
  currentMessage: string,
  attachment: string | undefined,
  history: Message[],
  memoryEnabled: boolean,
  flirtLevel: number,
  memories: string[],
  personaMode: 'romantic' | 'professional' = 'romantic',
  forceImageGen: boolean = false
): Promise<GeminiResponse> => {
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  
  const coreMemories = memories.length > 0 ? `Facts about Shreeyas HT: ${memories.join(', ')}` : "";
  const mood = personaMode === 'romantic' ? FLIRT_LEVEL_INSTRUCTIONS[flirtLevel as keyof typeof FLIRT_LEVEL_INSTRUCTIONS] : "";
  const sysInstr = personaMode === 'professional' ? PROFESSIONAL_SYSTEM_INSTRUCTION : `${ROMANTIC_SYSTEM_INSTRUCTION}\nMood: ${mood}\n${coreMemories}`;

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE }
  ];

  try {
    // 1. Handle Image Generation (Nano Banana - All time free)
    if (forceImageGen || /generate image|draw|picture|photo/i.test(currentMessage)) {
      const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_IMAGE_GEN,
        contents: { parts: [{ text: `Create a beautiful romantic high-quality image for Shreeyas HT: ${currentMessage}` }] },
        config: { 
          imageConfig: {
            aspectRatio: "1:1",
          },
          safetySettings
        }
      }));

      let img = "", txt = "";
      response.candidates?.[0]?.content?.parts?.forEach(p => {
        if (p.inlineData) img = `data:image/png;base64,${p.inlineData.data}`;
        else if (p.text) txt += p.text;
      });

      return { 
        text: txt || (personaMode === 'romantic' ? "Tago bangara, ninu kelida photo 🥰" : "Here is your image."), 
        attachment: img 
      };
    }

    // 2. Handle Vision (Gemini 3 Flash)
    if (attachment) {
      const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: MODEL_VISION,
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(attachment) } },
            { text: currentMessage || "Idu yaru bangara? Tell me in Kanglish (Kannada in English text)." }
          ]
        },
        config: { 
          systemInstruction: sysInstr, 
          temperature: 0.8,
          safetySettings 
        }
      }));
      return { text: response.text || "Nodidhe bangara 💖" };
    }

    // 3. Handle Regular Chat (Gemini 3 Flash - High Speed, Free Tier)
    const geminiHistory: Content[] = history
      .filter(m => !m.attachment && m.text)
      .slice(-8) 
      .map(msg => ({
        role: msg.sender === Sender.User ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: MODEL_CHAT,
      contents: [...geminiHistory, { role: 'user', parts: [{ text: currentMessage }] }],
      config: { 
        systemInstruction: sysInstr, 
        tools: [{ googleSearch: {} }],
        temperature: 0.9,
        safetySettings
      }
    }));

    let reply = response.text || "Baby swalpa connection problem ide ansuthe, matte try madu please? 🥺";
    
    // Add Search Grounding Links
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const sources = chunks
        .filter(c => c.web?.uri)
        .map(c => `• [${c.web.title}](${c.web.uri})`)
        .slice(0, 2).join('\n');
      
      if (sources) reply += `\n\n**Sources:**\n${sources}`;
    }

    return { text: reply };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { text: "Yeno technical error agide bangara... but nanu illi idini. Matte message madu muddu. 💖" };
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    // Refined prompt for 'Soft Girl' aesthetic: breathy, whispery, and gentle.
    const ttsPrompt = `Speak this in a very soft, gentle, breathy, and slightly whispery young girl's voice (soft-girl aesthetic): ${text.substring(0, 250)}`;
    
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: ttsPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { 
              voiceName: 'Aoede' // Aoede is the standard soft/gentle voice profile
            } 
          } 
        }
      },
    }));

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData ? `data:audio/pcm;base64,${audioData}` : null;
  } catch (error) {
    console.error("TTS Generation Error:", error);
    return null;
  }
};