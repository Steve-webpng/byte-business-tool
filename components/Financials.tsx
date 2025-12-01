
import React from 'react';
import { Icons } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Financials: React.FC = () => {
    // Mock Data for visualization
    const data = [
        { name: 'Jan', revenue: 4000, expenses: 2400 },
        { name: 'Feb', revenue: 3000, expenses: 1398 },
        { name: 'Mar', revenue: 2000, expenses: 9800 },
        { name: 'Apr', revenue: 2780, expenses: 3908 },
        { name: 'May', revenue: 1890, expenses: 4800 },
        { name: 'Jun', revenue: 2390, expenses: 3800 },
    ];

    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Icons.Money /> Financial Performance
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Profit & Loss Overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 uppercase">Total Revenue (YTD)</div>
                    <div className="text-3xl font-bold text-emerald-600 mt-2">$16,060</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 uppercase">Total Expenses (YTD)</div>
                    <div className="text-3xl font-bold text-red-600 mt-2">$26,106</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-sm font-bold text-slate-500 uppercase">Net Profit</div>
                    <div className="text-3xl font-bold text-slate-700 dark:text-slate-300 mt-2">-$10,046</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 min-h-[400px]">
                <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-slate-200">Revenue vs Expenses</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Financials;
