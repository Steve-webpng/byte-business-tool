
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppTool, ToolDefinition } from '../types';

interface NavigationContextType {
  currentTool: AppTool;
  selectedToolDef: ToolDefinition | null;
  isMobileOpen: boolean;
  isCommandPaletteOpen: boolean;
  navigate: (tool: AppTool, def?: ToolDefinition) => void;
  setMobileOpen: (isOpen: boolean) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTool, setCurrentToolState] = useState<AppTool>(AppTool.MISSION_CONTROL);
  const [selectedToolDef, setSelectedToolDef] = useState<ToolDefinition | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const navigate = (tool: AppTool, def?: ToolDefinition) => {
    if (def) setSelectedToolDef(def);
    setCurrentToolState(tool);
    setIsMobileOpen(false);
    setIsCommandPaletteOpen(false);
  };

  const setMobileOpen = (isOpen: boolean) => setIsMobileOpen(isOpen);
  const setCommandPaletteOpen = (isOpen: boolean) => setIsCommandPaletteOpen(isOpen);

  return (
    <NavigationContext.Provider value={{
      currentTool,
      selectedToolDef,
      isMobileOpen,
      isCommandPaletteOpen,
      navigate,
      setMobileOpen,
      setCommandPaletteOpen
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
