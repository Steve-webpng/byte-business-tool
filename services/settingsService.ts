

import { Workspace, User, AppIntegration, NotificationSetting } from '../types';

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
const INTEGRATIONS_KEY = 'byete_integrations';
const NOTIFICATIONS_KEY = 'byete_notifications';
const CUSTOM_VOICES_KEY = 'byete_custom_voices';

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

export const hasValidKey = (): boolean => {
  const local = localStorage.getItem(API_KEY_STORAGE);
  const env = process.env.API_KEY;
  // Check if env key is actually populated and not just a placeholder from build systems
  return !!(local && local.trim().length > 0) || !!(env && env.trim().length > 0 && env !== 'undefined');
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

// --- ADVANCED SETTINGS ---

const DEFAULT_INTEGRATIONS: AppIntegration[] = [
    { id: 'slack', name: 'Slack', connected: false, icon: 'Hash', description: 'Send automated notifications to your Slack workspace.' },
    { id: 'gmail', name: 'Gmail', connected: false, icon: 'Mail', description: 'Draft and send emails directly from the CRM.' },
    { id: 'hubspot', name: 'HubSpot', connected: false, icon: 'Hub', description: 'Sync contacts and deals bi-directionally.' },
    { id: 'notion', name: 'Notion', connected: false, icon: 'Doc', description: 'Export docs and notes to your Notion pages.' }
];

export const getIntegrations = (): AppIntegration[] => {
    const data = localStorage.getItem(INTEGRATIONS_KEY);
    return data ? JSON.parse(data) : DEFAULT_INTEGRATIONS;
};

export const saveIntegrations = (integrations: AppIntegration[]) => {
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
};

const DEFAULT_NOTIFICATIONS: NotificationSetting[] = [
    { id: 'task_due', label: 'Task Due Dates', email: true, push: true },
    { id: 'deal_won', label: 'Deal Won', email: true, push: false },
    { id: 'ai_ready', label: 'AI Report Ready', email: false, push: true },
    { id: 'invoice_paid', label: 'Invoice Paid', email: true, push: true },
];

export const getNotificationSettings = (): NotificationSetting[] => {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : DEFAULT_NOTIFICATIONS;
};

export const saveNotificationSettings = (settings: NotificationSetting[]) => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(settings));
};

export const getCustomVoices = (): string[] => {
    const data = localStorage.getItem(CUSTOM_VOICES_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveCustomVoice = (voice: string) => {
    const voices = getCustomVoices();
    if(!voices.includes(voice)) {
        voices.push(voice);
        localStorage.setItem(CUSTOM_VOICES_KEY, JSON.stringify(voices));
    }
};

export const deleteCustomVoice = (voice: string) => {
    const voices = getCustomVoices().filter(v => v !== voice);
    localStorage.setItem(CUSTOM_VOICES_KEY, JSON.stringify(voices));
};
