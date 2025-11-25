import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SavedItem } from '../types';

let supabase: SupabaseClient | null = null;
let currentConfig: { url: string; key: string } | null = null;
const LOCAL_STORAGE_KEY = 'byete_saved_items';

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

// Test connection by fetching a single item or checking health
export const testConnection = async (): Promise<boolean> => {
  if (!supabase) return true; // Local mode is always "connected" in a way, but this function is for Cloud.
  try {
    // Try to fetch from the specific table.
    const { error } = await supabase.from('saved_outputs').select('id').limit(1);
    
    // Error code 42P01 is undefined_table
    if (error) {
        if (error.code === '42P01') {
            return false; // Connection OK, Table Missing
        }
        // If auth error, throw it so UI knows credential failed
        throw error;
    }
    return true; // Connection OK, Table Exists
  } catch (error: any) {
    if (error.message && (error.message.includes('42P01') || error.message.includes('relation "saved_outputs" does not exist'))) {
        return false;
    }
    throw error;
  }
};

// Save an item to the database (Local or Cloud)
export const saveItem = async (toolType: string, title: string, content: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (supabase) {
      const { error } = await supabase.from('saved_outputs').insert([
        {
          tool_type: toolType,
          title: title,
          content: content,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;
      return { success: true };
    } else {
      // Local Storage Fallback
      const newItem: SavedItem = {
        id: Date.now(), // Generate a simple timestamp ID
        tool_type: toolType,
        title: title,
        content: content,
        created_at: new Date().toISOString()
      };
      
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      const items: SavedItem[] = existing ? JSON.parse(existing) : [];
      items.unshift(newItem); // Add to top
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      return { success: true };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save" };
  }
};

// Fetch saved items (Local or Cloud)
export const getSavedItems = async (): Promise<SavedItem[]> => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('saved_outputs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedItem[];
    } else {
      // Local Storage Fetch
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      return existing ? JSON.parse(existing) : [];
    }
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};

// Delete an item
export const deleteItem = async (id: number): Promise<boolean> => {
  try {
    if (supabase) {
      const { error } = await supabase.from('saved_outputs').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      // Local Storage Delete
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!existing) return false;
      
      let items: SavedItem[] = JSON.parse(existing);
      items = items.filter(item => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      return true;
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    return false;
  }
};