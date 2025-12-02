
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '../constants';
import { AppTool, Contact, SavedItem } from '../types';
import { TOOLS } from '../services/toolRegistry';
import { useNavigation } from '../contexts/NavigationContext';
import { getContacts, getSavedItems } from '../services/supabaseService';

interface CommandPaletteProps {
  onAddTask: (title: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onAddTask }) => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, navigate } = useNavigation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [docs, setDocs] = useState<SavedItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load data when opened
  useEffect(() => {
      if (isCommandPaletteOpen) {
          Promise.all([getContacts(), getSavedItems()]).then(([c, d]) => {
              setContacts(c);
              setDocs(d);
          });
          setQuery('');
          setSelectedIndex(0);
          setTimeout(() => inputRef.current?.focus(), 50);
      }
  }, [isCommandPaletteOpen]);

  // Group navigation items matching Sidebar logic
  const navItems = useMemo(() => [
    // HQ
    { id: 'nav-mission', label: 'Mission Control', icon: Icons.Grid, group: 'Headquarters', action: () => navigate(AppTool.MISSION_CONTROL) },
    { id: 'nav-dash', label: 'Dashboard', icon: Icons.Dashboard, group: 'Headquarters', action: () => navigate(AppTool.DASHBOARD) },
    { id: 'nav-calendar', label: 'Calendar', icon: Icons.CalendarDays, group: 'Headquarters', action: () => navigate(AppTool.CALENDAR) },
    
    // Revenue
    { id: 'nav-strat', label: 'Strategy Hub', icon: Icons.Telescope, group: 'Revenue Engine', action: () => navigate(AppTool.STRATEGY_HUB) },
    { id: 'nav-crm', label: 'CRM & Contacts', icon: Icons.Identification, group: 'Revenue Engine', action: () => navigate(AppTool.CRM) },
    { id: 'nav-prospect', label: 'Lead Prospector', icon: Icons.UserPlus, group: 'Revenue Engine', action: () => navigate(AppTool.PROSPECTOR) },
    { id: 'nav-email', label: 'Email Marketing', icon: Icons.Mail, group: 'Revenue Engine', action: () => navigate(AppTool.EMAIL_MARKETING) },
    { id: 'nav-coach', label: 'Sales Coach', icon: Icons.Mic, group: 'Revenue Engine', action: () => navigate(AppTool.COACH) },

    // Ops
    { id: 'nav-projects', label: 'Projects', icon: Icons.Board, group: 'Operations', action: () => navigate(AppTool.PROJECTS) },
    { id: 'nav-team', label: 'Team Hub', icon: Icons.Users, group: 'Operations', action: () => navigate(AppTool.TEAM) },
    { id: 'nav-fin', label: 'Financials', icon: Icons.Chart, group: 'Operations', action: () => navigate(AppTool.FINANCIALS) },
    { id: 'nav-inv', label: 'Invoices', icon: Icons.DocumentCurrency, group: 'Operations', action: () => navigate(AppTool.INVOICES) },
    { id: 'nav-auto', label: 'Automations', icon: Icons.Flow, group: 'Operations', action: () => navigate(AppTool.AUTOMATOR) },

    // Creative
    { id: 'nav-content', label: 'Content Studio', icon: Icons.Pen, group: 'Creative Studio', action: () => navigate(AppTool.CONTENT) },
    { id: 'nav-video', label: 'Video Studio', icon: Icons.Film, group: 'Creative Studio', action: () => navigate(AppTool.VIDEO_STUDIO) },
    { id: 'nav-audio', label: 'Audio Studio', icon: Icons.SpeakerWave, group: 'Creative Studio', action: () => navigate(AppTool.AUDIO_STUDIO) },
    { id: 'nav-docs', label: 'Smart Docs', icon: Icons.DocumentText, group: 'Creative Studio', action: () => navigate(AppTool.DOCUMENTS) },

    // Brain Trust
    { id: 'nav-research', label: 'Market Research', icon: Icons.Search, group: 'Brain Trust', action: () => navigate(AppTool.RESEARCH) },
    { id: 'nav-trend', label: 'Trend Analyzer', icon: Icons.TrendingUp, group: 'Brain Trust', action: () => navigate(AppTool.TRENDS) },
    { id: 'nav-files', label: 'File Chat', icon: Icons.Upload, group: 'Brain Trust', action: () => navigate(AppTool.FILE_CHAT) },
    { id: 'nav-library', label: 'App Library', icon: Icons.Apps, group: 'Brain Trust', action: () => navigate(AppTool.LIBRARY) },
  ], [navigate]);

  // Filter logic
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    
    // 1. Task Creation Mode
    if (q.startsWith('task:')) {
        return [{
            id: 'action-create-task',
            label: `Create Task: "${q.substring(5).trim()}"`,
            icon: Icons.Plus,
            action: () => {
                onAddTask(q.substring(5).trim());
                setCommandPaletteOpen(false);
            },
            group: 'Actions'
        }];
    }

    if (!q) return navItems.slice(0, 5); // Show top 5 nav items by default

    // 2. Filter Navigation
    const navMatches = navItems.filter(item => 
        item.label.toLowerCase().includes(q)
    );

    // 3. Filter Tool Registry
    const toolMatches = TOOLS.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    ).slice(0, 3).map(t => ({
        id: `tool-${t.id}`,
        label: t.name,
        icon: Icons[t.icon] || Icons.Grid,
        action: () => navigate(AppTool.UNIVERSAL_TOOL, t),
        group: 'Micro Tools'
    }));

    // 4. Filter Contacts
    const contactMatches = contacts.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.company.toLowerCase().includes(q)
    ).slice(0, 3).map(c => ({
        id: `contact-${c.id}`,
        label: `${c.name} (${c.company})`,
        icon: Icons.User,
        action: () => {
            // In a real app this would open the specific contact. 
            // For now, go to CRM. We could implement a "search param" context.
            navigate(AppTool.CRM);
        },
        group: 'Contacts'
    }));

    // 5. Filter Docs
    const docMatches = docs.filter(d => 
        d.title.toLowerCase().includes(q)
    ).slice(0, 3).map(d => ({
        id: `doc-${d.id}`,
        label: d.title,
        icon: Icons.DocumentText,
        action: () => {
            navigate(AppTool.DATABASE);
        },
        group: 'Documents'
    }));

    return [...navMatches, ...toolMatches, ...contactMatches, ...docMatches];
  }, [query, navItems, navigate, onAddTask, setCommandPaletteOpen, contacts, docs]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isCommandPaletteOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                filteredItems[selectedIndex].action();
                setCommandPaletteOpen(false);
            }
        } else if (e.key === 'Escape') {
            setCommandPaletteOpen(false);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filteredItems, selectedIndex, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[60vh] animate-fade-in ring-1 ring-black/5">
        
        {/* Input */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3 gap-3">
            <div className="text-slate-400">
                <Icons.Search />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools, contacts, docs..."
                className="flex-1 bg-transparent outline-none text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
            <div className="hidden md:flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-400 font-mono">ESC</span>
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No results found. Try "Task: Buy milk" to create a task.
                </div>
            ) : (
                filteredItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                        <button
                            key={item.id}
                            onClick={() => { item.action(); setCommandPaletteOpen(false); }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors
                                ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}
                            `}
                        >
                            <div className={`p-2 rounded-md flex-shrink-0 ${isSelected ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                <item.icon />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{item.label}</div>
                                {item.group && <div className="text-[10px] opacity-60 uppercase tracking-wider font-bold">{item.group}</div>}
                            </div>
                            {isSelected && <Icons.ArrowRight />}
                        </button>
                    );
                })
            )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
            <div className="flex gap-3">
                <span><strong className="text-slate-500 dark:text-slate-400">↑↓</strong> navigate</span>
                <span><strong className="text-slate-500 dark:text-slate-400">↵</strong> select</span>
            </div>
            <div>
                Type <strong className="text-slate-500 dark:text-slate-400">Task:</strong> to add items
            </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
