
import { GoogleGenAI, Type, LiveServerMessage, Modality, Chat, GenerateContentResponse } from "@google/genai";
// FIX: Added 'Contact' and 'Deal' to type imports for use in new functions.
import { AnalysisResult, Task, ChatMessage, MarketingCampaign, Contact, TranscriptItem, Deal, SEOResult, ChartDataPoint, Course, VideoScene } from "../types";
import { getApiKey, getModelPreference } from "./settingsService";
import { getSavedItems } from "./supabaseService";

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

// ... (Existing Functions for Content, Marketing, SEO, Image Gen, Edit Content, etc. - UNCHANGED) ...
export const generateMarketingContent = async (topic: string, type: string, tone: string, context?: string, contact?: Contact): Promise<string> => {
  const ai = getAIClient();
  let prompt = `${context || ''}\n\nWrite a ${tone} ${type} about "${topic}". Use Markdown formatting. Use Markdown Tables for any structured data or lists of pros/cons. Keep it concise but professional.`;
  if (contact) {
      prompt += `\n\nRECIPIENT DETAILS:\nName: ${contact.name}\nCompany: ${contact.company}\nRole: ${contact.role}\n\nINSTRUCTION: Personalize the content specifically for this recipient. Mention their company or role where appropriate to make it feel bespoke.`;
  }
  const response = await ai.models.generateContent({ model: getModel(), contents: prompt });
  return response.text || "No content generated.";
};

export const generateMarketingCampaign = async (topic: string, tone: string, context?: string): Promise<MarketingCampaign> => {
  const ai = getAIClient();
  const prompt = `${context || ''}\nTopic: ${topic}\nTone: ${tone}\n\nCreate a multi-channel marketing campaign.\n1. An Email (Subject + Body)\n2. A LinkedIn Post\n3. A Twitter Thread (Array of strings)\n\nReturn strict JSON.`;
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
          twitterThread: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["emailSubject", "emailBody", "linkedinPost", "twitterThread"]
      }
    }
  });
  return JSON.parse(response.text || "{}") as MarketingCampaign;
};

export const analyzeSEO = async (content: string): Promise<SEOResult> => {
    const ai = getAIClient();
    const prompt = `Analyze the following content for SEO effectiveness.\nContent: "${content.substring(0, 2000)}..."\n\nProvide:\n1. A Score (0-100).\n2. Detected Keywords (top 5).\n3. Suggestions for improvement (max 3).\n4. Readability Grade (e.g., "8th Grade", "University").\n\nReturn strict JSON.`;
    const response = await ai.models.generateContent({
        model: getModel(),
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    readability: { type: Type.STRING }
                },
                required: ["score", "keywords", "suggestions", "readability"]
            }
        }
    });
    return JSON.parse(response.text || "{}") as SEOResult;
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
      const textPart = response.candidates[0].content.parts.find(p => p.text);
      if (textPart?.text) throw new Error(textPart.text);
    }
  } catch (e: any) {
      console.error("Image Gen Error:", e);
      throw new Error(e.message || "Image generation failed due to an unknown error.");
  }
  throw new Error("No image generated. The model may have refused the prompt due to safety filters.");
};

// New function for Video Images (16:9)
export const generateImageForVideo = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } } // 16:9 for Video
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (e: any) {
      console.error("Video Image Gen Error:", e);
  }
  return ""; // Return empty if failed, caller handles fallback
};

export const editContentWithAI = async (originalText: string, instruction: string, context?: string): Promise<string> => {
  const ai = getAIClient();
  const prompt = `${context || ''}\n\nORIGINAL TEXT:\n"${originalText}"\n\nINSTRUCTION:\n${instruction}\n\nReturn ONLY the rewritten or generated text. Do not add conversational filler.`;
  const response = await ai.models.generateContent({ model: getModel(), contents: prompt });
  return response.text || originalText;
};

export const runGenericTool = async (input: string, systemInstruction: string, context?: string, contact?: Contact, imageBase64?: string): Promise<string> => {
  const ai = getAIClient();
  let fullContentText = context ? `${context}\n\nUSER INPUT:\n${input}` : input;
  if (contact) fullContentText += `\n\nCONTEXT - TARGET AUDIENCE/RECIPIENT:\nName: ${contact.name}\nCompany: ${contact.company}\nRole: ${contact.role}\n\nPlease personalize the output for this specific person/company.`;
  const tableInstruction = "Use Markdown Tables for any comparisons, lists of options, or structured data.";
  const parts: any[] = [{ text: fullContentText }];
  if (imageBase64) {
      const base64Data = imageBase64.split(',')[1];
      const mimeType = imageBase64.split(';')[0].split(':')[1] || 'image/png';
      parts.unshift({ inlineData: { data: base64Data, mimeType: mimeType } });
  }
  const response = await ai.models.generateContent({
    model: getModel(),
    contents: { parts },
    config: { systemInstruction: `${systemInstruction} ${tableInstruction}` }
  });
  return response.text || "No response generated.";
};

// ... (Tasks, CRM, Calendar, Market Research, Data Analysis, Chat, Audio, TTS functions - UNCHANGED) ...
export const generateProjectTasks = async (goal: string, context?: string): Promise<Task[]> => {
    const ai = getAIClient();
    const prompt = `${context || ''}\nGoal: ${goal}\n\nBreak this goal down into 5-10 actionable tasks.\nReturn a JSON array of tasks with 'title', 'description', 'priority' (High/Medium/Low).`;
    const response = await ai.models.generateContent({
        model: getModel(),
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] } }, required: ["title", "priority"] } } }
    });
    const rawTasks = JSON.parse(response.text || "[]");
    return rawTasks.map((t: any) => ({ id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, title: t.title, description: t.description || '', priority: t.priority as Task['priority'], columnId: 'todo' as const }));
};

export const generateSubtasks = async (taskTitle: string, context?: string): Promise<string[]> => {
    const ai = getAIClient();
    const prompt = `${context || ''}\nTask: "${taskTitle}"\n\nBreak this task down into 3-5 smaller, actionable subtasks.\nReturn ONLY a JSON array of strings.`;
    const response = await ai.models.generateContent({
        model: getModel(),
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
    });
    return JSON.parse(response.text || "[]");
};

export const prioritizeTasks = async (tasks: Task[], context?: string): Promise<Task[]> => {
    const ai = getAIClient();
    const taskList = tasks.map(t => ({ id: t.id, title: t.title, description: t.description }));
    const prompt = `${context || ''}\n\nAnalyze these tasks and re-prioritize them based on Impact and Effort.\nTasks: ${JSON.stringify(taskList)}\n\nReturn a JSON array of objects with 'id' and 'priority' ONLY.`;
    const response = await ai.models.generateContent({
        model: getModel(),
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] } }, required: ["id", "priority"] } } }
    });
    const updates = JSON.parse(response.text || "[]");
    const updateMap = new Map<string, Task['priority']>(updates.map((u: any) => [u.id, u.priority]));
    return tasks.map(t => ({ ...t, priority: updateMap.get(t.id) || t.priority }));
};

export const generateContactInsights = async (contact: Contact): Promise<string> => {
    const ai = getAIClient();
    const prompt = `Analyze this contact and provide strategic outreach advice.\nContact Details:\nName: ${contact.name}\nCompany: ${contact.company}\nRole: ${contact.role}\nStatus: ${contact.status}\nNotes: ${contact.notes}\n\nFormat the output in clean, actionable Markdown.`;
    const response = await ai.models.generateContent({ model: getModel(), contents: prompt });
    return response.text || "No insights generated.";
};

export const generateFollowUpEmail = async (contact: Contact, context?: string): Promise<string> => {
    const ai = getAIClient();
    const prompt = `${context || ''}\n\nWrite a polite, professional, and personalized follow-up email to this contact.\nRECIPIENT:\nName: ${contact.name}\nCompany: ${contact.company}\nRole: ${contact.role}\n\nOutput ONLY the email body text.`;
    const response = await ai.models.generateContent({ model: getModel(), contents: prompt });
    return response.text || "Failed to generate email.";
};

export const discoverLeads = async (query: string): Promise<{ name: string; role: string; company: string; }[]> => {
    const ai = getAIClient();
    const prompt = `Using Google Search, identify potential business leads matching: "${query}".\nReturn JSON array of objects with "name", "role", "company".`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = response.text?.trim();
    if (!text) return [];
    try {
      const leads = JSON.parse(text);
      return Array.isArray(leads) ? leads : [];
    } catch (e) { return []; }
};

export const suggestNextDealAction = async (deal: Deal, contact: Contact): Promise<string> => {
    const ai = getAIClient();
    const prompt = `Sales Coach. Analyze deal: ${deal.name}, Stage: ${deal.stage}. Contact: ${contact.name}, ${contact.role}.\nSuggest single best next action.`;
    const response = await ai.models.generateContent({ model: getModel(), contents: prompt });
    return response.text || "Could not determine next action.";
};

export const parseScheduleRequest = async (request: string): Promise<{ title: string; start: string; end: string; description: string }> => {
    const ai = getAIClient();
    const prompt = `Current Date: ${new Date().toISOString()}\nUser Request: "${request}"\nExtract scheduling details (title, start ISO, end ISO). Return JSON.`;
    const response = await ai.models.generateContent({
        model: getModel(),
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, start: { type: Type.STRING }, end: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "start"] } }
    });
    return JSON.parse(response.text || "{}");
};

export const generateMeetingBriefing = async (contact: Contact, context?: string): Promise<string> => {
    const ai = getAIClient();
    const savedItems = await getSavedItems();
    const recentWork = savedItems.slice(0, 3).map(i => `- ${i.title}: ${i.content.substring(0, 100)}...`).join('\n');
    const prompt = `${context || ''}\n\nMeeting with: ${contact.name}, ${contact.company}.\nRecent Work:\n${recentWork}\n\nGenerate a "Pre-Meeting Briefing" in Markdown.`;
    const response = await ai.models.generateContent({ model: getModel(), contents: prompt });
    return response.text || "Briefing generation failed.";
};

export const generateDailyBriefing = async (context: string): Promise<string> => {
    const ai = getAIClient();
    const prompt = `${context}\n\nWrite a concise, 3-bullet morning briefing. Format: **🌤️ Morning Briefing**\n- Bullet 1...`;
    const response = await ai.models.generateContent({ model: getModel(), contents: prompt });
    return response.text || "Have a great day!";
};

export const performMarketResearch = async (query: string, context?: string, mode: string = 'general') => {
  const ai = getAIClient();
  let instruction = `Using the Google Search tool, find real-time information to answer: "${query}".`;
  if (mode === 'competitor') instruction += `\nFocus on direct competitors. Provide a Competitor Matrix.`;
  const prompt = context ? `${context}\n\n${instruction}` : instruction;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return { text: response.text || "No insights found.", groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
};

export const analyzeData = async (textPrompt: string, imageBase64?: string): Promise<AnalysisResult> => {
  const ai = getAIClient();
  const promptText = `Analyze input. 1. Summary. 2. Extract data. 3. Chart type (bar/line/pie). Return JSON. Context: ${textPrompt}`;
  const parts: any[] = [{ text: promptText }];
  if (imageBase64) {
    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.split(';')[0].split(':')[1];
    parts.unshift({ inlineData: { mimeType, data: base64Data } });
  }
  const response = await ai.models.generateContent({
    model: getModel(),
    contents: { parts },
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, type: { type: Type.STRING, enum: ['bar', 'line', 'pie'] }, data: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ['name', 'value'] } } }, required: ['summary', 'data', 'type'] } }
  });
  return JSON.parse(response.text || "{}") as AnalysisResult;
};

export const forecastData = async (currentData: ChartDataPoint[]): Promise<ChartDataPoint[]> => {
    const ai = getAIClient();
    const prompt = `Given data: ${JSON.stringify(currentData)}\nPredict next 3 points. Return JSON array.`;
    const response = await ai.models.generateContent({
        model: getModel(),
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ['name', 'value'] } } }
    });
    const newPoints = JSON.parse(response.text || "[]");
    return [...currentData, ...newPoints];
}

export const streamChat = async function* (message: string, history: ChatMessage[], systemInstruction: string) {
    const ai = getAIClient();
    const chat: Chat = ai.chats.create({
        model: getModel(),
        config: { systemInstruction },
        history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
    });
    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        yield c.text;
    }
};

export const transcribeAndSummarizeAudio = async (base64Audio: string): Promise<{ summary: string; transcription: string; actionItems: string[] }> => {
    const ai = getAIClient();
    const audioData = base64Audio.split(',')[1];
    const mimeType = base64Audio.split(';')[0].split(':')[1] || 'audio/webm';
    const audioPart = { inlineData: { mimeType, data: audioData } };
    const textPart = { text: `Transcribe audio. Create summary. Extract action items. Return JSON: {transcription, summary, actionItems}.` };
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [audioPart, textPart] },
      config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, transcription: { type: Type.STRING }, actionItems: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "transcription", "actionItems"] } },
    });
    return JSON.parse(response.text || "{}");
};

// New: Transcribe and Analyze Audio for Video Creation
export const transcribeAndAnalyzeAudioForVideo = async (base64Audio: string, useWebGrounding: boolean = false): Promise<VideoScene[]> => {
    const ai = getAIClient();
    const audioData = base64Audio.split(',')[1];
    const mimeType = base64Audio.split(';')[0].split(':')[1] || 'audio/webm';
    
    const audioPart = { inlineData: { mimeType, data: audioData } };
    let promptText = `
        Transcribe the audio.
        Break the transcription down into visual scenes based on the content flow.
        For each scene, provide:
        1. "startTime" (in seconds, e.g. 0.0)
        2. "endTime" (in seconds)
        3. "text" (the spoken text segment)
        4. "visualPrompt" (A detailed, descriptive prompt to generate a 16:9 image for this scene. It should describe the setting, objects, and mood. No text overlays.)
        
        Return a JSON array of scene objects.
    `;

    if (useWebGrounding) {
        promptText += `
        IMPORTANT: Use Google Search to find accurate visual details for any specific real-world entities, locations, or historical events mentioned. 
        Incorporate these factual visual details into the "visualPrompt".
        `;
    }

    const config: any = {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    startTime: { type: Type.NUMBER },
                    endTime: { type: Type.NUMBER },
                    text: { type: Type.STRING },
                    visualPrompt: { type: Type.STRING }
                },
                required: ["startTime", "endTime", "text", "visualPrompt"]
            }
        }
    };

    if (useWebGrounding) {
        config.tools = [{ googleSearch: {} }];
        // Note: responseSchema is technically not supported with tools in some versions, but 2.5 flash often handles it.
        // If strict schema fails with tools, we might need to parse raw text.
        // For reliability with tools, we'll try without strict schema if grounding is on, or use Pro model.
        // Let's use Pro model for grounding + structured output capability.
    }

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [audioPart, { text: promptText }] },
        config: config
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response generated");
    
    return JSON.parse(jsonText);
};

export const generateSpeech = async (text: string, voice: string = 'Kore'): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
  });
  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error("No audio generated.");
  return audioData;
};

// ... (Audio decoding and live session helpers - UNCHANGED) ...
export function float32ToInt16(data: Float32Array): Int16Array {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
  return int16;
}
export function encodeAudio(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
export function decodeAudio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}
export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000, numChannels: number = 1): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
export const pcmToWav = (pcmData: Uint8Array, sampleRate: number = 24000, numChannels: number = 1): Blob => {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);
    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.length, true);
    const dataView = new Uint8Array(buffer, 44);
    dataView.set(pcmData);
    return new Blob([buffer], { type: 'audio/wav' });
};
export const analyzeSessionTranscript = async (transcript: TranscriptItem[]): Promise<string> => {
  const ai = getAIClient();
  const conversation = transcript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n');
  const prompt = `Analyze transcript:\n${conversation}\nProvide: Score (1-10), Strengths, Improvements, Feedback. Markdown.`;
  const response = await ai.models.generateContent({ model: getModel(), contents: prompt });
  return response.text || "Unable to analyze session.";
};
export const generateCourseSyllabus = async (topic: string): Promise<Course> => {
    const ai = getAIClient();
    const prompt = `Create syllabus for "${topic}". JSON: {title, description, modules:[{title, lessons:[{title}]}]}.`;
    const response = await ai.models.generateContent({ model: getModel(), contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, modules: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, lessons: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING } }, required: ["title"] } } }, required: ["title", "lessons"] } } }, required: ["title", "description", "modules"] } } });
    const data = JSON.parse(response.text || "{}");
    const course: Course = { id: `course-${Date.now()}`, title: data.title, description: data.description, modules: data.modules.map((m: any) => ({ title: m.title, lessons: m.lessons.map((l: any) => ({ id: `lesson-${Math.random().toString(36).substr(2,9)}`, title: l.title, isCompleted: false })) })), totalLessons: 0, completedLessons: 0 };
    course.totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    return course;
};
export const generateLessonContent = async (courseTitle: string, lessonTitle: string): Promise<{content: string, quiz: any}> => {
    const ai = getAIClient();
    const prompt = `Write lesson "${lessonTitle}" for course "${courseTitle}". JSON: {content: markdown, quiz: {question, options:[], correctAnswer: int}}.`;
    const response = await ai.models.generateContent({ model: getModel(), contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { content: { type: Type.STRING }, quiz: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.INTEGER } }, required: ["question", "options", "correctAnswer"] } }, required: ["content", "quiz"] } } });
    return JSON.parse(response.text || "{}");
};
export const connectLiveSession = async (callbacks: { onOpen: () => void, onMessage: (msg: LiveServerMessage) => void, onClose: (e: CloseEvent) => void, onError: (e: ErrorEvent) => void }, systemInstruction: string = "You are a senior business coach.", voiceName: string = 'Kore') => {
  const ai = getAIClient();
  try { return ai.live.connect({ model: 'gemini-2.5-flash-native-audio-preview-09-2025', callbacks: { onopen: callbacks.onOpen, onmessage: callbacks.onMessage, onclose: callbacks.onClose, onerror: callbacks.onError }, config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } }, systemInstruction: systemInstruction, inputAudioTranscription: { }, outputAudioTranscription: { } } }); } catch (error) { console.error("Failed to connect to Live API", error); throw error; }
};
