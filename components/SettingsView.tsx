

import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { 
  BusinessProfile, getProfile, saveProfile, 
  getApiKey, saveApiKey, 
  getModelPreference, saveModelPreference,
  Theme, getTheme, saveTheme,
  getIntegrations, saveIntegrations,
  getNotificationSettings, saveNotificationSettings,
  getCustomVoices, deleteCustomVoice
} from '../services/settingsService';
import { AppIntegration, NotificationSetting } from '../types';
import { getSavedItems, getContacts } from '../services/supabaseService';
import { useToast } from './ToastContainer';

interface SettingsViewProps {
    onThemeChange: (theme: Theme) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onThemeChange }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'integrations' | 'notifications' | 'data'>('general');
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
  
  // Advanced State
  const [integrations, setIntegrations] = useState<AppIntegration[]>([]);
  const [notifications, setNotifications] = useState<NotificationSetting[]>([]);
  const [customVoices, setCustomVoices] = useState<string[]>([]);
  
  // Modal State for Integrations
  const [selectedIntegration, setSelectedIntegration] = useState<AppIntegration | null>(null);
  const [integrationConfig, setIntegrationConfig] = useState<Record<string, string>>({});

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

    setIntegrations(getIntegrations());
    setNotifications(getNotificationSettings());
    setCustomVoices(getCustomVoices());
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
    saveIntegrations(integrations);
    saveNotificationSettings(notifications);
    
    onThemeChange(theme);
    toast.show("Settings saved successfully!", "success");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  const handleThemeChange = (newTheme: Theme) => {
      setTheme(newTheme);
      setSaved(false);
  };

  const openIntegrationModal = (integration: AppIntegration) => {
      setSelectedIntegration(integration);
      setIntegrationConfig(integration.config || {});
  };

  const saveIntegrationConfig = () => {
      if (!selectedIntegration) return;
      const updatedIntegrations = integrations.map(i => {
          if (i.id === selectedIntegration.id) {
              return { 
                  ...i, 
                  config: integrationConfig,
                  // FIX: Added type check for 'val' before accessing 'length' property.
                  connected: Object.values(integrationConfig).some(val => typeof val === 'string' && val.length > 5) // Mock validation
              };
          }
          return i;
      });
      setIntegrations(updatedIntegrations);
      saveIntegrations(updatedIntegrations);
      setSelectedIntegration(null);
      toast.show(`${selectedIntegration.name} configuration saved.`, "success");
  };

  const toggleNotification = (id: string, type: 'email' | 'push') => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, [type]: !n[type] } : n));
      setSaved(false);
  };

  const handleDeleteVoice = (voice: string) => {
      deleteCustomVoice(voice);
      setCustomVoices(getCustomVoices());
      toast.show("Custom voice deleted.", "info");
  };

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

  const handleClearData = (key: string) => {
      if(confirm(`Are you sure you want to clear ${key}? This cannot be undone.`)) {
          localStorage.removeItem(key);
          toast.show("Data cleared. Refresh to see changes.", "info");
      }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === id 
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
          <Icon /> {label}
      </button>
  );

  return (
    <div className="h-full max-w-6xl mx-auto flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Settings</h2>
            <p className="text-slate-500 dark:text-slate-400">Manage your workspace preferences.</p>
        </div>
        <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center gap-2"
        >
            <Icons.Save /> Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-fit shadow-sm p-2">
              <TabButton id="general" label="General & Profile" icon={Icons.UserCircle} />
              <TabButton id="ai" label="AI Configuration" icon={Icons.Chip} />
              <TabButton id="integrations" label="Integrations" icon={Icons.Apps} />
              <TabButton id="notifications" label="Notifications" icon={Icons.ChatBubble} />
              <TabButton id="data" label="Data Management" icon={Icons.Database} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto pr-2 pb-10">
              
              {activeTab === 'general' && (
                  <div className="space-y-6">
                      {/* Theme */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Appearance</h3>
                        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl max-w-md">
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

                    {/* Profile */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Business Profile</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
                                <input name="name" value={profile.name} onChange={handleProfileChange} type="text" placeholder="e.g. Acme Corp"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Industry</label>
                                    <input name="industry" value={profile.industry} onChange={handleProfileChange} type="text" placeholder="e.g. SaaS"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Voice</label>
                                    <select name="voice" value={profile.voice} onChange={handleProfileChange}
                                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none bg-slate-50 dark:bg-slate-900">
                                        <option>Professional</option><option>Friendly</option><option>Witty</option><option>Authoritative</option><option>Empathetic</option><option>Luxury</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Business Description</label>
                                <textarea name="description" value={profile.description} onChange={handleProfileChange} placeholder="What makes you unique?"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none h-24 resize-none focus:border-blue-500" />
                            </div>
                        </div>
                    </div>
                  </div>
              )}

              {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Gemini Configuration</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your API connection and model preferences.</p>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gemini API Key</label>
                                <div className="relative">
                                    <input 
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
                                        placeholder="AIzaSy..."
                                        className="w-full p-3 pl-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                                    />
                                    <div className="absolute left-3 top-3.5 text-slate-400">
                                        <Icons.Shield />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Key is stored locally in browser. <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-purple-600 hover:underline">Get Key</a>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Default Model</label>
                                <select 
                                    value={model}
                                    onChange={(e) => { setModel(e.target.value); setSaved(false); }}
                                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 dark:bg-slate-900"
                                >
                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest)</option>
                                    <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite</option>
                                    <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Smartest)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Custom Brand Voices</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Saved voices from the Content Studio.</p>
                        {customVoices.length === 0 ? (
                            <p className="text-sm italic text-slate-400">No custom voices saved yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {customVoices.map((voice, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate w-3/4" title={voice}>{voice}</p>
                                        <button onClick={() => handleDeleteVoice(voice)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                  </div>
              )}

              {activeTab === 'integrations' && (
                  <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
                          <strong>Advanced Integrations:</strong> Connect your tools to enable seamless workflows.
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {integrations.map(int => (
                              <div key={int.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 h-full">
                                  <div className="flex items-start gap-3">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${int.connected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                          <Icons.Apps /> 
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-slate-800 dark:text-slate-200">{int.name}</h4>
                                          <p className="text-xs text-slate-500 line-clamp-2">{int.description}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                       <span className={`text-xs font-bold ${int.connected ? 'text-emerald-600' : 'text-slate-400'}`}>
                                           {int.connected ? '● Active' : '○ Disconnected'}
                                       </span>
                                       <button 
                                            onClick={() => openIntegrationModal(int)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${int.connected ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            {int.connected ? 'Manage' : 'Connect'}
                                        </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'notifications' && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Notification Preferences</h3>
                      <div className="space-y-4">
                          {notifications.map(n => (
                              <div key={n.id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{n.label}</span>
                                  <div className="flex gap-4">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="checkbox" checked={n.email} onChange={() => toggleNotification(n.id, 'email')} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                          <span className="text-xs text-slate-500">Email</span>
                                      </label>
                                      <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="checkbox" checked={n.push} onChange={() => toggleNotification(n.id, 'push')} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                          <span className="text-xs text-slate-500">Push</span>
                                      </label>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeTab === 'data' && (
                  <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Export Data</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                              Download a backup of your profile, saved items, and CRM contacts in JSON format.
                          </p>
                          <button 
                              onClick={handleExport}
                              className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                              <Icons.Download /> Export All Data
                          </button>
                      </div>

                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 p-6">
                          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                          <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">Clear CRM Data</span>
                                  <button onClick={() => handleClearData('byete_contacts')} className="text-xs font-bold text-red-600 border border-red-200 px-3 py-1.5 rounded hover:bg-red-50">Clear Contacts</button>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">Clear Saved Documents</span>
                                  <button onClick={() => handleClearData('byete_saved_items')} className="text-xs font-bold text-red-600 border border-red-200 px-3 py-1.5 rounded hover:bg-red-50">Clear Docs</button>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">Factory Reset (All Local Data)</span>
                                  <button onClick={() => { if(confirm("This will wipe EVERYTHING. Are you sure?")) { localStorage.clear(); window.location.reload(); }}} className="text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded hover:bg-red-700">RESET APP</button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Integration Modal */}
      {selectedIntegration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                              <Icons.Apps />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Configure {selectedIntegration.name}</h3>
                      </div>
                      <button onClick={() => setSelectedIntegration(null)} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
                  </div>
                  
                  <p className="text-sm text-slate-500 mb-6">
                      Enter your API credentials to enable {selectedIntegration.name} integration features.
                  </p>

                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">API Key / Token</label>
                          <input 
                            type="password" 
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm dark:bg-slate-900 dark:border-slate-600"
                            placeholder="xoxb-..."
                            value={integrationConfig.apiKey || ''}
                            onChange={(e) => setIntegrationConfig({...integrationConfig, apiKey: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Webhook URL (Optional)</label>
                          <input 
                            type="text" 
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm dark:bg-slate-900 dark:border-slate-600"
                            placeholder="https://hooks..."
                            value={integrationConfig.webhookUrl || ''}
                            onChange={(e) => setIntegrationConfig({...integrationConfig, webhookUrl: e.target.value})}
                          />
                      </div>
                  </div>

                  <div className="flex justify-end gap-2">
                      {selectedIntegration.connected && (
                          <button 
                            onClick={() => {
                                const updated = integrations.map(i => i.id === selectedIntegration.id ? {...i, connected: false, config: {}} : i);
                                setIntegrations(updated);
                                saveIntegrations(updated);
                                setSelectedIntegration(null);
                                toast.show("Disconnected.", "info");
                            }}
                            className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-lg"
                          >
                              Disconnect
                          </button>
                      )}
                      <button onClick={() => setSelectedIntegration(null)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg">Cancel</button>
                      <button onClick={saveIntegrationConfig} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                          {selectedIntegration.connected ? 'Update Config' : 'Connect'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SettingsView;
