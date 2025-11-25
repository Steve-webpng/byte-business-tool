
import React, { useEffect, useState } from 'react';
import { AppTool } from '../types';
import { Icons } from '../constants';
import { getApiKey, getModelPreference } from '../services/settingsService';

interface SidebarProps {
  currentTool: AppTool;
  setTool: (tool: AppTool) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTool, setTool, isMobileOpen, setIsMobileOpen }) => {
  const [hasKey, setHasKey] = useState(false);
  const [modelName, setModelName] = useState('Gemini');

  useEffect(() => {
    const userKey = getApiKey();
    const envKey = process.env.API_KEY;
    setHasKey(!!userKey || !!envKey);
    
    const model = getModelPreference();
    if (model.includes('flash')) setModelName('Gemini Flash');
    else if (model.includes('pro')) setModelName('Gemini Pro');
    else setModelName('Gemini AI');
  }, [currentTool]);

  const navItems = [
    { id: AppTool.MISSION_CONTROL, label: 'Mission Control', icon: Icons.Grid },
    { id: AppTool.ADVISOR, label: 'Chief of Staff', icon: Icons.ChatBubble },
    { id: AppTool.PROJECTS, label: 'Projects', icon: Icons.Board },
    { id: AppTool.DOCUMENTS, label: 'Smart Docs', icon: Icons.DocumentText },
    { id: AppTool.FOCUS, label: 'Focus Timer', icon: Icons.Clock },
    { id: AppTool.LIBRARY, label: 'App Library', icon: Icons.Apps },
    { id: AppTool.DASHBOARD, label: 'Dashboard', icon: Icons.Dashboard },
    { id: AppTool.CONTENT, label: 'Content Studio', icon: Icons.Pen },
    { id: AppTool.RESEARCH, label: 'Market Research', icon: Icons.Search },
    { id: AppTool.ANALYSIS, label: 'Data Analysis', icon: Icons.Chart },
    { id: AppTool.COACH, label: 'Sales Coach (Live)', icon: Icons.Mic },
  ];

  const handleNavClick = (toolId: AppTool) => {
    setTool(toolId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white shadow-xl z-30 flex flex-col transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-lg">B</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Byete</h1>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <Icons.Grid />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTool === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <item.icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
              onClick={() => handleNavClick(AppTool.DATABASE)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                  ${currentTool === AppTool.DATABASE
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
          >
              <Icons.Database />
              Database
          </button>

          <button
              onClick={() => handleNavClick(AppTool.SETTINGS)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                  ${currentTool === AppTool.SETTINGS
                    ? 'bg-slate-700 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
          >
              <Icons.Cog />
              Settings
          </button>

          <div className={`rounded-lg p-4 mt-2 transition-colors ${hasKey ? 'bg-slate-800' : 'bg-red-900/20 border border-red-800'}`}>
              <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${hasKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className={`text-[10px] font-bold uppercase ${hasKey ? 'text-slate-400' : 'text-red-400'}`}>
                      System Status
                  </span>
              </div>
              <div className={`text-xs ${hasKey ? 'text-slate-300' : 'text-red-300 font-bold'}`}>
                  {hasKey ? `${modelName} Active` : 'API Key Missing'}
              </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;