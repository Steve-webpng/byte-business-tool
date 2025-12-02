


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
import VideoCreator from './components/VideoCreator';
import CalendarView from './components/CalendarView';
import ExpenseTracker from './components/ExpenseTracker';
import InvoiceBuilder from './components/InvoiceBuilder';
import BusinessAcademy from './components/BusinessAcademy';
import CommandPalette from './components/CommandPalette';
import Automator from './components/Automator';
import Prospector from './components/Prospector';
import HiringManager from './components/HiringManager';
import Financials from './components/Financials';
import EmailMarketing from './components/EmailMarketing';
import StrategyHub from './components/StrategyHub';
import SocialMediaManager from './components/SocialMediaManager';
import TrendAnalyzer from './components/TrendAnalyzer';
import TeamHub from './components/TeamHub';
import AnalyticsDash from './components/AnalyticsDash';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AppTool, ToolDefinition, Task } from './types';
import { Icons } from './constants';
import { ToastProvider, useToast } from './components/ToastContainer';
import { getTheme, Theme, getActiveWorkspaceId, hasValidKey } from './services/settingsService';
import { getTasks, saveTask } from './services/supabaseService';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';

const AppContent: React.FC = () => {
  const { currentTool, selectedToolDef, setMobileOpen, setCommandPaletteOpen, navigate } = useNavigation();
  const [theme, setTheme] = useState<Theme>(getTheme());
  const [workflowData, setWorkflowData] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState(getActiveWorkspaceId());
  const [showKeyModal, setShowKeyModal] = useState(false);
  
  // Tasks managed centrally but fetched from service
  const [tasks, setTasks] = useState<Task[]>([]);
  const toast = useToast();

  useEffect(() => {
      // Check for API Key
      if (!hasValidKey()) {
          setShowKeyModal(true);
      }
  }, []);

  const refreshTasks = async () => {
      const t = await getTasks();
      setTasks(t);
  };

  useEffect(() => {
      refreshTasks();
      
      const handleWorkspaceChange = () => {
          setWorkspaceId(getActiveWorkspaceId());
          refreshTasks();
          toast.show("Workspace changed", "info");
      };
      
      window.addEventListener('workspaceChanged', handleWorkspaceChange);
      return () => window.removeEventListener('workspaceChanged', handleWorkspaceChange);
  }, []);

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
            setCommandPaletteOpen(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  const handleSelectTool = (tool: ToolDefinition) => {
    navigate(AppTool.UNIVERSAL_TOOL, tool);
  };

  const handleWorkflowSend = (targetTool: AppTool, data: string) => {
    setWorkflowData(data);
    navigate(targetTool);
  };

  const clearWorkflowData = () => {
    setWorkflowData(null);
  };

  const handleAddTask = async (title: string) => {
      const newTask: Task = { 
          id: `task-${Date.now()}`, 
          title, 
          priority: 'Medium', 
          columnId: 'todo',
          workspace_id: workspaceId
      };
      await saveTask(newTask);
      await refreshTasks();
      toast.show("Task added to Projects!", "success");
  };

  const handleBackToMissionControl = () => {
    navigate(AppTool.MISSION_CONTROL);
  }

  // Force re-render of tools when workspace changes by using key
  const renderContent = () => {
    const key = workspaceId;
    switch (currentTool) {
      case AppTool.MISSION_CONTROL:
        return <MissionControl key={key} />;
      case AppTool.DASHBOARD:
        return <Dashboard key={key} setTool={navigate} />;
      case AppTool.ADVISOR:
        return <BusinessAdvisor key={key} onWorkflowSend={handleWorkflowSend} onAddTask={handleAddTask} />;
      case AppTool.PROJECTS:
        return <TaskManager key={key} tasks={tasks} setTasks={setTasks} refreshTasks={refreshTasks} />;
      case AppTool.CRM:
        return <CRM key={key} />;
      case AppTool.CALENDAR:
        return <CalendarView key={key} />;
      case AppTool.EXPENSE_TRACKER:
        return <ExpenseTracker key={key} />;
      case AppTool.INVOICES:
        return <InvoiceBuilder key={key} />;
      case AppTool.HIRING:
        return <HiringManager key={key} />;
      case AppTool.FINANCIALS:
        return <Financials key={key} />;
      case AppTool.DOCUMENTS:
        return <SmartEditor key={key} workflowData={workflowData} clearWorkflowData={clearWorkflowData} />;
      case AppTool.FILE_CHAT:
        return <FileChat key={key} />;
      case AppTool.VOICE_NOTES:
        return <VoiceNotes key={key} onAddTask={handleAddTask} />;
      case AppTool.AUDIO_STUDIO:
        return <AudioStudio key={key} />;
      case AppTool.BOOK_TO_AUDIO:
        return <BookToAudio key={key} />;
      case AppTool.VIDEO_STUDIO:
        return <VideoCreator key={key} />;
      case AppTool.ACADEMY:
        return <BusinessAcademy key={key} />;
      case AppTool.FOCUS:
        return <FocusTimer />;
      case AppTool.AUTOMATOR:
        return <Automator key={key} />;
      case AppTool.PROSPECTOR:
        return <Prospector key={key} />;
      case AppTool.EMAIL_MARKETING:
        return <EmailMarketing key={key} />;
      case AppTool.STRATEGY_HUB:
        return <StrategyHub key={key} />;
      case AppTool.SOCIAL_MEDIA:
        return <SocialMediaManager key={key} />;
      case AppTool.TRENDS:
        return <TrendAnalyzer key={key} />;
      case AppTool.TEAM:
        return <TeamHub key={key} />;
      case AppTool.ANALYTICS_DASH:
        return <AnalyticsDash key={key} />;
      case AppTool.LIBRARY:
        return <ToolLibrary onSelectTool={handleSelectTool} />;
      case AppTool.UNIVERSAL_TOOL:
        return selectedToolDef 
          ? <UniversalTool key={key} tool={selectedToolDef} onBack={() => navigate(AppTool.LIBRARY)} />
          : <ToolLibrary onSelectTool={handleSelectTool} />;
      case AppTool.CONTENT:
        return <ContentGenerator key={key} onWorkflowSend={handleWorkflowSend} workflowData={workflowData} clearWorkflowData={clearWorkflowData} />;
      case AppTool.RESEARCH:
        return <MarketResearch key={key} onWorkflowSend={handleWorkflowSend} />;
      case AppTool.ANALYSIS:
        return <DataAnalyzer key={key} />;
      case AppTool.COACH:
        return <LiveSupport key={key} />;
      case AppTool.DATABASE:
        return <DatabaseView key={key} />;
      case AppTool.SETTINGS:
        return <SettingsView onThemeChange={setTheme} />;
      default:
        return <Dashboard key={key} setTool={navigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <Sidebar />
      <CommandPalette onAddTask={handleAddTask} />
      {showKeyModal && <ApiKeyModal onConnected={() => setShowKeyModal(false)} />}

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
                <button onClick={() => setCommandPaletteOpen(true)} className="p-2 text-slate-500"><Icons.Search /></button>
            </div>
            <button 
                onClick={() => setMobileOpen(true)}
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
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </ToastProvider>
  );
};

export default App;
