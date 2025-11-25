import React, { useState } from 'react';
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
import { AppTool, ToolDefinition } from './types';
import { Icons } from './constants';

const App: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<AppTool>(AppTool.MISSION_CONTROL);
  const [selectedToolDef, setSelectedToolDef] = useState<ToolDefinition | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSelectTool = (tool: ToolDefinition) => {
    setSelectedToolDef(tool);
    setCurrentTool(AppTool.UNIVERSAL_TOOL);
  };

  const renderTool = () => {
    switch (currentTool) {
      case AppTool.MISSION_CONTROL:
        return <MissionControl />;
      case AppTool.ADVISOR:
        return <BusinessAdvisor />;
      case AppTool.PROJECTS:
        return <TaskManager />;
      case AppTool.DOCUMENTS:
        return <SmartEditor />;
      case AppTool.LIBRARY:
        return (
          <ToolLibrary 
            onSelectTool={handleSelectTool} 
          />
        );
      case AppTool.UNIVERSAL_TOOL:
        return selectedToolDef 
          ? <UniversalTool tool={selectedToolDef} onBack={() => setCurrentTool(AppTool.LIBRARY)} />
          : <ToolLibrary onSelectTool={handleSelectTool} />;
      case AppTool.DASHBOARD:
        return <Dashboard setTool={setCurrentTool} />;
      case AppTool.CONTENT:
        return <ContentGenerator />;
      case AppTool.RESEARCH:
        return <MarketResearch />;
      case AppTool.ANALYSIS:
        return <DataAnalyzer />;
      case AppTool.COACH:
        return <LiveSupport />;
      case AppTool.DATABASE:
        return <DatabaseView />;
      case AppTool.SETTINGS:
        return <SettingsView />;
      default:
        return <MissionControl />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <Sidebar 
        currentTool={currentTool} 
        setTool={setCurrentTool} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-10 flex items-center px-4 justify-between shadow-sm">
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-600">
          <Icons.Menu />
        </button>
        <span className="font-bold text-slate-800">Byete Business</span>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      <main className="flex-1 w-full md:ml-64 p-4 md:p-6 h-screen overflow-y-auto pt-20 md:pt-6">
        {renderTool()}
      </main>
    </div>
  );
};

export default App;