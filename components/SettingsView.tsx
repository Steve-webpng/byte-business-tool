
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { 
  BusinessProfile, getProfile, saveProfile, 
  getApiKey, saveApiKey, 
  getModelPreference, saveModelPreference,
  Theme, getTheme, saveTheme
} from '../services/settingsService';
import { getSavedItems, getContacts } from '../services/supabaseService';
import { useToast } from './ToastContainer';

interface SettingsViewProps {
    onThemeChange: (theme: Theme) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onThemeChange }) => {
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '',
    industry: '',
    audience: '',
    voice: 'Professional',
    description: ''
  });
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [theme, setTheme] = useState<Theme>('system');
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const existingProfile = getProfile();
    if (existingProfile) setProfile(existingProfile);

    const existingKey = getApiKey();
    if (existingKey) setApiKey(existingKey);

    const existingModel = getModelPreference();
    if (existingModel) setModel(existingModel);

    const existingTheme = getTheme();
    if (existingTheme) setTheme(existingTheme);
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = () => {
    saveProfile(profile);
    saveApiKey(apiKey);
    saveModelPreference(model);
    saveTheme(theme);
    onThemeChange(theme);
    toast.show("Settings saved successfully!", "success");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  const handleThemeChange = (newTheme: Theme) => {
      setTheme(newTheme);
      saveTheme(newTheme);
      onThemeChange(newTheme);
      setSaved(false);
  }

  const handleExport = async () => {
      try {
          const items = await getSavedItems();
          const contacts = await getContacts();
          const exportData = {
              profile,
              savedItems: items,
              contacts,
              exportDate: new Date().toISOString()
          };
          
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `byete-backup-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast.show("Data exported successfully!", "success");
      } catch(e) {
          console.error(e);
          toast.show("Failed to export data.", "error");
      }
  };

  return (
    <div className="h-full max-w-4xl mx-auto flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Settings</h2>
            <p className="text-slate-500 dark:text-slate-400">
            Configure your business profile and AI connection settings.
            </p>
        </div>
        <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 transition-colors"
        >
            <Icons.Download /> Export Data
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-20">
        
        {/* Theme Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Appearance</h3>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-xl">
                <button onClick={() => handleThemeChange('light')} className={`flex-1 flex justify-center items-center gap-2 py-2 px-4 rounded-lg text-sm font-bold ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                    <Icons.Sun /> Light
                </button>
                <button onClick={() => handleThemeChange('dark')} className={`flex-1 flex justify-center items-center gap-2 py-2 px-4 rounded-lg text-sm font-bold ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                    <Icons.Moon /> Dark
                </button>
                <button onClick={() => handleThemeChange('system')} className={`flex-1 flex justify-center items-center gap-2 py-2 px-4 rounded-lg text-sm font-bold ${theme === 'system' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                    <Icons.Cog /> System
                </button>
            </div>
        </div>

        {/* AI Configuration Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                 <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                         <Icons.Chip />
                     </div>
                     <div>
                         <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">AI Configuration</h3>
                         <p className="text-slate-500 dark:text-slate-400 text-xs">Manage your Gemini connection</p>
                     </div>
                 </div>
             </div>
             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gemini API Key</label>
                     <div className="relative">
                         <input 
                             type="password"
                             value={apiKey}
                             onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
                             placeholder="AIzaSy..."
                             className="w-full p-3 pl-10 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                         />
                         <div className="absolute left-3 top-3.5 text-slate-400">
                             <Icons.Shield />
                         </div>
                     </div>
                     <p className="text-xs text-slate-400 mt-2">
                         Your key is stored locally. Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-purple-600 dark:text-purple-400 hover:underline">Google AI Studio</a>.
                     </p>
                 </div>

                 <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Model Preference</label>
                     <select 
                         value={model}
                         onChange={(e) => { setModel(e.target.value); setSaved(false); }}
                         className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-900"
                     >
                         <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                         <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite</option>
                         <option value="gemini-3-pro-preview">Gemini 3.0 Pro</option>
                     </select>
                     <p className="text-xs text-slate-400 mt-2">
                         Choose the model that powers all tools.
                     </p>
                 </div>
             </div>
        </div>

        {/* Business Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border-r border-slate-200 dark:border-slate-700 md:w-1/3 flex flex-col justify-between">
                <div>
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-md text-white">
                        <Icons.UserCircle />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">{profile.name || "Your Business"}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {profile.industry ? `${profile.industry} • ` : ''} 
                        {profile.voice ? `${profile.voice} Voice` : ''}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 mt-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Context Preview</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                        "Act as {profile.name || "[Business Name]"}, a {profile.industry || "[Industry]"} company..."
                    </p>
                </div>
            </div>

            <div className="p-8 flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">Business Identity</h3>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Name</label>
                        <input name="name" value={profile.name} onChange={handleProfileChange} type="text" placeholder="e.g. Acme Corp"
                            className="w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Industry</label>
                            <input name="industry" value={profile.industry} onChange={handleProfileChange} type="text" placeholder="e.g. SaaS, Bakery"
                                className="w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Brand Voice</label>
                            <select name="voice" value={profile.voice} onChange={handleProfileChange}
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900">
                                <option>Professional</option><option>Friendly</option><option>Witty</option><option>Authoritative</option><option>Empathetic</option><option>Luxury</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Audience</label>
                        <input name="audience" value={profile.audience} onChange={handleProfileChange} type="text" placeholder="e.g. Small business owners"
                            className="w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Business Description</label>
                        <textarea name="description" value={profile.description} onChange={handleProfileChange} placeholder="What makes you unique?"
                            className="w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" />
                    </div>
                </div>
            </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Data Management</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Download a backup of your profile, saved items, and CRM contacts.
            </p>
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
                <Icons.Download /> Export All Data (JSON)
            </button>
        </div>

      </div>

      <div className="sticky bottom-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between shadow-xl rounded-2xl">
           <div className="text-sm text-slate-500">
               {saved ? <span className="text-emerald-500 font-bold flex items-center gap-1"><Icons.CheckCircle /> Saved successfully</span> : 'Unsaved changes'}
           </div>
           <button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center gap-2"
          >
              <Icons.Save /> Save All Settings
          </button>
      </div>
    </div>
  );
};

export default SettingsView;
