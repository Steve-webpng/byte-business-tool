
import { Type } from "@google/genai";

export enum AppTool {
  MISSION_CONTROL = 'MISSION_CONTROL',
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  DOCUMENTS = 'DOCUMENTS',
  FILE_CHAT = 'FILE_CHAT',
  VOICE_NOTES = 'VOICE_NOTES',
  AUDIO_STUDIO = 'AUDIO_STUDIO',
  CRM = 'CRM',
  CALENDAR = 'CALENDAR',
  EXPENSE_TRACKER = 'EXPENSE_TRACKER',
  INVOICES = 'INVOICES',
  CONTENT = 'CONTENT',
  RESEARCH = 'RESEARCH',
  ANALYSIS = 'ANALYSIS',
  COACH = 'COACH',
  LIBRARY = 'LIBRARY',
  UNIVERSAL_TOOL = 'UNIVERSAL_TOOL',
  DATABASE = 'DATABASE',
  SETTINGS = 'SETTINGS',
  ADVISOR = 'ADVISOR',
  FOCUS = 'FOCUS'
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

export interface ManualInput {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  placeholder?: string;
}

export interface ManualToolConfig {
  inputs: ManualInput[];
  execute: (values: Record<string, any>) => string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any; // Allow extra keys for multi-line charts or forecasts
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

// Toast Notification System
export type ToastType = 'success' | 'error' | 'info';
export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

// Voice Notes
export interface TranscribedNote {
    id: number;
    createdAt: string;
    summary: string;
    transcription: string;
    actionItems: string[];
}

// CRM
export type ContactStatus = 'Lead' | 'Contacted' | 'Customer' | 'Archived';
export interface Contact {
  id?: number;
  created_at?: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: ContactStatus;
  notes: string;
  last_contacted?: string; // ISO Date
  follow_up_date?: string; // ISO Date
}

// Sales Pipeline / Deals
export type DealStage = 'Lead In' | 'Contact Made' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
    id?: number;
    created_at?: string;
    name: string;
    value: number;
    contact_id: number; // Foreign key to Contact
    stage: DealStage;
    notes: string;
}

// Calendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO String
  end: string; // ISO String
  description?: string;
  contactId?: number; // Link to CRM
  type: 'meeting' | 'task' | 'deadline';
}

// Expense Tracker
export interface Expense {
    id?: number;
    created_at?: string;
    date: string; // ISO String date only
    category: string;
    amount: number;
    description: string;
}

// Invoices
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id?: number;
  created_at?: string;
  invoice_number: string;
  contact_id: number;
  date: string;
  due_date: string;
  items: InvoiceItem[];
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  notes?: string;
}

// SEO Analysis
export interface SEOResult {
    score: number;
    keywords: string[];
    suggestions: string[];
    readability: string;
}
