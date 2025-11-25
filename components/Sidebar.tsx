import React from 'react';
import { AppTool } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  currentTool: AppTool;
  setTool: (tool: AppTool) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTool, setTool }) => {
  const navItems = [
    { id: AppTool.MISSION_CONTROL, label: 'Mission Control', icon: Icons.Grid },
    { id: AppTool.ADVISOR, label: 'Chief of Staff', icon: Icons.ChatBubble },
    { id: AppTool.PROJECTS, label: 'Projects', icon: Icons.Board },
    { id: AppTool.DOCUMENTS, label: 'Smart Docs', icon: Icons.DocumentText },
    { id: AppTool.LIBRARY, label: 'App Library', icon: Icons.Apps },
    { id: AppTool.DASHBOARD, label: 'Dashboard', icon: Icons.Dashboard },
    { id: AppTool.CONTENT, label: 'Content Studio', icon: Icons.Pen },
    { id: AppTool.RESEARCH, label: 'Market Research', icon: Icons.Search },
    { id: AppTool.ANALYSIS, label: 'Data Analysis', icon: Icons.Chart },
    { id: AppTool.COACH, label: 'Sales Coach (Live)', icon: Icons.Mic },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-20">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg">B</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Byete Business</h1>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTool(item.id)}
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
        {/* Database Link */}
        <button
            onClick={() => setTool(AppTool.DATABASE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                ${currentTool === AppTool.DATABASE
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icons.Database />
            Database
        </button>

        {/* Settings Link */}
        <button
            onClick={() => setTool(AppTool.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                ${currentTool === AppTool.SETTINGS
                  ? 'bg-slate-700 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icons.Cog />
            Settings
        </button>

        <div className="bg-slate-800 rounded-lg p-4 mt-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">System Status</h3>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-slate-300">Gemini 2.5 Active</span>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;