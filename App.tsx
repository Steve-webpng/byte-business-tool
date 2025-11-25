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

const App: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<AppTool>(AppTool.MISSION_CONTROL);
  const [selectedToolDef, setSelectedToolDef] = useState<ToolDefinition | null>(null);

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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentTool={currentTool} setTool={setCurrentTool} />
      <main className="flex-1 ml-64 p-6 h-screen overflow-y-auto">
        {renderTool()}
      </main>
    </div>
  );
};

export default App;