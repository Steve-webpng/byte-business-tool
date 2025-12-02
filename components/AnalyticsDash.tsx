
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Icons } from '../constants';
import { getSavedItems } from '../services/supabaseService';
import { SavedItem } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsDash: React.FC = () => {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    
    // Mock Data for visualization
    const usageData = [
        { name: 'Mon', credits: 120, content: 4 },
        { name: 'Tue', credits: 230, content: 7 },
        { name: 'Wed', credits: 180, content: 5 },
        { name: 'Thu', credits: 340, content: 12 },
        { name: 'Fri', credits: 290, content: 9 },
        { name: 'Sat', credits: 100, content: 2 },
        { name: 'Sun', credits: 80, content: 3 },
    ];

    useEffect(() => {
        getSavedItems().then(setSavedItems);
    }, []);

    // Calculate content mix from actual saved items
    const contentMix = savedItems.reduce((acc: any[], item) => {
        const type = item.tool_type || 'Other';
        const existing = acc.find(x => x.name === type);
        if (existing) existing.value++;
        else acc.push({ name: type, value: 1 });
        return acc;
    }, []);

    // Fallback if no data
    const chartData = contentMix.length > 0 ? contentMix : [
        { name: 'Email', value: 35 },
        { name: 'Blog', value: 25 },
        { name: 'Social', value: 20 },
        { name: 'Ads', value: 20 },
    ];

    const StatCard = ({ label, value, sub, icon: Icon, color }: any) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-full ${color} bg-opacity-10 text-${color.replace('bg-', '').replace('-100', '-600')}`}>
                <Icon />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</h3>
                {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Icons.Chart /> Marketing Analytics
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Track performance, usage, and content output.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    label="Credits Used" 
                    value="1,450" 
                    sub="This Month" 
                    icon={Icons.Chip} 
                    color="bg-blue-100" 
                />
                <StatCard 
                    label="Content Created" 
                    value={savedItems.length || "42"} 
                    sub="+12% vs last week" 
                    icon={Icons.DocumentText} 
                    color="bg-purple-100" 
                />
                <StatCard 
                    label="Avg SEO Score" 
                    value="84/100" 
                    sub="Top 10% Industry" 
                    icon={Icons.Search} 
                    color="bg-emerald-100" 
                />
                <StatCard 
                    label="Est. Time Saved" 
                    value="18h" 
                    sub="Based on avg wpm" 
                    icon={Icons.Clock} 
                    color="bg-amber-100" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Usage Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">Generation Activity</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usageData}>
                                <defs>
                                    <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="credits" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCredits)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Content Mix */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">Content Type Distribution</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDash;
