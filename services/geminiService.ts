import { GoogleGenAI, Type, LiveServerMessage, Modality, Chat, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, Task, ChatMessage } from "../types";
import { getApiKey, getModelPreference } from "./settingsService";

const getAIClient = () => {
  // 1. Try User Setting
  const userKey = getApiKey();
  if (userKey) return new GoogleGenAI({ apiKey: userKey });

  // 2. Try Environment Variable (Fallback)
  const envKey = process.env.API_KEY;
  if (envKey) return new GoogleGenAI({ apiKey: envKey });

  throw new Error("API Key missing. Please configure it in Settings.");
};

const getModel = () => {
  return getModelPreference();
};

// --- Content Generation ---
export const generateMarketingContent = async (
  topic: string,
  type: string,
  tone: string,
  context?: string
): Promise<string> => {
  const ai = getAIClient();
  const prompt = `${context || ''}\n\nWrite a ${tone} ${type} about "${topic}". Use Markdown formatting. Keep it concise but professional.`;
  
  const response = await ai.models.generateContent({
    model: getModel(),
    contents: prompt,
  });
  
  return response.text || "No content generated.";
};

// --- Smart Doc Editor AI ---
export const editContentWithAI = async (
  originalText: string,
  instruction: string,
  context?: string
): Promise<string> => {
  const ai = getAIClient();
  
  const prompt = `
    ${context || ''}
    
    ORIGINAL TEXT:
    "${originalText}"
    
    INSTRUCTION:
    ${instruction}
    
    Return ONLY the rewritten or generated text. Do not add conversational filler.
  `;

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: prompt,
  });
  
  return response.text || originalText;
};

// --- Generic Tool Runner ---
export const runGenericTool = async (
  input: string,
  systemInstruction: string,
  context?: string
): Promise<string> => {
  const ai = getAIClient();
  
  // Prepend context to the user input
  const fullContent = context ? `${context}\n\nUSER INPUT:\n${input}` : input;

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: fullContent,
    config: {
      systemInstruction: systemInstruction,
    }
  });
  
  return response.text || "No response generated.";
};

// --- Project Tasks Generation ---
export const generateProjectTasks = async (goal: string, context?: string): Promise<Task[]> => {
  const ai = getAIClient();
  const prompt = `
    ${context || ''}
    Goal: ${goal}
    
    Break this goal down into 5-10 actionable tasks. 
    Return a JSON array of tasks with 'title', 'description', 'priority' (High/Medium/Low).
    Do not wrap in markdown code blocks.
  `;

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
            },
            required: ["title", "priority"]
        }
      }
    }
  });
  
  const rawTasks = JSON.parse(response.text || "[]");
  
  // Augment with IDs and default column
  return rawTasks.map((t: any) => ({
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      columnId: 'todo'
  }));
};

// --- Market Research with Grounding ---
export const performMarketResearch = async (query: string, context?: string) => {
  const ai = getAIClient();
  
  const prompt = context 
    ? `${context}\n\nUsing the Google Search tool, find real-time information to answer: "${query}".\nProvide a comprehensive summary with key business insights, competitor analysis, and current market trends.` 
    : `Using the Google Search tool, find real-time information to answer: "${query}".\nProvide a comprehensive summary with key business insights, competitor analysis, and current market trends.`;

  // Note: Grounding usually requires a specific model (like gemini-2.0-flash-exp or similar that supports tools). 
  // We'll stick to the user preference, but ideally enforce a capable model if the user selects a basic one.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Force standard model for search compatibility if needed, or use getModel()
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text || "No insights found.",
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

// --- Data Analysis & Visualization ---
export const analyzeData = async (
  textPrompt: string, 
  imageBase64?: string
): Promise<AnalysisResult> => {
  const ai = getAIClient();
  
  const promptText = `
    Analyze the provided input (text or image). 
    1. Provide a brief textual summary of the insights (max 2 sentences).
    2. Extract or representative data that can be visualized in a chart.
    3. Choose the best chart type (bar, line, pie).
    4. Return valid JSON matching the schema.
    Context: ${textPrompt}
  `;

  const parts: any[] = [{ text: promptText }];
  
  if (imageBase64) {
    // Determine mime type roughly or default to png/jpeg (GenAI is forgiving with base64)
    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.split(';')[0].split(':')[1];
    
    parts.unshift({
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    });
  }

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['bar', 'line', 'pie'] },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.NUMBER }
              },
              required: ['name', 'value']
            }
          }
        },
        required: ['summary', 'data', 'type']
      }
    }
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No analysis generated");
  return JSON.parse(jsonText) as AnalysisResult;
};

// --- Chat with History (Streaming) ---
export const streamChat = async function* (
    message: string, 
    history: ChatMessage[],
    systemInstruction: string
) {
    const ai = getAIClient();
    
    // Convert generic history to SDK format
    // Note: The SDK manages its own history if you use the same chat object, 
    // but here we are stateless between renders, so we reconstruct or use a new chat.
    // For simplicity, we initialize a new chat with history each time.
    const chat: Chat = ai.chats.create({
        model: getModel(),
        config: { systemInstruction },
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        }))
    });

    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        yield c.text;
    }
};

// --- Live API Helpers ---

// Audio Utils
export function float32ToInt16(data: Float32Array): Int16Array {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return int16;
}

export function encodeAudio(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeAudio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Live Connection Factory
export const connectLiveSession = async (
  callbacks: {
    onOpen: () => void,
    onMessage: (msg: LiveServerMessage) => void,
    onClose: (e: CloseEvent) => void,
    onError: (e: ErrorEvent) => void
  },
  systemInstruction: string = "You are a senior business coach."
) => {
  const ai = getAIClient();
  try {
      return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: callbacks.onOpen,
          onmessage: callbacks.onMessage,
          onclose: callbacks.onClose,
          onerror: callbacks.onError,
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: systemInstruction,
        },
      });
  } catch (error) {
      console.error("Failed to connect to Live API", error);
      throw error;
  }
};