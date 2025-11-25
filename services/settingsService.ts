export interface BusinessProfile {
  name: string;
  industry: string;
  audience: string;
  voice: string;
  description: string;
}

const PROFILE_KEY = 'byete_business_profile';
const API_KEY_STORAGE = 'byete_ai_key';
const MODEL_KEY = 'byete_ai_model';

export const getProfile = (): BusinessProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = (profile: BusinessProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE);
};

export const saveApiKey = (key: string) => {
  localStorage.setItem(API_KEY_STORAGE, key);
};

export const getModelPreference = (): string => {
  return localStorage.getItem(MODEL_KEY) || 'gemini-2.5-flash';
};

export const saveModelPreference = (model: string) => {
  localStorage.setItem(MODEL_KEY, model);
};

export const formatProfileForPrompt = (profile: BusinessProfile | null): string => {
  if (!profile) return '';
  return `
  CONTEXT - BUSINESS PROFILE:
  Name: ${profile.name}
  Industry: ${profile.industry}
  Target Audience: ${profile.audience}
  Brand Voice: ${profile.voice}
  Description: ${profile.description}
  
  Please tailor your response to this business profile context.
  `;
};