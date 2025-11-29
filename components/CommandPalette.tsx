
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '../constants';
import { AppTool, ToolDefinition } from '../types';
import { TOOLS } from '../services/toolRegistry';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tool: AppTool, def?: ToolDefinition) => void;
  onAddTask: (title: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, onAddTask }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Group navigation items
  const navItems = useMemo(() => [
    { id: 'nav-mission', label: 'Mission Control', icon: Icons.Grid, action: () => onNavigate(AppTool.MISSION_CONTROL) },
    { id: 'nav-dash', label: 'Dashboard', icon: Icons.Dashboard, action: () => onNavigate(AppTool.DASHBOARD) },
    { id: 'nav-crm', label: 'CRM & Contacts', icon: Icons.Identification, action: () => onNavigate(AppTool.CRM) },
    { id: 'nav-projects', label: 'Projects', icon: Icons.Board, action: () => onNavigate(AppTool.PROJECTS) },
    { id: 'nav-calendar', label: 'Calendar', icon: Icons.CalendarDays, action: () => onNavigate(AppTool.CALENDAR) },
    { id: 'nav-content', label: 'Content Studio', icon: Icons.Pen, action: () => onNavigate(AppTool.CONTENT) },
    { id: 'nav-audio', label: 'Audio Studio', icon: Icons.SpeakerWave, action: () => onNavigate(AppTool.AUDIO_STUDIO) },
    { id: 'nav-book', label: 'Book to Audio', icon: Icons.Headphones, action: () => onNavigate(AppTool.BOOK_TO_AUDIO) },
    { id: 'nav-video', label: 'Video Studio', icon: Icons.Film, action: () => onNavigate(AppTool.VIDEO_STUDIO) },
    { id: 'nav-research', label: 'Market Research', icon: Icons.Search, action: () => onNavigate(AppTool.RESEARCH) },
    { id: 'nav-coach', label: 'Sales Coach', icon: Icons.Mic, action: () => onNavigate(AppTool.COACH) },
    { id: 'nav-files', label: 'File Chat', icon: Icons.Upload, action: () => onNavigate(AppTool.FILE_CHAT) },
    { id: 'nav-expenses', label: 'Expense Tracker', icon: Icons.Receipt, action: () => onNavigate(AppTool.EXPENSE_TRACKER) },
    { id: 'nav-advisor', label: 'Chief of Staff', icon: Icons.ChatBubble, action: () => onNavigate(AppTool.ADVISOR) },
    { id: 'nav-library', label: 'App Library', icon: Icons.Apps, action: () => onNavigate(AppTool.LIBRARY) },
  ], [onNavigate]);

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
                onClose();
            },
            group: 'Actions'
        }];
    }

    if (!q) return navItems.map(i => ({ ...i, group: 'Navigation' }));

    // 2. Filter Navigation
    const navMatches = navItems.filter(item => 
        item.label.toLowerCase().includes(q)
    ).map(i => ({ ...i, group: 'Navigation' }));

    // 3. Filter Tool Registry
    const toolMatches = TOOLS.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    ).slice(0, 5).map(t => ({
        id: `tool-${t.id}`,
        label: t.name,
        icon: Icons[t.icon] || Icons.Grid,
        action: () => onNavigate(AppTool.UNIVERSAL_TOOL, t),
        group: 'Tools'
    }));

    return [...navMatches, ...toolMatches];
  }, [query, navItems, onNavigate, onAddTask, onClose]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;

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
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Focus input on open
  useEffect(() => {
      if (isOpen && inputRef.current) {
          // Small timeout to ensure render
          setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (!isOpen) {
          setQuery('');
      }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
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
                placeholder="Type a command or search..."
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
                            onClick={() => { item.action(); onClose(); }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors
                                ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}
                            `}
                        >
                            <div className={`p-2 rounded-md ${isSelected ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                <item.icon />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-sm">{item.label}</div>
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
