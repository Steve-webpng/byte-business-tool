import React, { useState } from 'react';
import { generateMarketingContent } from '../services/geminiService';
import { saveItem, getSupabaseConfig } from '../services/supabaseService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import { Icons } from '../constants';

interface ContentGeneratorProps {
  isWidget?: boolean;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ isWidget = false }) => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Email');
  const [tone, setTone] = useState('Professional');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const profile = getProfile();
      const context = formatProfileForPrompt(profile);
      const selectedTone = (profile?.voice && tone === 'Professional') ? profile.voice : tone;
      const text = await generateMarketingContent(topic, type, selectedTone, context);
      setGeneratedText(text);
    } catch (e) {
      console.error(e);
      setGeneratedText("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedText) return;
    setSaving(true);
    const title = `${type}: ${topic}`;
    const result = await saveItem('Content', title, generatedText);
    if (result.success) {
      alert("Saved to database!");
    } else {
      alert("Failed to save: " + result.error);
    }
    setSaving(false);
  };

  return (
    <div className={`h-full flex flex-col ${isWidget ? '' : 'max-w-6xl mx-auto'}`}>
      {!isWidget && (
        <div className="mb-6 flex items-center justify-between">
          <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Content Studio</h2>
              <p className="text-slate-500">Draft professional emails, posts, and articles tailored to your brand.</p>
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
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic / Prompt</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50 ${isWidget ? 'h-20 text-sm' : 'min-h-[140px]'}`}
                placeholder="e.g. Announce a summer sale for our bakery..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option>Professional</option>
                  <option>Enthusiastic</option>
                  <option>Urgent</option>
                  <option>Witty</option>
                  <option>Empathetic</option>
                  <option>Authoritative</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
                <button
                onClick={handleGenerate}
                disabled={loading || !topic}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-all
                    ${loading || !topic ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
                >
                {loading ? 'Generating...' : <><Icons.Sparkles /> Generate Content</>}
                </button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className={`${isWidget ? 'col-span-1' : 'lg:col-span-8'} bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col ${isWidget ? 'h-64' : 'min-h-[500px]'}`}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                <Icons.DocumentText /> Generated Result
            </h3>
            <div className="flex gap-2">
                 {generatedText && getSupabaseConfig() && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        {saving ? 'Saving...' : <><Icons.Save /> Save</>}
                    </button>
                 )}
                 {generatedText && (
                   <button 
                    onClick={() => navigator.clipboard.writeText(generatedText)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                   >
                     Copy Text
                   </button>
                 )}
            </div>
          </div>
          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 p-6 overflow-y-auto">
            {generatedText ? (
                <div className="font-serif text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {generatedText}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <Icons.Pen />
                    <span className="text-sm mt-2 italic">Draft will appear here...</span>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;