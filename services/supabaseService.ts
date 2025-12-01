

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SavedItem, Contact, Deal, Expense, Invoice, Task, Comment } from '../types';
import { getActiveWorkspaceId, getCurrentUser } from './settingsService';

let supabase: SupabaseClient | null = null;
let currentConfig: { url: string; key: string } | null = null;

const LOCAL_STORAGE_KEYS = {
    SAVED_ITEMS: 'byete_saved_items',
    CONTACTS: 'byete_contacts',
    DEALS: 'byete_deals',
    EXPENSES: 'byete_expenses',
    INVOICES: 'byete_invoices',
    TASKS: 'byete_tasks',
    COMMENTS: 'byete_comments',
};

// Initialize Supabase with user credentials
export const initSupabase = (url: string, key: string) => {
  try {
    supabase = createClient(url, key);
    currentConfig = { url, key };
    return true;
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    return false;
  }
};

export const getSupabaseConfig = () => currentConfig;

export const disconnectSupabase = () => {
  supabase = null;
  currentConfig = null;
};

// Test connection
export const testConnection = async (tableName: string): Promise<boolean> => {
  if (!supabase) return true; 
  try {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    if (error && error.code === '42P01') return false; 
    else if (error) throw error;
    return true;
  } catch (error: any) {
    if (error.message && (error.message.includes('42P01') || error.message.includes(`relation "${tableName}" does not exist`))) {
      return false;
    }
    throw error;
  }
};

// Generic Helpers
const getWorkspaceFilter = () => ({ workspace_id: getActiveWorkspaceId() });

// --- TASKS CRUD ---
export const getTasks = async (): Promise<Task[]> => {
    const wsId = getActiveWorkspaceId();
    try {
        if (supabase) {
            const { data, error } = await supabase.from('tasks').select('*').eq('workspace_id', wsId);
            if (error) throw error;
            return data as Task[];
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.TASKS);
            const all: Task[] = existing ? JSON.parse(existing) : [];
            return all.filter(t => t.workspace_id === wsId);
        }
    } catch (e) { return []; }
};

export const saveTask = async (task: Task): Promise<Task> => {
    const wsId = getActiveWorkspaceId();
    const newTask = { ...task, workspace_id: wsId };
    try {
        if (supabase) {
            await supabase.from('tasks').upsert(newTask);
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.TASKS);
            let all: Task[] = existing ? JSON.parse(existing) : [];
            const idx = all.findIndex(t => t.id === task.id);
            if (idx > -1) all[idx] = newTask;
            else all.push(newTask);
            localStorage.setItem(LOCAL_STORAGE_KEYS.TASKS, JSON.stringify(all));
        }
    } catch(e) {}
    return newTask;
};

export const deleteTask = async (id: string): Promise<void> => {
    try {
        if (supabase) {
            await supabase.from('tasks').delete().eq('id', id);
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.TASKS);
            if(existing) {
                const all: Task[] = JSON.parse(existing);
                localStorage.setItem(LOCAL_STORAGE_KEYS.TASKS, JSON.stringify(all.filter(t => t.id !== id)));
            }
        }
    } catch(e) {}
};

// --- COMMENTS CRUD ---
export const getComments = async (relatedTo: string, relatedId: string | number): Promise<Comment[]> => {
    const wsId = getActiveWorkspaceId();
    try {
        if (supabase) {
            const { data, error } = await supabase.from('comments')
                .select('*')
                .eq('workspace_id', wsId)
                .eq('related_to', relatedTo)
                .eq('related_id', relatedId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data as Comment[];
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.COMMENTS);
            const all: Comment[] = existing ? JSON.parse(existing) : [];
            return all.filter(c => c.workspace_id === wsId && c.related_to === relatedTo && c.related_id == relatedId);
        }
    } catch (e) { return []; }
};

export const addComment = async (relatedTo: 'contact' | 'deal' | 'doc' | 'task', relatedId: string | number, content: string): Promise<Comment> => {
    const wsId = getActiveWorkspaceId();
    const user = getCurrentUser();
    const newComment: Comment = {
        id: `cmt-${Date.now()}`,
        workspace_id: wsId,
        related_to: relatedTo,
        related_id: relatedId,
        user_id: user.id,
        content,
        created_at: new Date().toISOString(),
        user: user // For local display
    };

    try {
        if (supabase) {
            const { error } = await supabase.from('comments').insert([{
                ...newComment,
                user: undefined // Don't send hydrated user object to DB
            }]);
            if (error) throw error;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.COMMENTS);
            const all: Comment[] = existing ? JSON.parse(existing) : [];
            all.push(newComment);
            localStorage.setItem(LOCAL_STORAGE_KEYS.COMMENTS, JSON.stringify(all));
        }
    } catch(e) { console.error(e); }
    return newComment;
};

// --- Saved Items CRUD ---
export const saveItem = async (toolType: string, title: string, content: string): Promise<{ success: boolean; error?: string }> => {
  const wsId = getActiveWorkspaceId();
  try {
    if (supabase) {
      const { error } = await supabase.from('saved_outputs').insert([{ workspace_id: wsId, tool_type: toolType, title, content, created_at: new Date().toISOString() }]);
      if (error) throw error;
      return { success: true };
    } else {
      const newItem: SavedItem = { id: Date.now(), workspace_id: wsId, tool_type: toolType, title, content, created_at: new Date().toISOString() };
      const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_ITEMS);
      const items: SavedItem[] = existing ? JSON.parse(existing) : [];
      items.unshift(newItem);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(items));
      return { success: true };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save" };
  }
};

export const getSavedItems = async (): Promise<SavedItem[]> => {
  const wsId = getActiveWorkspaceId();
  try {
    if (supabase) {
      const { data, error } = await supabase.from('saved_outputs').select('*').eq('workspace_id', wsId).order('created_at', { ascending: false });
      if (error) throw error;
      return data as SavedItem[];
    } else {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_ITEMS);
      const all: SavedItem[] = existing ? JSON.parse(existing) : [];
      return all.filter(i => i.workspace_id === wsId);
    }
  } catch (error) { return []; }
};

export const deleteItem = async (id: number): Promise<boolean> => {
  try {
    if (supabase) {
      const { error } = await supabase.from('saved_outputs').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_ITEMS);
      if (!existing) return false;
      let items: SavedItem[] = JSON.parse(existing);
      items = items.filter(item => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(items));
      return true;
    }
  } catch (error) { return false; }
};

// --- Contacts CRUD ---
export const getContacts = async (): Promise<Contact[]> => {
    const wsId = getActiveWorkspaceId();
    try {
        if (supabase) {
            const { data, error } = await supabase.from('contacts').select('*').eq('workspace_id', wsId).order('name', { ascending: true });
            if (error) throw error;
            return data as Contact[];
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTACTS);
            const all: Contact[] = existing ? JSON.parse(existing) : [];
            return all.filter(c => c.workspace_id === wsId);
        }
    } catch (error) { return []; }
};

export const saveContact = async (contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact | null> => {
    const wsId = getActiveWorkspaceId();
    const newContact = { ...contact, workspace_id: wsId };
    try {
        if (supabase) {
            const { data, error } = await supabase.from('contacts').insert([newContact]).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const contactWithId: Contact = { ...newContact, id: Date.now(), created_at: new Date().toISOString() };
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTACTS);
            const items: Contact[] = existing ? JSON.parse(existing) : [];
            items.push(contactWithId);
            localStorage.setItem(LOCAL_STORAGE_KEYS.CONTACTS, JSON.stringify(items));
            return contactWithId;
        }
    } catch (error) { return null; }
};

export const updateContact = async (contact: Contact): Promise<Contact | null> => {
    if (!contact.id) return null;
    try {
        if (supabase) {
            const { data, error } = await supabase.from('contacts').update(contact).eq('id', contact.id).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTACTS);
            if (!existing) return null;
            let items: Contact[] = JSON.parse(existing);
            const index = items.findIndex(c => c.id === contact.id);
            if (index > -1) {
                items[index] = contact;
                localStorage.setItem(LOCAL_STORAGE_KEYS.CONTACTS, JSON.stringify(items));
                return contact;
            }
            return null;
        }
    } catch (error) { return null; }
};

export const deleteContact = async (id: number): Promise<boolean> => {
    try {
        if (supabase) {
            await supabase.from('contacts').delete().eq('id', id);
            return true;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTACTS);
            if (!existing) return false;
            let items: Contact[] = JSON.parse(existing);
            items = items.filter(c => c.id !== id);
            localStorage.setItem(LOCAL_STORAGE_KEYS.CONTACTS, JSON.stringify(items));
            return true;
        }
    } catch (error) { return false; }
};

// --- Deals CRUD ---
export const getDeals = async (): Promise<Deal[]> => {
    const wsId = getActiveWorkspaceId();
    try {
        if (supabase) {
            const { data, error } = await supabase.from('deals').select('*').eq('workspace_id', wsId).order('created_at', { ascending: false });
            if (error) throw error;
            return data as Deal[];
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.DEALS);
            const all: Deal[] = existing ? JSON.parse(existing) : [];
            return all.filter(d => d.workspace_id === wsId);
        }
    } catch (error) { return []; }
};

export const saveDeal = async (deal: Omit<Deal, 'id' | 'created_at'>): Promise<Deal | null> => {
    const wsId = getActiveWorkspaceId();
    const newDeal = { ...deal, workspace_id: wsId };
    try {
        if (supabase) {
            const { data, error } = await supabase.from('deals').insert([newDeal]).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const dealWithId: Deal = { ...newDeal, id: Date.now(), created_at: new Date().toISOString() };
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.DEALS);
            const items: Deal[] = existing ? JSON.parse(existing) : [];
            items.push(dealWithId);
            localStorage.setItem(LOCAL_STORAGE_KEYS.DEALS, JSON.stringify(items));
            return dealWithId;
        }
    } catch (error) { return null; }
};

export const updateDeal = async (deal: Deal): Promise<Deal | null> => {
    if (!deal.id) return null;
    try {
        const { id, created_at, ...updateData } = deal;
        if (supabase) {
            const { data, error } = await supabase.from('deals').update(updateData).eq('id', deal.id).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.DEALS);
            let items: Deal[] = existing ? JSON.parse(existing) : [];
            const index = items.findIndex(d => d.id === deal.id);
            if (index > -1) {
                items[index] = deal;
                localStorage.setItem(LOCAL_STORAGE_KEYS.DEALS, JSON.stringify(items));
                return deal;
            }
            return null;
        }
    } catch (error) { return null; }
};

export const deleteDeal = async (id: number): Promise<boolean> => {
    try {
        if (supabase) {
            await supabase.from('deals').delete().eq('id', id);
            return true;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.DEALS);
            let items: Deal[] = existing ? JSON.parse(existing) : [];
            items = items.filter(d => d.id !== id);
            localStorage.setItem(LOCAL_STORAGE_KEYS.DEALS, JSON.stringify(items));
            return true;
        }
    } catch (error) { return false; }
};

// --- Expenses & Invoices (Simplified for brevity, follow pattern above) ---
export const getExpenses = async (): Promise<Expense[]> => {
    const wsId = getActiveWorkspaceId();
    // ... Implement using wsId filter ...
    try {
        if (supabase) {
            const { data } = await supabase.from('expenses').select('*').eq('workspace_id', wsId);
            return (data as Expense[]) || [];
        } else {
            const all: Expense[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSES) || '[]');
            return all.filter(e => e.workspace_id === wsId);
        }
    } catch(e) { return []; }
};

export const saveExpense = async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    const wsId = getActiveWorkspaceId();
    const newExp = { ...expense, workspace_id: wsId };
    if (supabase) return await supabase.from('expenses').insert([newExp]);
    // Local storage logic...
    const all = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSES) || '[]');
    all.push({...newExp, id: Date.now(), created_at: new Date().toISOString()});
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES, JSON.stringify(all));
    return true;
};

export const deleteExpense = async (id: number) => {
    if (supabase) await supabase.from('expenses').delete().eq('id', id);
    else {
        const all: Expense[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSES) || '[]');
        localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES, JSON.stringify(all.filter(e => e.id !== id)));
    }
    return true;
};

export const getInvoices = async (): Promise<Invoice[]> => {
    const wsId = getActiveWorkspaceId();
    try {
        if (supabase) {
            const { data } = await supabase.from('invoices').select('*').eq('workspace_id', wsId);
            return (data as Invoice[]) || [];
        } else {
            const all: Invoice[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES) || '[]');
            return all.filter(i => i.workspace_id === wsId);
        }
    } catch(e) { return []; }
};

export const saveInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at'>) => {
    const wsId = getActiveWorkspaceId();
    const newInv = { ...invoice, workspace_id: wsId };
    if (supabase) return await supabase.from('invoices').insert([newInv]);
    const all = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES) || '[]');
    all.push({...newInv, id: Date.now(), created_at: new Date().toISOString()});
    localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(all));
    return true;
};

export const updateInvoice = async (invoice: Invoice) => {
    if (supabase) await supabase.from('invoices').update(invoice).eq('id', invoice.id);
    else {
        const all: Invoice[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES) || '[]');
        const idx = all.findIndex(i => i.id === invoice.id);
        if (idx > -1) all[idx] = invoice;
        localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(all));
    }
    return true;
};

export const deleteInvoice = async (id: number) => {
    if (supabase) await supabase.from('invoices').delete().eq('id', id);
    else {
        const all: Invoice[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES) || '[]');
        localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(all.filter(i => i.id !== id)));
    }
    return true;
};
