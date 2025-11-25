import React, { useState } from 'react';
import { generateMarketingContent, generateMarketingCampaign, generateImage } from '../services/geminiService';
import { saveItem, getSupabaseConfig, getSavedItems } from '../services/supabaseService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import { MarketingCampaign, SavedItem } from '../types';
import { Icons } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';

interface ContentGeneratorProps {
  isWidget?: boolean;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ isWidget = false }) => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Email');
  const [tone, setTone] = useState('Professional');
  const [customTone, setCustomTone] = useState('');
  
  // Modes: 'Single', 'Campaign', 'Image'
  const [mode, setMode] = useState<'Single' | 'Campaign' | 'Image'>('Single');
  
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [campaign, setCampaign] = useState<MarketingCampaign | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'linkedin' | 'twitter'>('email');
  const [recentDrafts, setRecentDrafts] = useState<SavedItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchHistory = async () => {
    const items = await getSavedItems();
    setRecentDrafts(items.filter(i => i.tool_type === 'Content' || i.tool_type === 'Image').slice(0, 5));
    setShowHistory(!showHistory);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setGeneratedText('');
    setGeneratedImage('');
    setCampaign(null);
    
    try {
      const profile = getProfile();
      const context = formatProfileForPrompt(profile);
      const selectedTone = tone === 'Custom' ? customTone : (profile?.voice && tone === 'Professional' ? profile.voice : tone);
      
      if (mode === 'Single') {
        const text = await generateMarketingContent(topic, type, selectedTone, context);
        setGeneratedText(text);
      } else if (mode === 'Campaign') {
        const camp = await generateMarketingCampaign(topic, selectedTone, context);
        setCampaign(camp);
        setActiveTab('email');
      } else if (mode === 'Image') {
         const imageContext = profile ? `For a brand called ${profile.name} (${profile.industry}). ` : '';
         const fullPrompt = `${imageContext}${topic}. High quality, professional photography, cinematic lighting.`;
         const base64 = await generateImage(fullPrompt);
         setGeneratedImage(base64);
      }
    } catch (e) {
      console.error(e);
      setGeneratedText("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let title = '';
    let content = '';
    let toolType = 'Content';

    if (mode === 'Single') {
       if (!generatedText) return;
       title = `${type}: ${topic}`;
       content = generatedText;
    } else if (mode === 'Campaign') {
       if (!campaign) return;
       title = `Campaign: ${topic}`;
       content = `EMAIL SUBJECT: ${campaign.emailSubject}\n\nEMAIL BODY:\n${campaign.emailBody}\n\nLINKEDIN:\n${campaign.linkedinPost}\n\nTWITTER:\n${campaign.twitterThread.join('\n\n')}`;
    } else if (mode === 'Image') {
       if (!generatedImage) return;
       title = `Image: ${topic}`;
       content = generatedImage; // Saving base64 string
       toolType = 'Image';
    }

    const result = await saveItem(toolType, title, content);
    if (result.success) {
      alert("Saved to database!");
    } else {
      alert("Failed to save: " + result.error);
    }
    setSaving(false);
  };

  const downloadImage = () => {
      if (!generatedImage) return;
      const a = document.createElement('a');
      a.href = generatedImage;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <div className={`h-full flex flex-col ${isWidget ? '' : 'max-w-6xl mx-auto'}`}>
      {!isWidget && (
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Content Studio</h2>
              <p className="text-slate-500 text-sm">Draft professional emails, posts, and generate brand visuals.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                 <button 
                    onClick={fetchHistory}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    title="Recent Drafts"
                 >
                     <Icons.Clock />
                 </button>
                 {showHistory && (
                     <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                         <div className="p-3 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase">Recent Drafts</div>
                         {recentDrafts.length === 0 ? (
                             <div className="p-4 text-center text-xs text-slate-400">No recent drafts</div>
                         ) : (
                             recentDrafts.map(item => (
                                 <button 
                                    key={item.id}
                                    onClick={() => {
                                        if (item.tool_type === 'Image') {
                                            setGeneratedImage(item.content);
                                            setMode('Image');
                                        } else {
                                            setGeneratedText(item.content);
                                            setMode('Single');
                                        }
                                        setCampaign(null);
                                        setShowHistory(false);
                                    }}
                                    className="w-full text-left p-3 hover:bg-blue-50 text-sm border-b border-slate-50 last:border-0 truncate"
                                 >
                                     <span className="text-[10px] font-bold text-slate-400 mr-2 border px-1 rounded">{item.tool_type}</span>
                                     {item.title}
                                 </button>
                             ))
                         )}
                     </div>
                 )}
             </div>
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setMode('Single')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'Single' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Text
                </button>
                <button 
                    onClick={() => setMode('Campaign')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'Campaign' ? 'bg-white shadow text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Campaign
                </button>
                <button 
                    onClick={() => setMode('Image')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'Image' ? 'bg-white shadow text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Image
                </button>
             </div>
          </div>
        </div>
      )}

      {isWidget && (
        <div className="flex items-center gap-2 mb-3 text-slate-700">
          <Icons.Pen />
          <h3 className="font-bold text-sm uppercase tracking-wide">Content Studio</h3>
        </div>
      )}

      <div className={`grid ${isWidget ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-12 gap-6'} flex-1 min-h-0`}>
        {/* Controls */}
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col ${isWidget ? 'p-3' : 'p-6 h-fit lg:col-span-4'}`}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  {mode === 'Image' ? 'Image Description' : 'Topic / Prompt'}
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50 ${isWidget ? 'h-20 text-sm' : 'min-h-[140px]'}`}
                placeholder={mode === 'Image' ? "e.g. A modern workspace with plants and a laptop..." : "e.g. Announce a summer sale..."}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {mode === 'Single' && (
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Format</label>
                    <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                    <option>Email</option>
                    <option>Blog Post</option>
                    <option>LinkedIn Post</option>
                    <option>Press Release</option>
                    <option>Tweet Thread</option>
                    <option>Video Script</option>
                    </select>
                </div>
              )}
              {mode !== 'Image' && (
                <div className={mode === 'Campaign' ? 'col-span-2' : ''}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tone</label>
                    <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white mb-2"
                    >
                    <option>Professional</option>
                    <option>Enthusiastic</option>
                    <option>Urgent</option>
                    <option>Witty</option>
                    <option>Empathetic</option>
                    <option>Authoritative</option>
                    <option>Custom</option>
                    </select>
                    {tone === 'Custom' && (
                        <input 
                            type="text"
                            value={customTone}
                            onChange={(e) => setCustomTone(e.target.value)}
                            placeholder="e.g. Sarcastic..."
                            className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                        />
                    )}
                </div>
              )}
            </div>

            <div className="pt-2">
                <button
                onClick={handleGenerate}
                disabled={loading || !topic}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-all
                    ${loading || !topic ? 'bg-slate-300 cursor-not-allowed' : mode === 'Campaign' ? 'bg-purple-600 hover:bg-purple-700 shadow-md' : mode === 'Image' ? 'bg-pink-600 hover:bg-pink-700 shadow-md' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
                >
                {loading ? 'Generating...' : <><Icons.Sparkles /> {mode === 'Campaign' ? 'Generate Campaign' : mode === 'Image' ? 'Generate Image' : 'Generate Content'}</>}
                </button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className={`${isWidget ? 'col-span-1' : 'lg:col-span-8'} bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col ${isWidget ? 'h-64' : 'min-h-[500px]'}`}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                {mode === 'Image' ? <Icons.Photo /> : <Icons.DocumentText />} Result
            </h3>
            <div className="flex gap-2">
                 {(generatedText || campaign || generatedImage) && getSupabaseConfig() && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        {saving ? 'Saving...' : <><Icons.Save /> Save</>}
                    </button>
                 )}
                 {generatedImage && (
                     <button
                        onClick={downloadImage}
                        className="text-xs flex items-center gap-1 text-pink-600 hover:text-pink-800 font-bold bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition-colors"
                     >
                         <Icons.Download /> Download
                     </button>
                 )}
                 {(generatedText || campaign) && (
                   <button 
                    onClick={() => {
                        let txt = generatedText;
                        if (campaign) {
                             if(activeTab === 'email') txt = `Subject: ${campaign.emailSubject}\n\n${campaign.emailBody}`;
                             else if(activeTab === 'linkedin') txt = campaign.linkedinPost;
                             else if(activeTab === 'twitter') txt = campaign.twitterThread.join('\n\n');
                        }
                        navigator.clipboard.writeText(txt);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                   >
                     Copy
                   </button>
                 )}
            </div>
          </div>

          {/* Campaign Tabs */}
          {campaign && (
              <div className="flex border-b border-slate-100 mb-4 overflow-x-auto">
                  <button onClick={() => setActiveTab('email')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'email' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Email</button>
                  <button onClick={() => setActiveTab('linkedin')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'linkedin' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>LinkedIn</button>
                  <button onClick={() => setActiveTab('twitter')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'twitter' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Twitter</button>
              </div>
          )}

          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 p-6 overflow-y-auto">
            {campaign ? (
                <div className="text-slate-800">
                    {activeTab === 'email' && (
                        <>
                            <div className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Subject: {campaign.emailSubject}</div>
                            <MarkdownRenderer content={campaign.emailBody} />
                        </>
                    )}
                    {activeTab === 'linkedin' && <MarkdownRenderer content={campaign.linkedinPost} />}
                    {activeTab === 'twitter' && campaign.twitterThread.map((tweet, i) => (
                        <div key={i} className="mb-4 p-3 bg-white border border-slate-200 rounded-lg text-sm font-sans">
                            <div className="font-bold text-slate-400 text-xs mb-1">Tweet {i+1}</div>
                            <MarkdownRenderer content={tweet} />
                        </div>
                    ))}
                </div>
            ) : generatedImage ? (
                <div className="h-full flex items-center justify-center">
                    <img src={generatedImage} alt="AI Generated" className="max-h-full max-w-full rounded-lg shadow-md" />
                </div>
            ) : generatedText ? (
                <MarkdownRenderer content={generatedText} />
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    {mode === 'Image' ? <Icons.Photo /> : <Icons.Pen />}
                    <span className="text-sm mt-2 italic">Result will appear here...</span>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;