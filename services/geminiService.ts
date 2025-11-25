import { GoogleGenAI, Type, LiveServerMessage, Modality, Chat, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, Task, ChatMessage, MarketingCampaign } from "../types";
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
  const prompt = `${context || ''}\n\nWrite a ${tone} ${type} about "${topic}". Use Markdown formatting. Use Markdown Tables for any structured data or lists of pros/cons. Keep it concise but professional.`;
  
  const response = await ai.models.generateContent({
    model: getModel(),
    contents: prompt,
  });
  
  return response.text || "No content generated.";
};

export const generateMarketingCampaign = async (
  topic: string,
  tone: string,
  context?: string
): Promise<MarketingCampaign> => {
  const ai = getAIClient();
  const prompt = `
    ${context || ''}
    Topic: ${topic}
    Tone: ${tone}
    
    Create a multi-channel marketing campaign.
    1. An Email (Subject + Body)
    2. A LinkedIn Post
    3. A Twitter Thread (Array of strings)
    
    Return strict JSON.
  `;

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          emailSubject: { type: Type.STRING },
          emailBody: { type: Type.STRING },
          linkedinPost: { type: Type.STRING },
          twitterThread: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["emailSubject", "emailBody", "linkedinPost", "twitterThread"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No campaign generated");
  return JSON.parse(text) as MarketingCampaign;
};

// --- Image Generation ---
export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  
  // Use specialized image model
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1", 
      }
    }
  });

  // Extract image from response parts
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No image generated. Please try a different prompt.");
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
  const tableInstruction = "Use Markdown Tables for any comparisons, lists of options, or structured data.";

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: fullContent,
    config: {
      systemInstruction: `${systemInstruction} ${tableInstruction}`,
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
      priority: t.priority as Task['priority'],
      columnId: 'todo' as const
  }));
};

export const prioritizeTasks = async (tasks: Task[], context?: string): Promise<Task[]> => {
  const ai = getAIClient();
  const taskList = tasks.map(t => ({ id: t.id, title: t.title, description: t.description }));
  
  const prompt = `
    ${context || ''}
    
    Analyze these tasks and re-prioritize them based on Impact and Effort.
    Assign 'High' priority to high-impact/low-effort tasks.
    Assign 'Medium' to high-impact/high-effort.
    Assign 'Low' to low-impact.
    
    Tasks: ${JSON.stringify(taskList)}
    
    Return a JSON array of objects with 'id' and 'priority' ONLY.
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
                id: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
            },
            required: ["id", "priority"]
        }
      }
    }
  });

  const updates = JSON.parse(response.text || "[]");
  const updateMap = new Map<string, Task['priority']>(updates.map((u: any) => [u.id, u.priority]));

  return tasks.map(t => ({
    ...t,
    priority: updateMap.get(t.id) || t.priority
  }));
};

// --- Market Research with Grounding ---
export const performMarketResearch = async (query: string, context?: string, isDeepDive: boolean = false) => {
  const ai = getAIClient();
  
  let instruction = `Using the Google Search tool, find real-time information to answer: "${query}".`;
  
  if (isDeepDive) {
    instruction += `
      Provide a "Competitor Matrix" or "Data Table" comparing key entities if applicable.
      Structure the response with:
      1. Executive Summary
      2. Key Market Trends
      3. Competitive Analysis (Use a Markdown Table)
      4. Actionable Opportunities
    `;
  } else {
    instruction += `\nProvide a comprehensive summary with key business insights, competitor analysis, and current market trends. Use Markdown Tables where appropriate.`;
  }

  const prompt = context ? `${context}\n\n${instruction}` : instruction;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', 
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
    const systemWithFormatting = `${systemInstruction} Use Markdown formatting for all responses. Use Tables for comparisons or lists of data.`;
    
    const chat: Chat = ai.chats.create({
        model: getModel(),
        config: { systemInstruction: systemWithFormatting },
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
          // Enable transcription
          inputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
          outputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
        },
      });
  } catch (error) {
      console.error("Failed to connect to Live API", error);
      throw error;
  }
};