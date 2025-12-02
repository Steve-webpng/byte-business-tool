
import React, { useState } from 'react';
import { Icons } from '../constants';
import { performMarketResearch } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const SUGGESTIONS = ["Generative AI 2025", "Sustainable Fashion", "Remote Work Tools", "Creator Economy", "Health Tech", "Digital Nomad Lifestyle"];

const TrendAnalyzer: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if(!topic) return;
        setLoading(true);
        try {
            // Note: We now use the 'trends' mode in performMarketResearch to inject specific trending instructions
            const result = await performMarketResearch(topic, '', 'trends');
            setReport(result.text);
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
                <p className="text-slate-500 dark:text-slate-400">Discover viral topics and market shifts with real-time data.</p>
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
                        onClick={handleAnalyze}
                        disabled={loading || !topic}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50 transition-colors shadow-md"
                    >
                        {loading ? 'Scanning Trends...' : 'Analyze Trends'}
                    </button>
                </div>
                
                {!report && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide py-1">Trending Now:</span>
                        {SUGGESTIONS.map(s => (
                            <button 
                                key={s}
                                onClick={() => { setTopic(s); }}
                                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 overflow-y-auto">
                {report ? (
                    <MarkdownRenderer content={report} />
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
