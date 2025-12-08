import React, { useState } from 'react';
import { Icons } from '../constants';
import { performMarketResearch } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';
import { GroundingChunk } from '../types';

const SUGGESTIONS = ["Generative AI 2025", "Sustainable Fashion", "Remote Work Tools", "Creator Economy", "Health Tech", "Digital Nomad Lifestyle"];

const TrendAnalyzer: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [report, setReport] = useState<{ text: string, sources: GroundingChunk[] } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async (searchTopic?: string) => {
        const currentTopic = searchTopic || topic;
        if(!currentTopic) return;
        
        setTopic(currentTopic);
        setLoading(true);
        setReport(null);
        try {
            const result = await performMarketResearch(currentTopic, '', 'trends');
            setReport({ text: result.text, sources: result.groundingChunks || [] });
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Icons.TrendingUp /> Trend Analyzer
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Discover viral topics, keyword popularity, and market sentiment with real-time data.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col gap-4">
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="Enter industry or topic (e.g. Sustainable Fashion, AI Tools)..."
                        className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                        onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                    />
                    <button 
                        onClick={() => handleAnalyze()}
                        disabled={loading || !topic}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50 transition-colors shadow-md"
                    >
                        {loading ? 'Scanning Trends...' : 'Analyze Trends'}
                    </button>
                </div>
                
                {!report && !loading && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide py-1">Try:</span>
                        {SUGGESTIONS.map(s => (
                            <button 
                                key={s}
                                onClick={() => handleAnalyze(s)}
                                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 overflow-y-auto">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-80">
                        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mb-4"></div>
                        <p className="font-medium">Analyzing real-time data from Google and social media...</p>
                        <p className="text-sm mt-1">This may take a moment.</p>
                    </div>
                ) : report ? (
                    <div>
                        <MarkdownRenderer content={report.text} />
                        {report.sources && report.sources.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700">
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Icons.Globe /> Data Sources
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Array.from(new Map(report.sources.map(item => [item.web?.uri, item])).values()).map((chunk: GroundingChunk, idx: number) => {
                                        if (!chunk.web) return null;
                                        let hostname = "";
                                        try { hostname = new URL(chunk.web.uri).hostname; } catch(e) {}

                                        return (
                                            <a 
                                                key={idx} 
                                                href={chunk.web.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-blue-400 hover:shadow-sm transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-blue-500 group-hover:bg-blue-50 transition-colors flex-shrink-0">
                                                    <Icons.Search /> 
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-700">{chunk.web.title}</div>
                                                    {hostname && <div className="text-xs text-slate-400 truncate">{hostname}</div>}
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-3xl">
                            📈
                        </div>
                        <p className="font-medium">Search a topic to see what's trending across the web.</p>
                        <p className="text-sm mt-2">Powered by Google Search Grounding</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendAnalyzer;