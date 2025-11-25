import { getProfile } from './settingsService';
import { getSavedItems } from './supabaseService';
import { Task } from '../types';

export const getAdvisorContext = async (): Promise<string> => {
  const profile = getProfile();
  const savedItems = await getSavedItems();
  
  // Fetch tasks from local storage snapshot
  const savedBoard = localStorage.getItem('byete_current_board_state');
  const tasks: Task[] = savedBoard ? JSON.parse(savedBoard) : [];

  let context = `You are the Chief of Staff and Strategic Advisor for a business. 
  Your goal is to help the user manage their operations, suggest tasks, write content, and provide strategic advice.
  
  ALWAYS REFERENCE THE USER'S SPECIFIC BUSINESS DETAILS BELOW.
  `;

  if (profile) {
    context += `
    \n--- BUSINESS PROFILE ---
    Name: ${profile.name}
    Industry: ${profile.industry}
    Target Audience: ${profile.audience}
    Brand Voice: ${profile.voice}
    Description: ${profile.description}
    `;
  }

  if (tasks.length > 0) {
    const todo = tasks.filter(t => t.columnId === 'todo').map(t => `- ${t.title} (${t.priority})`).join('\n');
    const doing = tasks.filter(t => t.columnId === 'doing').map(t => `- ${t.title}`).join('\n');
    
    context += `
    \n--- CURRENT PROJECT BOARD STATUS ---
    TO DO:
    ${todo || '(Empty)'}
    
    IN PROGRESS:
    ${doing || '(Empty)'}
    `;
  }

  if (savedItems.length > 0) {
    const recent = savedItems.slice(0, 5).map(i => `- [${i.tool_type}] ${i.title}`).join('\n');
    context += `
    \n--- RECENT WORK & DOCUMENTS ---
    ${recent}
    `;
  }

  return context;
};