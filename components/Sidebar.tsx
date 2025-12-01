

import React, { useEffect, useState } from 'react';
import { AppTool } from '../types';
import { Icons } from '../constants';
import { getApiKey, getModelPreference, getWorkspaces, getActiveWorkspaceId, setActiveWorkspaceId, createWorkspace } from '../services/settingsService';

interface SidebarProps {
  currentTool: AppTool;
  setTool: (tool: AppTool) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenSearch: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTool, setTool, isMobileOpen, setIsMobileOpen, onOpenSearch }) => {
  const [hasKey, setHasKey] = useState(false);
  const [modelName, setModelName] = useState('Gemini');
  const [workspaces, setWorkspaces] = useState(getWorkspaces());
  const [activeWorkspaceId, setWorkspaceId] = useState(getActiveWorkspaceId());
  const [showWsMenu, setShowWsMenu] = useState(false);

  useEffect(() => {
    const userKey = getApiKey();
    const envKey = process.env.API_KEY;
    setHasKey(!!userKey || !!envKey);
    
    const model = getModelPreference();
    if (model.includes('flash')) setModelName('Gemini Flash');
    else if (model.includes('pro')) setModelName('Gemini Pro');
    else setModelName('Gemini AI');
  }, [currentTool]);

  const handleWorkspaceChange = (id: string) => {
      setActiveWorkspaceId(id);
      setWorkspaceId(id);
      setShowWsMenu(false);
  };

  const handleCreateWorkspace = () => {
      const name = prompt("Enter new workspace name:");
      if(name) {
          const newWs = createWorkspace(name);
          setWorkspaces(getWorkspaces());
          handleWorkspaceChange(newWs.id);
      }
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { id: AppTool.MISSION_CONTROL, label: 'Mission Control', icon: Icons.Grid },
        { id: AppTool.DASHBOARD, label: 'Dashboard', icon: Icons.Dashboard },
      ]
    },
    {
      title: 'Management',
      items: [
        { id: AppTool.CALENDAR, label: 'Calendar', icon: Icons.CalendarDays },
        { id: AppTool.PROJECTS, label: 'Projects', icon: Icons.Board },
        { id: AppTool.CRM, label: 'Contacts (CRM)', icon: Icons.Identification },
        { id: AppTool.INVOICES, label: 'Invoices', icon: Icons.DocumentCurrency },
        { id: AppTool.EXPENSE_TRACKER, label: 'Expense Tracker', icon: Icons.Receipt },
        { id: AppTool.HIRING, label: 'Hiring ATS', icon: Icons.UserPlus },
        { id: AppTool.FINANCIALS, label: 'Financials', icon: Icons.Money },
        { id: AppTool.AUTOMATOR, label: 'Automations', icon: Icons.Flow },
        { id: AppTool.ADVISOR, label: 'Chief of Staff', icon: Icons.ChatBubble },
      ]
    },
    {
      title: 'Creation',
      items: [
        { id: AppTool.DOCUMENTS, label: 'Smart Docs', icon: Icons.DocumentText },
        { id: AppTool.CONTENT, label: 'Content Studio', icon: Icons.Pen },
        { id: AppTool.VIDEO_STUDIO, label: 'Video Studio', icon: Icons.Film },
        { id: AppTool.VOICE_NOTES, label: 'Voice Notes', icon: Icons.ClipboardText },
        { id: AppTool.AUDIO_STUDIO, label: 'Audio Studio', icon: Icons.SpeakerWave },
        { id: AppTool.BOOK_TO_AUDIO, label: 'Book to Audio', icon: Icons.Headphones },
      ]
    },
    {
      title: 'Analysis & Tools',
      items: [
        { id: AppTool.RESEARCH, label: 'Market Research', icon: Icons.Search },
        { id: AppTool.ANALYSIS, label: 'Data Analysis', icon: Icons.Chart },
        { id: AppTool.PROSPECTOR, label: 'Lead Prospector', icon: Icons.Telescope },
        { id: AppTool.ACADEMY, label: 'Business Academy', icon: Icons.AcademicCap },
        { id: AppTool.FILE_CHAT, label: 'File Chat', icon: Icons.Upload },
        { id: AppTool.COACH, label: 'Sales Coach', icon: Icons.Mic },
        { id: AppTool.FOCUS, label: 'Focus Timer', icon: Icons.Clock },
        { id: AppTool.LIBRARY, label: 'App Library', icon: Icons.Apps },
      ]
    }
  ];

  const activeWsName = workspaces.find(w => w.id === activeWorkspaceId)?.name || 'Workspace';

  const handleNavClick = (toolId: AppTool) => {
    setTool(toolId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 h-screen w-72 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Workspace Switcher */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 shrink-0 relative">
            <button 
                onClick={() => setShowWsMenu(!showWsMenu)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg text-white text-sm font-bold">
                        {activeWsName.charAt(0)}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-1">{activeWsName}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Free Plan</span>
                    </div>
                </div>
                <div className="text-slate-400 group-hover:text-slate-600">
                    <Icons.SwitchHorizontal />
                </div>
            </button>

            {/* Dropdown */}
            {showWsMenu && (
                <div className="absolute top-full left-4 right-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden py-1">
                    {workspaces.map(ws => (
                        <button
                            key={ws.id}
                            onClick={() => handleWorkspaceChange(ws.id)}
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex justify-between items-center"
                        >
                            {ws.name}
                            {ws.id === activeWorkspaceId && <span className="text-blue-500 text-xs font-bold">ACTIVE</span>}
                        </button>
                    ))}
                    <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                        <button 
                            onClick={handleCreateWorkspace}
                            className="w-full text-left px-4 py-3 text-sm text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                        >
                            <Icons.Plus /> Create Workspace
                        </button>
                    </div>
                </div>
            )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                        ${isActive 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                      )}
                      <span className={`transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                        <item.icon />
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button
              onClick={() => handleNavClick(AppTool.DATABASE)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                  ${currentTool === AppTool.DATABASE
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
          >
              <span className={currentTool === AppTool.DATABASE ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}>
                <Icons.Database />
              </span>
              Data Management
          </button>

          <button
              onClick={() => handleNavClick(AppTool.SETTINGS)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-500
                  ${currentTool === AppTool.SETTINGS
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
          >
              <span className={currentTool === AppTool.SETTINGS ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                <Icons.Cog />
              </span>
              Settings
          </button>

          {/* Status Indicator */}
          <div className="mt-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shadow-sm transition-colors ${hasKey ? 'bg-emerald-500 shadow-emerald-200 dark:shadow-emerald-900' : 'bg-red-500 animate-pulse'}`}></div>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                      {hasKey ? modelName : 'API Key Required'}
                  </span>
              </div>
              {hasKey && <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 tracking-wide">ONLINE</span>}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;