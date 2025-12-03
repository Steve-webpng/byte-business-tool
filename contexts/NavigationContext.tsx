
import React, { createContext, useContext, useState, ReactNode, useTransition } from 'react';
import { AppTool, ToolDefinition } from '../types';

interface NavigationContextType {
  currentTool: AppTool;
  selectedToolDef: ToolDefinition | null;
  isMobileOpen: boolean;
  isCommandPaletteOpen: boolean;
  navigate: (tool: AppTool, def?: ToolDefinition) => void;
  setMobileOpen: (isOpen: boolean) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  isPending: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTool, setCurrentToolState] = useState<AppTool>(AppTool.MISSION_CONTROL);
  const [selectedToolDef, setSelectedToolDef] = useState<ToolDefinition | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const navigate = (tool: AppTool, def?: ToolDefinition) => {
    // Immediate updates for UI responsiveness (closing menus)
    setIsMobileOpen(false);
    setIsCommandPaletteOpen(false);

    // Defer the heavy state update that triggers the main content re-render
    startTransition(() => {
        if (def) setSelectedToolDef(def);
        setCurrentToolState(tool);
    });
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
      setCommandPaletteOpen,
      isPending
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
