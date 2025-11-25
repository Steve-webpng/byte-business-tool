import React, { useState } from 'react';
import { performMarketResearch } from '../services/geminiService';
import { saveItem, getSupabaseConfig } from '../services/supabaseService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import { GroundingChunk } from '../types';
import { Icons } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';

interface MarketResearchProps {
  isWidget?: boolean;
}

const MarketResearch: React.FC<MarketResearchProps> = ({ isWidget = false }) => {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('Global');
  const [result, setResult] = useState<{ text: string; sources: GroundingChunk[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDeepDive, setIsDeepDive] = useState(false);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const profile = getProfile();
      let context = formatProfileForPrompt(profile);
      if (region !== 'Global') {
          context += `\nFOCUS REGION: ${region}. Prioritize data and sources relevant to this region.`;
      }

      const data = await performMarketResearch(query, context, isDeepDive);
      setResult({ text: data.text, sources: data.groundingChunks });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    const contentToSave = `QUERY: ${query}\nREGION: ${region}\n\nRESULT:\n${result.text}\n\nSOURCES:\n${result.sources.map(s => s.web?.uri).join('\n')}`;
    const saveRes = await saveItem('Research', query, contentToSave);
    if (saveRes.success) {
      alert("Research saved!");
    } else {
      alert("Failed to save: " + saveRes.error);
    }
    setSaving(false);
  };

  return (
    <div className={`h-full flex flex-col ${isWidget ? '' : 'max-w-4xl mx-auto'}`}>
      {!isWidget && (
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Market Intelligence</h2>
          <p className="text-slate-500">Deep dive into competitors and trends using real-time Google Search data.</p>
        </div>
      )}

      {isWidget && (
        <div className="flex items-center gap-2 mb-3 text-slate-700">
          <Icons.Search />
          <h3 className="font-bold text-sm uppercase tracking-wide">Market Research</h3>
        </div>
      )}

      <form onSubmit={handleResearch} className={`relative ${isWidget ? 'mb-4' : 'mb-8'}`}>
        <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <Icons.Search />
                </div>
                <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isWidget ? "Research query..." : "e.g., 'Current trends in sustainable packaging for cosmetics'"}
                className={`w-full pl-12 pr-4 rounded-full border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none ${isWidget ? 'py-2 text-sm' : 'py-4 text-lg'}`}
                />
            </div>
            
            {!isWidget && (
                <div className="flex items-center gap-2">
                    <select 
                        value={region} 
                        onChange={(e) => setRegion(e.target.value)}
                        className="py-4 px-6 rounded-full border border-slate-300 shadow-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                    >
                        <option>Global</option>
                        <option>US</option>
                        <option>Europe</option>
                        <option>Asia</option>
                    </select>
                    <button
                        type="submit"
                        disabled={loading || !query}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
                    >
                        {loading ? 'Searching...' : 'Research'}
                    </button>
                </div>
            )}
        </div>
        
        {!isWidget && (
            <div className="mt-3 flex justify-center">
                 <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1">
                     <input 
                        type="checkbox" 
                        id="deepDive" 
                        checked={isDeepDive} 
                        onChange={(e) => setIsDeepDive(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                     />
                     <label htmlFor="deepDive" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                         Generate Comparison Matrix Table
                     </label>
                 </div>
            </div>
        )}
      </form>

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center opacity-50 min-h-[200px]">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-slate-500">Analyzing search results...</p>
        </div>
      )}

      {result && (
        <div className={`flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in ${isWidget ? 'p-4' : 'p-8'}`}>
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
               <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                   <Icons.Chart /> Executive Summary
               </h4>
               {getSupabaseConfig() && (
                   <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                   >
                     {saving ? 'Saving...' : <><Icons.Save /> SAVE REPORT</>}
                   </button>
               )}
          </div>
          
          <div className={`${isWidget ? 'mb-4 text-xs' : 'mb-8'}`}>
            <MarkdownRenderer content={result.text} />
          </div>

          {result.sources && result.sources.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Icons.Globe /> Cited Sources
              </h4>
              <div className={`grid ${isWidget ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3`}>
                {Array.from(new Map(result.sources.map((item: GroundingChunk) => [item.web?.uri, item])).values()).map((chunk: GroundingChunk, idx: number) => {
                    if (!chunk.web) return null;
                    let hostname = "";
                    try { hostname = new URL(chunk.web.uri).hostname; } catch(e) {}

                    return (
                        <a 
                            key={idx} 
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all group"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-500 group-hover:bg-blue-50 transition-colors flex-shrink-0">
                                <Icons.Search /> 
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-700">{chunk.web.title}</div>
                                {hostname && <div className="text-xs text-slate-400 truncate">{hostname}</div>}
                            </div>
                        </a>
                    );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!result && !loading && isWidget && (
         <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
             <p className="text-xs font-medium">Enter a topic to start research</p>
         </div>
      )}
    </div>
  );
};

export default MarketResearch;