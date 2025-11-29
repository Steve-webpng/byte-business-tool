
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
import AudioStudio from './components/AudioStudio';
import BookToAudio from './components/BookToAudio';
import CalendarView from './components/CalendarView';
import ExpenseTracker from './components/ExpenseTracker';
import InvoiceBuilder from './components/InvoiceBuilder';
import BusinessAcademy from './components/BusinessAcademy';
import CommandPalette from './components/CommandPalette';
import { AppTool, ToolDefinition, Task } from './types';
import { Icons } from './constants';
import { ToastProvider, useToast } from './components/ToastContainer';
import { getTheme, Theme } from './services/settingsService';

const AppContent: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<AppTool>(AppTool.MISSION_CONTROL);
  const [selectedToolDef, setSelectedToolDef] = useState<ToolDefinition | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getTheme());
  const [workflowData, setWorkflowData] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  // Lifted state for Tasks to allow access from other components
  const [tasks, setTasks] = useState<Task[]>([]);
  const toast = useToast();

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

  // Global Keyboard Shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handleAddTask = (title: string) => {
      const newTask: Task = { 
          id: `task-${Date.now()}`, 
          title, 
          priority: 'Medium', 
          columnId: 'todo' 
      };
      setTasks(prev => [...prev, newTask]);
      toast.show("Task added to Projects!", "success");
  };

  const handleNavigate = (tool: AppTool, def?: ToolDefinition) => {
      if (tool === AppTool.UNIVERSAL_TOOL && def) {
          handleSelectTool(def);
      } else {
          setCurrentTool(tool);
      }
  };

  const renderContent = () => {
    switch (currentTool) {
      case AppTool.MISSION_CONTROL:
        return <MissionControl />;
      case AppTool.DASHBOARD:
        return <Dashboard setTool={setCurrentTool} />;
      case AppTool.ADVISOR:
        return <BusinessAdvisor onWorkflowSend={handleWorkflowSend} onAddTask={handleAddTask} />;
      case AppTool.PROJECTS:
        return <TaskManager tasks={tasks} setTasks={setTasks} />;
      case AppTool.CRM:
        return <CRM />;
      case AppTool.CALENDAR:
        return <CalendarView />;
      case AppTool.EXPENSE_TRACKER:
        return <ExpenseTracker />;
      case AppTool.INVOICES:
        return <InvoiceBuilder />;
      case AppTool.DOCUMENTS:
        return <SmartEditor workflowData={workflowData} clearWorkflowData={clearWorkflowData} />;
      case AppTool.FILE_CHAT:
        return <FileChat />;
      case AppTool.VOICE_NOTES:
        return <VoiceNotes onAddTask={handleAddTask} />;
      case AppTool.AUDIO_STUDIO:
        return <AudioStudio />;
      case AppTool.BOOK_TO_AUDIO:
        return <BookToAudio />;
      case AppTool.ACADEMY:
        return <BusinessAcademy />;
      case AppTool.FOCUS:
        return <FocusTimer />;
      case AppTool.LIBRARY:
        return <ToolLibrary onSelectTool={handleSelectTool} />;
      case AppTool.UNIVERSAL_TOOL:
        return selectedToolDef 
          ? <UniversalTool tool={selectedToolDef} onBack={() => setCurrentTool(AppTool.LIBRARY)} />
          : <ToolLibrary onSelectTool={handleSelectTool} />;
      case AppTool.CONTENT:
        return <ContentGenerator onWorkflowSend={handleWorkflowSend} workflowData={workflowData} clearWorkflowData={clearWorkflowData} />;
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
        return <Dashboard setTool={setCurrentTool} />;
    }
  };

  const handleBackToMissionControl = () => {
    setCurrentTool(AppTool.MISSION_CONTROL);
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <Sidebar 
        currentTool={currentTool} 
        setTool={setCurrentTool} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
      />
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onAddTask={handleAddTask}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative md:ml-72">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between md:hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleBackToMissionControl} 
                    className="flex items-center gap-2"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg text-white">
                        <span className="font-bold text-base">B</span>
                    </div>
                    <h1 className="text-base font-bold text-slate-800 dark:text-white">Byete</h1>
                </button>
                <button onClick={() => setIsCommandPaletteOpen(true)} className="p-2 text-slate-500"><Icons.Search /></button>
            </div>
            <button 
                onClick={() => setIsMobileOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
                <Icons.Menu />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
