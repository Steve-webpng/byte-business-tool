
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SavedItem, Contact, Deal, Expense, Invoice } from '../types';

let supabase: SupabaseClient | null = null;
let currentConfig: { url: string; key: string } | null = null;
const LOCAL_STORAGE_KEY_SAVED_ITEMS = 'byete_saved_items';
const LOCAL_STORAGE_KEY_CONTACTS = 'byete_contacts';
const LOCAL_STORAGE_KEY_DEALS = 'byete_deals';
const LOCAL_STORAGE_KEY_EXPENSES = 'byete_expenses';
const LOCAL_STORAGE_KEY_INVOICES = 'byete_invoices';

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

// Test connection by checking for a specific table
export const testConnection = async (tableName: 'saved_outputs' | 'contacts' | 'deals' | 'expenses' | 'invoices'): Promise<boolean> => {
  if (!supabase) return true; // Local mode is always "connected" in a way
  try {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    
    // Error code 42P01 is undefined_table
    if (error && error.code === '42P01') {
      return false; // Connection OK, Table Missing
    } else if (error) {
      throw error; // Other error, likely auth
    }
    return true; // Connection OK, Table Exists
  } catch (error: any) {
    if (error.message && (error.message.includes('42P01') || error.message.includes(`relation "${tableName}" does not exist`))) {
      return false;
    }
    throw error;
  }
};


// --- Saved Items CRUD ---

export const saveItem = async (toolType: string, title: string, content: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (supabase) {
      const { error } = await supabase.from('saved_outputs').insert([{ tool_type: toolType, title, content, created_at: new Date().toISOString() }]);
      if (error) throw error;
      return { success: true };
    } else {
      const newItem: SavedItem = { id: Date.now(), tool_type: toolType, title, content, created_at: new Date().toISOString() };
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED_ITEMS);
      const items: SavedItem[] = existing ? JSON.parse(existing) : [];
      items.unshift(newItem);
      localStorage.setItem(LOCAL_STORAGE_KEY_SAVED_ITEMS, JSON.stringify(items));
      return { success: true };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save" };
  }
};

export const getSavedItems = async (): Promise<SavedItem[]> => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('saved_outputs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as SavedItem[];
    } else {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED_ITEMS);
      return existing ? JSON.parse(existing) : [];
    }
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};

export const deleteItem = async (id: number): Promise<boolean> => {
  try {
    if (supabase) {
      const { error } = await supabase.from('saved_outputs').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED_ITEMS);
      if (!existing) return false;
      let items: SavedItem[] = JSON.parse(existing);
      items = items.filter(item => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY_SAVED_ITEMS, JSON.stringify(items));
      return true;
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    return false;
  }
};

// --- Contacts CRUD ---

export const getContacts = async (): Promise<Contact[]> => {
    try {
        if (supabase) {
            const { data, error } = await supabase.from('contacts').select('*').order('name', { ascending: true });
            if (error) throw error;
            return data as Contact[];
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_CONTACTS);
            return existing ? JSON.parse(existing) : [];
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return [];
    }
};

export const saveContact = async (contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact | null> => {
    try {
        if (supabase) {
            const { data, error } = await supabase.from('contacts').insert([contact]).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const newContact: Contact = { ...contact, id: Date.now(), created_at: new Date().toISOString() };
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_CONTACTS);
            const items: Contact[] = existing ? JSON.parse(existing) : [];
            items.push(newContact);
            localStorage.setItem(LOCAL_STORAGE_KEY_CONTACTS, JSON.stringify(items));
            return newContact;
        }
    } catch (error) {
        console.error("Error saving contact:", error);
        return null;
    }
};

export const updateContact = async (contact: Contact): Promise<Contact | null> => {
    if (!contact.id) return null;
    try {
        if (supabase) {
            const { data, error } = await supabase.from('contacts').update(contact).eq('id', contact.id).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_CONTACTS);
            if (!existing) return null;
            let items: Contact[] = JSON.parse(existing);
            const index = items.findIndex(c => c.id === contact.id);
            if (index > -1) {
                items[index] = contact;
                localStorage.setItem(LOCAL_STORAGE_KEY_CONTACTS, JSON.stringify(items));
                return contact;
            }
            return null;
        }
    } catch (error) {
        console.error("Error updating contact:", error);
        return null;
    }
};

export const deleteContact = async (id: number): Promise<boolean> => {
    try {
        if (supabase) {
            const { error } = await supabase.from('contacts').delete().eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_CONTACTS);
            if (!existing) return false;
            let items: Contact[] = JSON.parse(existing);
            items = items.filter(c => c.id !== id);
            localStorage.setItem(LOCAL_STORAGE_KEY_CONTACTS, JSON.stringify(items));
            return true;
        }
    } catch (error) {
        console.error("Error deleting contact:", error);
        return false;
    }
};


// --- Deals CRUD ---
export const getDeals = async (): Promise<Deal[]> => {
    try {
        if (supabase) {
            const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data as Deal[];
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_DEALS);
            return existing ? JSON.parse(existing) : [];
        }
    } catch (error) {
        console.error("Error fetching deals:", error);
        return [];
    }
};

export const saveDeal = async (deal: Omit<Deal, 'id' | 'created_at'>): Promise<Deal | null> => {
    try {
        if (supabase) {
            const { data, error } = await supabase.from('deals').insert([deal]).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const newDeal: Deal = { ...deal, id: Date.now(), created_at: new Date().toISOString() };
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_DEALS);
            const items: Deal[] = existing ? JSON.parse(existing) : [];
            items.push(newDeal);
            localStorage.setItem(LOCAL_STORAGE_KEY_DEALS, JSON.stringify(items));
            return newDeal;
        }
    } catch (error) {
        console.error("Error saving deal:", error);
        return null;
    }
};

export const updateDeal = async (deal: Deal): Promise<Deal | null> => {
    if (!deal.id) return null;
    try {
        // Exclude id and created_at from the update payload for Supabase
        const { id, created_at, ...updateData } = deal;
        if (supabase) {
            const { data, error } = await supabase.from('deals').update(updateData).eq('id', deal.id).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_DEALS);
            if (!existing) return null;
            let items: Deal[] = JSON.parse(existing);
            const index = items.findIndex(d => d.id === deal.id);
            if (index > -1) {
                items[index] = deal;
                localStorage.setItem(LOCAL_STORAGE_KEY_DEALS, JSON.stringify(items));
                return deal;
            }
            return null;
        }
    } catch (error) {
        console.error("Error updating deal:", error);
        return null;
    }
};

export const deleteDeal = async (id: number): Promise<boolean> => {
    try {
        if (supabase) {
            const { error } = await supabase.from('deals').delete().eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_DEALS);
            if (!existing) return false;
            let items: Deal[] = JSON.parse(existing);
            items = items.filter(d => d.id !== id);
            localStorage.setItem(LOCAL_STORAGE_KEY_DEALS, JSON.stringify(items));
            return true;
        }
    } catch (error) {
        console.error("Error deleting deal:", error);
        return false;
    }
};

// --- Expenses CRUD ---
export const getExpenses = async (): Promise<Expense[]> => {
    try {
        if (supabase) {
            const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
            if (error) throw error;
            return data as Expense[];
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
            return existing ? JSON.parse(existing) : [];
        }
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return [];
    }
};

export const saveExpense = async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense | null> => {
    try {
        if (supabase) {
            const { data, error } = await supabase.from('expenses').insert([expense]).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const newExpense: Expense = { ...expense, id: Date.now(), created_at: new Date().toISOString() };
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
            const items: Expense[] = existing ? JSON.parse(existing) : [];
            items.push(newExpense);
            localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(items));
            return newExpense;
        }
    } catch (error) {
        console.error("Error saving expense:", error);
        return null;
    }
};

export const deleteExpense = async (id: number): Promise<boolean> => {
    try {
        if (supabase) {
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
            if (!existing) return false;
            let items: Expense[] = JSON.parse(existing);
            items = items.filter(e => e.id !== id);
            localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(items));
            return true;
        }
    } catch (error) {
        console.error("Error deleting expense:", error);
        return false;
    }
};

// --- Invoices CRUD ---
export const getInvoices = async (): Promise<Invoice[]> => {
    try {
        if (supabase) {
            const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data as Invoice[];
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_INVOICES);
            return existing ? JSON.parse(existing) : [];
        }
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return [];
    }
};

export const saveInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice | null> => {
    try {
        if (supabase) {
            const { data, error } = await supabase.from('invoices').insert([invoice]).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const newInvoice: Invoice = { ...invoice, id: Date.now(), created_at: new Date().toISOString() };
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_INVOICES);
            const items: Invoice[] = existing ? JSON.parse(existing) : [];
            items.unshift(newInvoice);
            localStorage.setItem(LOCAL_STORAGE_KEY_INVOICES, JSON.stringify(items));
            return newInvoice;
        }
    } catch (error) {
        console.error("Error saving invoice:", error);
        return null;
    }
};

export const updateInvoice = async (invoice: Invoice): Promise<Invoice | null> => {
    if (!invoice.id) return null;
    try {
        const { id, created_at, ...updateData } = invoice;
        if (supabase) {
            const { data, error } = await supabase.from('invoices').update(updateData).eq('id', invoice.id).select();
            if (error) throw error;
            return data ? data[0] : null;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_INVOICES);
            if (!existing) return null;
            let items: Invoice[] = JSON.parse(existing);
            const index = items.findIndex(i => i.id === invoice.id);
            if (index > -1) {
                items[index] = invoice;
                localStorage.setItem(LOCAL_STORAGE_KEY_INVOICES, JSON.stringify(items));
                return invoice;
            }
            return null;
        }
    } catch (error) {
        console.error("Error updating invoice:", error);
        return null;
    }
};

export const deleteInvoice = async (id: number): Promise<boolean> => {
    try {
        if (supabase) {
            const { error } = await supabase.from('invoices').delete().eq('id', id);
            if (error) throw error;
            return true;
        } else {
            const existing = localStorage.getItem(LOCAL_STORAGE_KEY_INVOICES);
            if (!existing) return false;
            let items: Invoice[] = JSON.parse(existing);
            items = items.filter(i => i.id !== id);
            localStorage.setItem(LOCAL_STORAGE_KEY_INVOICES, JSON.stringify(items));
            return true;
        }
    } catch (error) {
        console.error("Error deleting invoice:", error);
        return false;
    }
};
