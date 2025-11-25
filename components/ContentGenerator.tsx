import React, { useState, useRef, useEffect } from 'react';
import { generateMarketingContent, generateMarketingCampaign, generateImage } from '../services/geminiService';
import { saveItem, getSupabaseConfig, getSavedItems } from '../services/supabaseService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import { MarketingCampaign, SavedItem, AppTool } from '../types';
import { Icons } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';

interface ContentGeneratorProps {
  isWidget?: boolean;
  workflowData?: string | null;
  clearWorkflowData?: () => void;
  onWorkflowSend?: (targetTool: AppTool, data: string) => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ isWidget = false, workflowData, clearWorkflowData, onWorkflowSend }) => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Email');
  const [tone, setTone] = useState('Professional');
  const [customTone, setCustomTone] = useState('');
  const [mode, setMode] = useState<'Single' | 'Campaign' | 'Image'>('Single');
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [campaign, setCampaign] = useState<MarketingCampaign | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'linkedin' | 'twitter'>('email');
  const [recentDrafts, setRecentDrafts] = useState<SavedItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (workflowData && clearWorkflowData) {
      setTopic(workflowData);
      clearWorkflowData();
    }
  }, [workflowData, clearWorkflowData]);

  // ... (rest of functions are mostly unchanged)

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    // ...
  };
  const handleSave = async () => { /* ... */ };
  const downloadImage = () => { /* ... */ };
  const handleSpeak = () => { /* ... */ };
  const stopSpeaking = () => { /* ... */ };
  const toggleDictation = () => { /* ... */ };

  return (
    <div className={`h-full flex flex-col ${isWidget ? '' : 'max-w-6xl mx-auto'}`}>
      {!isWidget && (
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">Content Studio</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Draft professional emails, posts, and generate brand visuals.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                 {/* ... History button ... */}
             </div>
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => setMode('Single')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'Single' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Text
                </button>
                <button 
                    onClick={() => setMode('Campaign')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'Campaign' ? 'bg-white dark:bg-slate-700 shadow text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Campaign
                </button>
                <button 
                    onClick={() => setMode('Image')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'Image' ? 'bg-white dark:bg-slate-700 shadow text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Image
                </button>
             </div>
          </div>
        </div>
      )}

      {isWidget && (
        <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300">
          <Icons.Pen />
          <h3 className="font-bold text-sm uppercase tracking-wide">Content Studio</h3>
        </div>
      )}

      <div className={`grid ${isWidget ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-12 gap-6'} flex-1 min-h-0`}>
        {/* Controls */}
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col ${isWidget ? 'p-3' : 'p-6 h-fit lg:col-span-4'}`}>
          { /* ... Form elements ... */ }
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Topic / Prompt</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-900 ${isWidget ? 'h-20 text-sm' : 'min-h-[140px]'}`}
                placeholder={"e.g. Announce a summer sale..."}
              />
            </div>
            {/* ... other controls ... */}
          </div>
        </div>

        {/* Output */}
        <div className={`${isWidget ? 'col-span-1' : 'lg:col-span-8'} bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col ${isWidget ? 'h-64' : 'min-h-[500px]'}`}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide flex items-center gap-2">
                {mode === 'Image' ? <Icons.Photo /> : <Icons.DocumentText />} Result
            </h3>
            <div className="flex gap-2">
                 {onWorkflowSend && (generatedText || campaign) && (
                    <button onClick={() => {
                        let data = generatedText;
                        if(campaign) {
                            if(activeTab === 'email') data = `Subject: ${campaign.emailSubject}\n\n${campaign.emailBody}`;
                            else if(activeTab === 'linkedin') data = campaign.linkedinPost;
                            else if(activeTab === 'twitter') data = campaign.twitterThread.join('\n\n');
                        }
                        onWorkflowSend(AppTool.DOCUMENTS, data);
                    }}
                    className="text-xs flex items-center gap-1 font-bold px-3 py-1.5 rounded-lg transition-colors text-slate-500 dark:text-slate-300 hover:text-blue-600 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    >
                        <Icons.Share /> Send to Doc
                    </button>
                 )}
                 { /* ... Other buttons: Speak, Save, Download, Copy ... */ }
            </div>
          </div>

          {/* ... Campaign Tabs and Output area ... */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 p-6 overflow-y-auto">
            {/* ... render logic ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;