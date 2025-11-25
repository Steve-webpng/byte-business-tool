export interface BusinessProfile {
  name: string;
  industry: string;
  audience: string;
  voice: string;
  description: string;
}

const KEY = 'byete_business_profile';

export const getProfile = (): BusinessProfile | null => {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = (profile: BusinessProfile) => {
  localStorage.setItem(KEY, JSON.stringify(profile));
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