import { Type } from "@google/genai";

export enum AppTool {
  MISSION_CONTROL = 'MISSION_CONTROL',
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  DOCUMENTS = 'DOCUMENTS',
  CONTENT = 'CONTENT',
  RESEARCH = 'RESEARCH',
  ANALYSIS = 'ANALYSIS',
  COACH = 'COACH',
  LIBRARY = 'LIBRARY',
  UNIVERSAL_TOOL = 'UNIVERSAL_TOOL',
  DATABASE = 'DATABASE',
  SETTINGS = 'SETTINGS',
  ADVISOR = 'ADVISOR'
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: keyof typeof import('./constants').Icons;
  systemInstruction: string;
  placeholder?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface AnalysisResult {
  summary: string;
  data: ChartDataPoint[];
  type: 'bar' | 'line' | 'pie';
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ResearchResult {
  text: string;
  sources: GroundingChunk[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface SavedItem {
  id: number;
  created_at: string;
  tool_type: string;
  title: string;
  content: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
}

// Kanban Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  columnId: 'todo' | 'doing' | 'done';
}

export interface BoardColumn {
  id: 'todo' | 'doing' | 'done';
  title: string;
  tasks: Task[];
}

export interface MarketingCampaign {
  emailSubject: string;
  emailBody: string;
  linkedinPost: string;
  twitterThread: string[];
}

export interface TranscriptItem {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}