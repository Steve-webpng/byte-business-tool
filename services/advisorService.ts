
import { getProfile } from './settingsService';
import { getSavedItems, getDeals, getExpenses, getContacts, getInvoices } from './supabaseService';
import { Task, Invoice } from '../types';
import { getEvents } from './calendarService';
import { isToday, isPast, parseISO } from 'date-fns';

const MEMORY_KEY = 'byete_strategy_memory';

export const getStrategicMemory = (): string => {
    return localStorage.getItem(MEMORY_KEY) || "";
};

export const updateStrategicMemory = (memory: string) => {
    localStorage.setItem(MEMORY_KEY, memory);
};

export const getAdvisorContext = async (): Promise<string> => {
  const profile = getProfile();
  
  // Fetch all critical business data
  const [savedItems, deals, expenses, contacts, invoices] = await Promise.all([
      getSavedItems(),
      getDeals(),
      getExpenses(),
      getContacts(),
      getInvoices()
  ]);
  
  // Fetch tasks from local storage snapshot
  const savedBoard = localStorage.getItem('byete_current_board_state');
  const tasks: Task[] = savedBoard ? JSON.parse(savedBoard) : [];

  // Calculate Financials
  const totalPipeline = deals.filter(d => d.stage !== 'Lost' && d.stage !== 'Won').reduce((acc, d) => acc + Number(d.value), 0);
  
  const calcInvoiceTotal = (inv: Invoice) => inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const paidRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + calcInvoiceTotal(i), 0);
  const outstandingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((acc, i) => acc + calcInvoiceTotal(i), 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const netCash = paidRevenue - totalExpenses;

  const memory = getStrategicMemory();

  let context = `You are the Chief of Staff and Strategic Advisor for a business. 
  Your goal is to help the user manage their operations, suggest tasks, write content, and provide strategic advice.
  
  You have access to real-time business metrics. USE THEM.
  
  --- LONG-TERM STRATEGIC MEMORY (Important Goals) ---
  ${memory || "No strategic goals set yet. Ask the user for their quarterly focus."}
  
  --- FINANCIAL HEALTH SNAPSHOT ---
  - Total Revenue (Paid Invoices): $${paidRevenue.toLocaleString()}
  - Total Expenses: $${totalExpenses.toLocaleString()}
  - Net Cash Flow: $${netCash.toLocaleString()}
  - Outstanding Invoices (Pending): $${outstandingInvoices.toLocaleString()}
  - Active Pipeline Value (Potential): $${totalPipeline.toLocaleString()}
  
  --- CRM SNAPSHOT ---
  - Total Contacts: ${contacts.length}
  - Leads Pending: ${contacts.filter(c => c.status === 'Lead').length}
  
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
    \n--- RECENT DOCUMENTS & RESEARCH ---
    ${recent}
    `;
  }

  return context;
};

export const getDailyContext = async (): Promise<string> => {
    const profile = getProfile();
    const today = new Date();
    
    // Tasks
    const savedBoard = localStorage.getItem('byete_current_board_state');
    const tasks: Task[] = savedBoard ? JSON.parse(savedBoard) : [];
    const tasksDue = tasks.filter(t => t.columnId !== 'done' && t.dueDate && (isToday(parseISO(t.dueDate)) || isPast(parseISO(t.dueDate))));
    
    // Calendar
    const events = getEvents();
    const todayEvents = events.filter(e => isToday(parseISO(e.start)));
    
    // Invoices
    const invoices = await getInvoices();
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue');

    // Memory
    const memory = getStrategicMemory();

    let context = `Today is ${today.toLocaleDateString()}.
    
    Business: ${profile?.name || 'My Business'}
    User Role: Owner/Executive
    
    STRATEGIC FOCUS: ${memory || "None set."}
    
    -- TODAY'S AGENDA --
    
    📅 EVENTS TODAY (${todayEvents.length}):
    ${todayEvents.map(e => `- ${e.title} at ${new Date(e.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`).join('\n') || "No meetings scheduled."}
    
    ✅ TASKS DUE/OVERDUE (${tasksDue.length}):
    ${tasksDue.map(t => `- ${t.title} (${t.priority})`).join('\n') || "No urgent deadlines."}
    
    💰 ALERTS:
    ${overdueInvoices.length > 0 ? `${overdueInvoices.length} invoices are overdue.` : "No overdue invoices."}
    `;
    
    return context;
}
