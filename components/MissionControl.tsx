
import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';
import { getDeals, getExpenses, getContacts, getSavedItems } from '../services/supabaseService';
import { Contact, Deal, Expense, Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MissionControl: React.FC = () => {
  const [metrics, setMetrics] = useState({
      totalPipeline: 0,
      wonRevenue: 0,
      totalExpenses: 0,
      totalContacts: 0,
      newLeads: 0,
      tasksTotal: 0,
      tasksDone: 0,
      recentDocs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
          const [deals, expenses, contacts, savedItems] = await Promise.all([
              getDeals(),
              getExpenses(),
              getContacts(),
              getSavedItems()
          ]);

          // Projects are stored in local storage for now
          const savedBoard = localStorage.getItem('byete_current_board_state');
          const tasks: Task[] = savedBoard ? JSON.parse(savedBoard) : [];

          const totalPipeline = deals.filter(d => d.stage !== 'Lost' && d.stage !== 'Won').reduce((acc, d) => acc + Number(d.value), 0);
          const wonRevenue = deals.filter(d => d.stage === 'Won').reduce((acc, d) => acc + Number(d.value), 0);
          const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
          const newLeads = contacts.filter(c => c.status === 'Lead').length;
          const tasksDone = tasks.filter(t => t.columnId === 'done').length;

          setMetrics({
              totalPipeline,
              wonRevenue,
              totalExpenses,
              totalContacts: contacts.length,
              newLeads,
              tasksTotal: tasks.length,
              tasksDone,
              recentDocs: savedItems.length
          });
          setLoading(false);
      };
      fetchData();
  }, []);

  const financialData = [
      { name: 'Expenses', value: metrics.totalExpenses, color: '#ef4444' },
      { name: 'Won Rev', value: metrics.wonRevenue, color: '#10b981' },
      { name: 'Pipeline', value: metrics.totalPipeline, color: '#3b82f6' }
  ];

  const taskProgress = metrics.tasksTotal === 0 ? 0 : Math.round((metrics.tasksDone / metrics.tasksTotal) * 100);

  const StatCard = ({ icon: Icon, label, value, subLabel, color }: any) => (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className={`p-4 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
              <Icon />
          </div>
          <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</h3>
              {subLabel && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subLabel}</p>}
          </div>
      </div>
  );

  if (loading) {
      return (
          <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
        <div className="mb-8 flex items-end justify-between">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Mission Control</h2>
                <p className="text-slate-500 dark:text-slate-400">Real-time overview of your business operations.</p>
            </div>
            <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-400 uppercase">Net Cash Flow (Est)</p>
                <p className={`text-xl font-bold ${metrics.wonRevenue - metrics.totalExpenses >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    ${(metrics.wonRevenue - metrics.totalExpenses).toLocaleString()}
                </p>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
                icon={Icons.Money} 
                label="Active Pipeline" 
                value={`$${metrics.totalPipeline.toLocaleString()}`} 
                subLabel={`${metrics.wonRevenue > 0 ? `$${metrics.wonRevenue.toLocaleString()} won` : 'No closed deals yet'}`}
                color="bg-blue-500"
            />
            <StatCard 
                icon={Icons.Users} 
                label="CRM Growth" 
                value={metrics.totalContacts} 
                subLabel={`${metrics.newLeads} new leads`}
                color="bg-purple-500"
            />
            <StatCard 
                icon={Icons.Receipt} 
                label="Total Spend" 
                value={`$${metrics.totalExpenses.toLocaleString()}`} 
                subLabel="Recorded expenses"
                color="bg-red-500"
            />
            <StatCard 
                icon={Icons.CheckCircle} 
                label="Project Velocity" 
                value={`${taskProgress}%`} 
                subLabel={`${metrics.tasksDone}/${metrics.tasksTotal} tasks done`}
                color="bg-emerald-500"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Financial Overview Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                    <Icons.Chart /> Financial Snapshot
                </h3>
                <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financialData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} className="text-xs font-bold text-slate-500" width={80} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(val: number) => `$${val.toLocaleString()}`}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                {financialData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Actions & System Status */}
            <div className="flex flex-col gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white flex-1">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Icons.Sparkles /> AI Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                            <span className="text-slate-400">Model</span>
                            <span className="font-mono font-bold text-blue-300">Gemini 2.5</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                            <span className="text-slate-400">Knowledge Base</span>
                            <span className="font-mono font-bold text-emerald-400">{metrics.recentDocs} Docs</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Context Window</span>
                            <span className="font-mono font-bold text-purple-400">Active</span>
                        </div>
                    </div>
                    <div className="mt-6 p-3 bg-white/5 rounded-lg text-xs text-slate-300 italic">
                        "Your pipeline value exceeds expenses by {metrics.totalPipeline > metrics.totalExpenses ? 'a healthy margin' : 'a narrow margin'}. Focus on closing deals."
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex flex-col items-center gap-1">
                            <Icons.Plus /> Add Lead
                        </button>
                        <button className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex flex-col items-center gap-1">
                            <Icons.Pen /> Draft Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MissionControl;
