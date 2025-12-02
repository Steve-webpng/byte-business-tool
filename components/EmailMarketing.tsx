
import React, { useState } from 'react';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';
import { runGenericTool } from '../services/geminiService';
import { EmailCampaign } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import MarkdownRenderer from './MarkdownRenderer';

const EmailMarketing: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');
    const [step, setStep] = useState(1);
    const [aiLoading, setAiLoading] = useState(false);
    const toast = useToast();

    // Campaign State
    const [campaignData, setCampaignData] = useState({
        name: '',
        goal: 'Sales',
        segment: 'All Leads',
        subject: '',
        body: '',
    });

    // AI Features State
    const [subjectIdeas, setSubjectIdeas] = useState<string[]>([]);
    const [spamScore, setSpamScore] = useState<{ score: number, analysis: string } | null>(null);

    // Mock Analytics Data
    const analyticsData = [
        { name: 'Mon', openRate: 45, clickRate: 12 },
        { name: 'Tue', openRate: 52, clickRate: 15 },
        { name: 'Wed', openRate: 48, clickRate: 10 },
        { name: 'Thu', openRate: 61, clickRate: 18 },
        { name: 'Fri', openRate: 55, clickRate: 14 },
        { name: 'Sat', openRate: 30, clickRate: 5 },
        { name: 'Sun', openRate: 35, clickRate: 7 },
    ];

    const campaigns: EmailCampaign[] = [
        { id: '1', name: 'Q3 Product Launch', subject: 'It\'s finally here...', status: 'sent', openRate: 45.2, clickRate: 12.5, sentCount: 1500, type: 'broadcast' },
        { id: '2', name: 'Welcome Sequence', subject: 'Welcome to the family!', status: 'sending', openRate: 68.0, clickRate: 24.1, sentCount: 300, type: 'drip' },
        { id: '3', name: 'Webinar Invite', subject: 'Last chance to register', status: 'draft', type: 'broadcast' },
    ];

    const handleGenerateSubjects = async () => {
        if (!campaignData.goal || !campaignData.name) {
            toast.show("Please enter a campaign name and goal first.", "error");
            return;
        }
        setAiLoading(true);
        try {
            const prompt = `Generate 5 catchy, high-converting email subject lines for a marketing campaign.
            Campaign Name: ${campaignData.name}
            Goal: ${campaignData.goal}
            Target Audience: ${campaignData.segment}
            
            Return ONLY the subject lines as a bulleted list.`;
            const result = await runGenericTool(prompt, "You are a professional copywriter.");
            const lines = result.split('\n').map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(l => l);
            setSubjectIdeas(lines);
        } catch (e) {
            toast.show("Failed to generate subjects.", "error");
        } finally {
            setAiLoading(false);
        }
    };

    const handleGenerateBody = async () => {
        setAiLoading(true);
        try {
            const prompt = `Write a professional email body for the following campaign:
            Subject: ${campaignData.subject || "Pending Subject"}
            Goal: ${campaignData.goal}
            Audience: ${campaignData.segment}
            
            Keep it concise, persuasive, and use a clear Call to Action (CTA). Use Markdown formatting.`;
            const result = await runGenericTool(prompt, "You are an email marketing expert.");
            setCampaignData(prev => ({ ...prev, body: result }));
        } catch (e) {
            toast.show("Failed to draft email.", "error");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSpamCheck = async () => {
        if (!campaignData.body) return;
        setAiLoading(true);
        try {
            const prompt = `Analyze the following email content for spam triggers.
            Subject: ${campaignData.subject}
            Body: ${campaignData.body}
            
            Provide:
            1. A Spam Score (0-10, where 10 is high risk).
            2. A brief explanation of potential triggers (e.g. "free", "guarantee", caps).
            
            Return JSON format: { "score": number, "analysis": string }`;
            
            const result = await runGenericTool(prompt, "You are a deliverability expert. Return strict JSON.");
            try {
                // Attempt to parse JSON from response, handling potential markdown code blocks
                const jsonStr = result.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(jsonStr);
                setSpamScore(parsed);
                toast.show(`Spam Score: ${parsed.score}/10`, parsed.score > 5 ? "error" : "success");
            } catch {
                setSpamScore({ score: 5, analysis: result }); // Fallback
            }
        } catch (e) {
            toast.show("Spam check failed.", "error");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSendCampaign = () => {
        toast.show("Campaign queued for sending!", "success");
        setView('dashboard');
        setStep(1);
        setCampaignData({ name: '', goal: 'Sales', segment: 'All Leads', subject: '', body: '' });
        setSubjectIdeas([]);
        setSpamScore(null);
    };

    const renderWizard = () => {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col h-full overflow-hidden animate-fade-in">
                {/* Wizard Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">New Campaign Wizard</h3>
                        <p className="text-sm text-slate-500">Step {step} of 4</p>
                    </div>
                    <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
                </div>

                {/* Wizard Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">Campaign Setup</h4>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">Campaign Name</label>
                                <input 
                                    className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={campaignData.name} onChange={e => setCampaignData({...campaignData, name: e.target.value})}
                                    placeholder="e.g. Summer Sale 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-1">Goal</label>
                                <select 
                                    className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={campaignData.goal} onChange={e => setCampaignData({...campaignData, goal: e.target.value})}
                                >
                                    <option>Sales / Revenue</option>
                                    <option>Website Traffic</option>
                                    <option>Brand Awareness</option>
                                    <option>Lead Nurturing</option>
                                    <option>Event Registration</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">Target Audience</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {['All Leads', 'New Subscribers (Last 30 Days)', 'High Value Customers', 'Inactive Users'].map(seg => (
                                    <div 
                                        key={seg}
                                        onClick={() => setCampaignData({...campaignData, segment: seg})}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all ${campaignData.segment === seg ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
                                    >
                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{seg}</div>
                                        <div className="text-xs text-slate-500 mt-1">~{Math.floor(Math.random() * 500) + 50} recipients</div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-slate-900/50 rounded-lg border border-purple-100 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <h5 className="font-bold text-purple-700 dark:text-purple-400 text-sm">Need more leads?</h5>
                                    <p className="text-xs text-slate-500">Use the Prospector tool to scrape fresh contacts.</p>
                                </div>
                                <button className="text-xs bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-600 text-purple-600 dark:text-purple-400 px-3 py-2 rounded-lg font-bold">Open Prospector</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1 flex justify-between">
                                        <span>Subject Line</span>
                                        <button onClick={handleGenerateSubjects} disabled={aiLoading} className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1">
                                            {aiLoading ? 'Thinking...' : <><Icons.Sparkles /> Suggest Ideas</>}
                                        </button>
                                    </label>
                                    <input 
                                        className="w-full p-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white font-medium"
                                        value={campaignData.subject} onChange={e => setCampaignData({...campaignData, subject: e.target.value})}
                                        placeholder="Enter a compelling subject..."
                                    />
                                    {subjectIdeas.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2 animate-fade-in">
                                            {subjectIdeas.map((idea, i) => (
                                                <button key={i} onClick={() => setCampaignData({...campaignData, subject: idea})} className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                                    {idea}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-1 flex justify-between">
                                        <span>Email Body</span>
                                        <button onClick={handleGenerateBody} disabled={aiLoading} className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1">
                                            {aiLoading ? 'Writing...' : <><Icons.Pen /> AI Write</>}
                                        </button>
                                    </label>
                                    <textarea 
                                        className="w-full p-4 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white h-64 resize-none font-mono text-sm"
                                        value={campaignData.body} onChange={e => setCampaignData({...campaignData, body: e.target.value})}
                                        placeholder="Write your email here..."
                                    />
                                </div>
                            </div>

                            <div className="md:w-64 space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                                    <h5 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-3">Deliverability Check</h5>
                                    {spamScore ? (
                                        <div className="animate-fade-in">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-slate-500">Spam Score</span>
                                                <span className={`text-sm font-bold ${spamScore.score > 5 ? 'text-red-500' : 'text-emerald-500'}`}>{spamScore.score}/10</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-3">
                                                <div className={`h-full ${spamScore.score > 5 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${spamScore.score * 10}%`}}></div>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">{spamScore.analysis}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <button onClick={handleSpamCheck} disabled={aiLoading || !campaignData.body} className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors">
                                                Run Analysis
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="max-w-2xl mx-auto text-center space-y-6">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                                <Icons.Mail />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Ready to Launch?</h3>
                            
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 text-left border border-slate-200 dark:border-slate-700 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Campaign</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{campaignData.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Segment</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{campaignData.segment}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Subject</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{campaignData.subject}</span>
                                </div>
                            </div>

                            <button onClick={handleSendCampaign} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all text-lg flex items-center gap-2 mx-auto">
                                <Icons.Send /> Launch Campaign
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Nav */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between bg-white dark:bg-slate-800">
                    <button 
                        onClick={() => setStep(prev => Math.max(1, prev - 1))}
                        className={`px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 ${step === 1 ? 'invisible' : ''}`}
                    >
                        Back
                    </button>
                    {step < 4 && (
                        <button 
                            onClick={() => setStep(prev => Math.min(4, prev + 1))}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
                        >
                            Next <Icons.ArrowRight />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // DASHBOARD VIEW
    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            {view === 'wizard' ? renderWizard() : (
                <>
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Icons.Mail /> Email Marketing
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">Campaigns, automations, and analytics.</p>
                        </div>
                        <button 
                            onClick={() => setView('wizard')}
                            className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
                        >
                            <Icons.Plus /> New Campaign
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                        {/* Analytics */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Avg Open Rate</div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">42.5%</div>
                                    <div className="text-xs text-emerald-500 font-bold mt-1">↑ 5.2% vs last month</div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Click Rate</div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">12.8%</div>
                                    <div className="text-xs text-slate-400 font-bold mt-1">→ Stable</div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Total Sent</div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">12.4k</div>
                                    <div className="text-xs text-emerald-500 font-bold mt-1">↑ 1.2k new</div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 min-h-[300px]">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-6">Performance Trend</h3>
                                <ResponsiveContainer width="100%" height="90%">
                                    <LineChart data={analyticsData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="openRate" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} name="Open Rate %" />
                                        <Line type="monotone" dataKey="clickRate" stroke="#10b981" strokeWidth={3} dot={{r: 4}} name="Click Rate %" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Campaigns */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                                Recent Campaigns
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {campaigns.map(camp => (
                                    <div key={camp.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{camp.name}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold 
                                                ${camp.status === 'sent' ? 'bg-emerald-100 text-emerald-600' : 
                                                  camp.status === 'sending' ? 'bg-blue-100 text-blue-600' : 
                                                  'bg-slate-100 text-slate-500'}`}>
                                                {camp.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">{camp.subject}</p>
                                        <div className="flex gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
                                            <span>opens: <strong>{camp.openRate || 0}%</strong></span>
                                            <span>clicks: <strong>{camp.clickRate || 0}%</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                                <button className="w-full py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                    View All Campaigns
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EmailMarketing;
