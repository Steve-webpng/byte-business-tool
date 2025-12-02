
import React, { useState } from 'react';
import { Icons } from '../constants';
import { saveApiKey } from '../services/settingsService';

interface ApiKeyModalProps {
  onConnected: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onConnected }) => {
  const [key, setKey] = useState('');

  const handleSave = () => {
    if (key.trim().length > 10) {
      saveApiKey(key.trim());
      onConnected();
      window.location.reload(); // Reload to ensure all services pick up the new key immediately
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-500/30">
          <Icons.Chip /> 
          {/* Note: Icons.Chip renders an SVG, we style the container text color below if needed, but SVG usually inherits or has fill */}
          <div className="text-white absolute pointer-events-none"><Icons.Chip /></div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Connect Intelligence</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
          To activate the AI features (content generation, analysis, vision), please enter your Google Gemini API Key.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 ml-1">API Key</label>
            <div className="relative">
                <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm text-slate-900 dark:text-white"
                />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={key.length < 10}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Connect API
          </button>

          <p className="text-center text-xs text-slate-400 mt-6">
            Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline hover:text-blue-400 transition-colors">Get one for free from Google AI Studio</a>
          </p>
          
          <div className="text-center mt-4">
             <p className="text-[10px] text-slate-300 dark:text-slate-600">
                 Your key is stored locally in your browser's LocalStorage.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
