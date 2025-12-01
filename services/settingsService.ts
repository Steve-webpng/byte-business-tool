import { Workspace, User } from '../types';

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
const THEME_KEY = 'byete_theme';
const WORKSPACE_KEY = 'byete_active_workspace';
const WORKSPACES_KEY = 'byete_workspaces';

export type Theme = 'light' | 'dark' | 'system';

// --- MOCK USERS ---
export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Me (Owner)', email: 'owner@example.com', avatar: 'ME' },
    { id: 'u2', name: 'Alice Marketing', email: 'alice@example.com', avatar: 'AM' },
    { id: 'u3', name: 'Bob Sales', email: 'bob@example.com', avatar: 'BS' },
];

export const getCurrentUser = (): User => MOCK_USERS[0];
export const getUsers = (): User[] => MOCK_USERS;

// --- WORKSPACE ---
const DEFAULT_WORKSPACE: Workspace = { id: 'ws-default', name: 'My Workspace', role: 'owner' };

export const getWorkspaces = (): Workspace[] => {
    const stored = localStorage.getItem(WORKSPACES_KEY);
    if (!stored) return [DEFAULT_WORKSPACE];
    return JSON.parse(stored);
};

export const createWorkspace = (name: string): Workspace => {
    const newWs: Workspace = { id: `ws-${Date.now()}`, name, role: 'owner' };
    const workspaces = getWorkspaces();
    workspaces.push(newWs);
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    return newWs;
};

export const getActiveWorkspaceId = (): string => {
    return localStorage.getItem(WORKSPACE_KEY) || DEFAULT_WORKSPACE.id;
};

export const setActiveWorkspaceId = (id: string) => {
    localStorage.setItem(WORKSPACE_KEY, id);
    // Dispatch event for components to listen
    window.dispatchEvent(new Event('workspaceChanged'));
};

// --- EXISTING PROFILE & SETTINGS ---

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

export const getTheme = (): Theme => {
  return (localStorage.getItem(THEME_KEY) as Theme) || 'system';
};

export const saveTheme = (theme: Theme) => {
  localStorage.setItem(THEME_KEY, theme);
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