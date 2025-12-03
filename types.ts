
import { Type } from "@google/genai";

export enum AppTool {
  MISSION_CONTROL = 'MISSION_CONTROL',
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  DOCUMENTS = 'DOCUMENTS',
  FILE_CHAT = 'FILE_CHAT',
  VOICE_NOTES = 'VOICE_NOTES',
  AUDIO_STUDIO = 'AUDIO_STUDIO',
  BOOK_TO_AUDIO = 'BOOK_TO_AUDIO',
  VIDEO_STUDIO = 'VIDEO_STUDIO',
  CRM = 'CRM',
  CALENDAR = 'CALENDAR',
  EXPENSE_TRACKER = 'EXPENSE_TRACKER',
  INVOICES = 'INVOICES',
  HIRING = 'HIRING',
  ACADEMY = 'ACADEMY',
  CONTENT = 'CONTENT',
  RESEARCH = 'RESEARCH',
  ANALYSIS = 'ANALYSIS',
  COACH = 'COACH',
  LIBRARY = 'LIBRARY',
  UNIVERSAL_TOOL = 'UNIVERSAL_TOOL',
  DATABASE = 'DATABASE',
  SETTINGS = 'SETTINGS',
  ADVISOR = 'ADVISOR',
  FOCUS = 'FOCUS',
  AUTOMATOR = 'AUTOMATOR',
  PROSPECTOR = 'PROSPECTOR',
  FINANCIALS = 'FINANCIALS',
  // New Tools
  EMAIL_MARKETING = 'EMAIL_MARKETING',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  STRATEGY_HUB = 'STRATEGY_HUB',
  TRENDS = 'TRENDS',
  TEAM = 'TEAM',
  ANALYTICS_DASH = 'ANALYTICS_DASH'
}

// Workspace & Collaboration
export interface Workspace {
  id: string;
  name: string;
  role: 'owner' | 'member';
}

export interface User {
  id: string;
  name: string;
  avatar?: string; // URL or Initials
  email: string;
  role?: 'Admin' | 'Editor' | 'Publisher' | 'Viewer';
}

export interface Comment {
  id: string;
  workspace_id: string;
  related_to: 'contact' | 'deal' | 'doc' | 'task';
  related_id: string | number;
  user_id: string; // ID of User
  content: string;
  created_at: string;
  user?: User; // Hydrated
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
  [key: string]: any; 
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

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface SavedItem {
  id: number;
  created_at: string;
  workspace_id: string;
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
  workspace_id?: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  columnId: 'todo' | 'doing' | 'done';
  dueDate?: string; // ISO Date String
  project?: string; // Project Name / Category
  assignee_id?: string; // ID of User
  tags?: string[];
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
  smsCopy?: string;
  viralHook?: string;
  influencerBrief?: string;
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
  workspace_id?: string;
  created_at?: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  role: string;
  location?: string;
  status: ContactStatus;
  notes: string;
  last_contacted?: string; // ISO Date
  follow_up_date?: string; // ISO Date
  lead_score?: number; // 0-100
}

// Sales Pipeline / Deals
export type DealStage = 'Lead In' | 'Contact Made' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
    id?: number;
    workspace_id?: string;
    created_at?: string;
    name: string;
    value: number;
    contact_id: number; // Foreign key to Contact
    stage: DealStage;
    notes: string;
    probability?: number; // 0-100
}

// Calendar
export interface CalendarEvent {
  id: string;
  workspace_id?: string;
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
    workspace_id?: string;
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
  workspace_id?: string;
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

// Academy
export interface Course {
    id: string;
    workspace_id?: string;
    title: string;
    description: string;
    modules: CourseModule[];
    totalLessons: number;
    completedLessons: number;
}

export interface CourseModule {
    title: string;
    lessons: Lesson[];
}

export interface Lesson {
    id: string;
    title: string;
    isCompleted: boolean;
    content?: string; // Markdown content loaded on demand
    quiz?: {
        question: string;
        options: string[];
        correctAnswer: number;
    };
}

// Video Creator
export type VideoAspectRatio = '16:9' | '9:16';

export interface VideoScene {
  startTime: number;
  endTime: number;
  text: string;
  visualPrompt: string;
  editablePrompt: string;
  image?: string; // base64
  regenerating?: boolean;
  words?: { word: string; startTime: number; endTime: number }[];
}

// Automator
export interface Trigger {
  type: 'time' | 'deal_stage' | 'task_created';
  config: Record<string, any>; // e.g. { cron: "0 9 * * 1" } or { stage: "Won" }
}

export interface Action {
  type: 'create_task' | 'send_email' | 'create_invoice' | 'ai_report';
  config: Record<string, any>;
}

export interface Automation {
  id: string;
  name: string;
  active: boolean;
  trigger: Trigger;
  action: Action;
  lastRun?: string;
}

// Prospector
export interface Prospect {
  id?: string;
  name: string;
  role: string;
  company: string;
  email?: string;
  phone?: string;
  location?: string;
  socialPlatform?: 'LinkedIn' | 'Twitter' | 'Instagram' | 'Facebook' | 'TikTok';
  profileUrl?: string;
  confidence: number;
  status?: 'New' | 'Exported';
}

export interface VersionHistory {
  timestamp: string;
  content: string;
  author: string;
}

// Hiring
export interface JobPosting {
  id?: number;
  workspace_id?: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  status: 'Open' | 'Closed' | 'Draft';
  description: string;
  created_at?: string;
}

export interface Candidate {
  id?: number;
  workspace_id?: string;
  job_id: number;
  name: string;
  email: string;
  phone?: string;
  resume_text?: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  fit_score?: number; // 1-10 AI Score
  ai_summary?: string;
  created_at?: string;
}

// Settings
export interface AppIntegration {
  id: string;
  name: string;
  connected: boolean;
  icon: string;
  description?: string;
  config?: Record<string, string>;
}

export interface NotificationSetting {
  id: string;
  label: string;
  email: boolean;
  push: boolean;
}

// New Types for Marketing Suite
export interface SocialPost {
  id: string;
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
  content: string;
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'published';
  image?: string;
  hashtags?: string[];
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'sending' | 'sent';
  openRate?: number;
  clickRate?: number;
  sentCount?: number;
  type: 'broadcast' | 'drip';
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  demographics: string;
  painPoints: string[];
  goals: string[];
  bio: string;
}
