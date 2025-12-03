
import React, { useState } from 'react';
import { Icons } from '../constants';
import { runGenericTool } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const StrategyHub: React.FC = () => {
    const [activeModule, setActiveModule] = useState<'persona' | 'strategy' | 'eval' | 'launch'>('persona');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    const MODULES = {
        persona: { 
            title: "Customer Persona Builder", 
            prompt: "Create a detailed Customer Persona based on this business description. Include Demographics, Psychographics, Pain Points, Goals, and Buying Behavior.",
            icon: Icons.UserCircle 
        },
        strategy: { 
            title: "Marketing Strategy Planner", 
            prompt: "Create a comprehensive Marketing Strategy for this business. Include Goals, Channels, Content Pillars, Budget Allocation estimates, and a Timeline.",
            icon: Icons.Telescope 
        },
        launch: {
            title: "Viral Launch Blueprint",
            prompt: `Design an "Upgraded" 4-Week Product Launch Campaign based on the product description provided.
            
            Structure:
            1. **Pre-Launch (Hype Phase):** Define a "Waitlist" strategy with a viral referral mechanic (e.g. "Refer 3 friends for early access"). Draft an influencer seeding plan.
            2. **Launch Day (The Drop):** Create a "Scarcity" tactic (e.g. "First 500 orders only"). Draft a high-urgency SMS notification script. Plan a "Livestream" event concept.
            3. **Post-Launch (Retention):** Design a User Generated Content (UGC) contest to keep momentum. Draft a "Thank You" email sequence that cross-sells.
            
            Output as a detailed Markdown plan.`,
            icon: Icons.Megaphone
        },
        eval: { 
            title: "Business Evaluator (SWOT/PESTEL)", 
            prompt: "Perform a deep business evaluation. Generate a SWOT Analysis, PESTEL Analysis, and Porter's 5 Forces analysis for this business context.",
            icon: Icons.Chart 
        }
    };

    const handleRun = async () => {
        if (!input) return;
        setLoading(true);
        try {
            const config = MODULES[activeModule];
            const result = await runGenericTool(`BUSINESS CONTEXT: ${input}`, config.prompt);
            setOutput(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Icons.Telescope /> Strategy Hub
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">AI-powered planning and analysis tools.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-bold overflow-x-auto">
                    {Object.entries(MODULES).map(([key, config]) => (
                        <button 
                            key={key}
                            onClick={() => { setActiveModule(key as any); setOutput(''); }}
                            className={`px-4 py-2 rounded-md whitespace-nowrap flex items-center gap-2 transition-all ${activeModule === key ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                        >
                            <config.icon /> {config.title.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Input Panel */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">{MODULES[activeModule].title}</h3>
                    <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Describe your business, product, and target market in detail..."
                        className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none mb-4 focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                        onClick={handleRun}
                        disabled={loading || !input}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all shadow-md"
                    >
                        {loading ? 'Analyzing...' : 'Generate Report'}
                    </button>
                </div>

                {/* Output Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 overflow-y-auto">
                    {output ? (
                        <MarkdownRenderer content={output} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <Icons.Presentation />
                            </div>
                            <p>Enter business details to generate a strategic report.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StrategyHub;
