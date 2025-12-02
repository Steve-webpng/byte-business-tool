
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { runGenericTool } from '../services/geminiService';
import { SocialPost } from '../types';
import { useToast } from './ToastContainer';

interface SocialMediaManagerProps {
    workflowData?: string | null;
    clearWorkflowData?: () => void;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ workflowData, clearWorkflowData }) => {
    const [posts, setPosts] = useState<SocialPost[]>([
        { id: '1', platform: 'twitter', content: 'Exciting news coming soon! #LaunchDay', scheduledTime: '2024-06-15 10:00', status: 'scheduled' },
        { id: '2', platform: 'linkedin', content: 'We are hiring! Check our careers page.', scheduledTime: '2024-06-16 09:00', status: 'draft' }
    ]);
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (workflowData && clearWorkflowData) {
            setTopic(workflowData);
            clearWorkflowData();
            toast.show("Content loaded from workflow!", "info");
        }
    }, [workflowData, clearWorkflowData]);

    const handleGenerate = async () => {
        if(!topic) return;
        setLoading(true);
        try {
            const prompt = `Generate 3 social media posts about: "${topic}". 
            1. For Twitter (punchy, hashtags)
            2. For LinkedIn (professional, storytelling)
            3. For Instagram (visual description, engaging caption)
            Return as JSON array of objects with 'platform' and 'content'.`;
            
            const res = await runGenericTool(prompt, "You are a social media manager. Return JSON.");
            try {
                // Attempt to clean code blocks if present
                const cleanRes = res.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(cleanRes);
                const newPosts = parsed.map((p: any) => ({
                    id: Date.now() + Math.random().toString(),
                    platform: p.platform.toLowerCase(),
                    content: p.content,
                    status: 'draft'
                }));
                setPosts(prev => [...newPosts, ...prev]);
                toast.show("Posts generated!", "success");
            } catch {
                toast.show("Generated content, but check format.", "info");
            }
        } catch(e) {
            toast.show("Generation failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    const getPlatformIcon = (p: string) => {
        switch(p) {
            case 'twitter': return <span className="text-sky-500">𝕏</span>;
            case 'linkedin': return <span className="text-blue-700">in</span>;
            case 'instagram': return <span className="text-pink-600">IG</span>;
            default: return <span>🌐</span>;
        }
    };

    return (
        <div className="h-full flex flex-col max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Icons.Share /> Social Media Manager
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Schedule, analytics, and content creation.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Post Creator</h3>
                        <textarea 
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            placeholder="What do you want to post about? Or paste content here..."
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-32 mb-4 outline-none"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={loading || !topic}
                            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Generating...' : 'Auto-Generate Posts'}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Analytics Snapshot</h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div className="text-xl font-bold text-blue-600">12.5k</div>
                                <div className="text-xs text-slate-500">Impressions</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div className="text-xl font-bold text-emerald-600">4.8%</div>
                                <div className="text-xs text-slate-500">Engagement</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">Content Calendar</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {posts.map(post => (
                            <div key={post.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-lg">
                                    {getPlatformIcon(post.platform)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase">{post.platform}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${post.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {post.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 whitespace-pre-wrap">{post.content}</p>
                                    {post.scheduledTime && (
                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                            <Icons.CalendarDays /> {post.scheduledTime}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialMediaManager;
