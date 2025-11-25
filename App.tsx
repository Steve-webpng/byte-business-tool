
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ContentGenerator from './components/ContentGenerator';
import MarketResearch from './components/MarketResearch';
import DataAnalyzer from './components/DataAnalyzer';
import LiveSupport from './components/LiveSupport';
import MissionControl from './components/MissionControl';
import ToolLibrary from './components/ToolLibrary';
import UniversalTool from './components/UniversalTool';
import DatabaseView from './components/DatabaseView';
import SettingsView from './components/SettingsView';
import TaskManager from './components/TaskManager';
import BusinessAdvisor from './components/BusinessAdvisor';
import SmartEditor from './components/SmartEditor';
import FocusTimer from './components/FocusTimer';
import FileChat from './components/FileChat';
import CRM from './components/CRM';
import VoiceNotes from './components/VoiceNotes';
import { AppTool, ToolDefinition } from './types';
import { Icons } from './constants';
import { ToastProvider } from './components/ToastContainer';
import { getTheme, Theme } from './services/settingsService';

const AppContent: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<AppTool>(AppTool.MISSION_CONTROL);
  const [selectedToolDef, setSelectedToolDef] = useState<ToolDefinition | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getTheme());
  const [workflowData, setWorkflowData] = useState<string | null>(null);
  
  // Lifted state for Tasks to allow access from other components
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (getTheme() === 'system') {
            if (mediaQuery.matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSelectTool = (tool: ToolDefinition) => {
    setSelectedToolDef(tool);
    setCurrentTool(AppTool.UNIVERSAL_TOOL);
  };

  const handleWorkflowSend = (targetTool: AppTool, data: string) => {
    setWorkflowData(data);
    setCurrentTool(targetTool);
  };

  const clearWorkflowData = () => {
    setWorkflowData(null);
  };

  const renderContent = () => {
    switch (currentTool) {
      case AppTool.MISSION_CONTROL:
        return <MissionControl />;
      case AppTool.DASHBOARD:
        return <Dashboard setTool={setCurrentTool} />;
      case AppTool.ADVISOR:
        return <BusinessAdvisor onWorkflowSend={handleWorkflowSend} onAddTask={(title) => setTasks(prev => [...prev, { id: Date.now().toString(), title, priority: 'Medium', columnId: 'todo' }])} />;
      case AppTool.PROJECTS:
        return <TaskManager tasks={tasks} setTasks={setTasks} />;
      case AppTool.CRM:
        return <CRM />;
      case AppTool.DOCUMENTS:
        return <SmartEditor workflowData={workflowData} clearWorkflowData={clearWorkflowData} />;
      case AppTool.FILE_CHAT:
        return <FileChat />;
      case AppTool.VOICE_NOTES:
        return <VoiceNotes onAddTask={(title) => setTasks(prev => [...prev, { id: Date.now().toString(), title, priority: 'Medium', columnId: 'todo' }])} />;
      case AppTool.FOCUS:
        return <FocusTimer />;
      case AppTool.LIBRARY:
        return <ToolLibrary onSelectTool={handleSelectTool} />;
      case AppTool.UNIVERSAL_TOOL:
        return selectedToolDef 
          ? <UniversalTool tool={selectedToolDef} onBack={() => setCurrentTool(AppTool.LIBRARY)} />
          : <ToolLibrary onSelectTool={handleSelectTool} />;
      case AppTool.CONTENT:
        return <ContentGenerator workflowData={workflowData} clearWorkflowData={clearWorkflowData} onWorkflowSend={handleWorkflowSend} />;
      case AppTool.RESEARCH:
        return <MarketResearch onWorkflowSend={handleWorkflowSend} />;
      case AppTool.ANALYSIS:
        return <DataAnalyzer />;
      case AppTool.COACH:
        return <LiveSupport />;
      case AppTool.DATABASE:
        return <DatabaseView />;
      case AppTool.SETTINGS:
        return <SettingsView onThemeChange={setTheme} />;
      default:
        return <MissionControl />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 relative">
      <Sidebar 
        currentTool={currentTool} 
        setTool={setCurrentTool} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-40 flex items-center px-4 justify-between shadow-sm">
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-600 dark:text-slate-300 focus:outline-none">
          <Icons.Menu />
        </button>
        <span className="font-bold text-slate-800 dark:text-slate-200">Byete Business</span>
        <div className="w-8"></div>
      </div>

      <main className="flex-1 w-full md:ml-72 p-4 md:p-6 h-screen overflow-y-auto pt-20 md:pt-6">
        {renderContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
