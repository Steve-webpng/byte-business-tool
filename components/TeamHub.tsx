import React from 'react';
import { Icons } from '../constants';
import { getUsers } from '../services/settingsService';

const TeamHub: React.FC = () => {
    const users = getUsers();

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Icons.Users /> Team Collaboration
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage members, roles, and approval workflows.</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                    <Icons.UserPlus /> Invite Member
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Team Members</h3>
                    <div className="space-y-4">
                        {users.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                        {u.avatar}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-700 dark:text-slate-300">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-slate-600 dark:text-slate-400">
                                    {u.id === 'u1' ? 'Admin' : 'Editor'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Approval Queue</h3>
                    <div className="space-y-3">
                        <div className="p-4 border border-l-4 border-l-amber-500 border-slate-100 dark:border-slate-700 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-amber-600 uppercase">Pending Review</span>
                                <span className="text-xs text-slate-400">Today</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Q3 Marketing Report</p>
                            <div className="flex gap-2">
                                <button className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded hover:bg-emerald-100 font-bold">Approve</button>
                                <button className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 font-bold">Reject</button>
                            </div>
                        </div>
                        <div className="p-4 border border-l-4 border-l-blue-500 border-slate-100 dark:border-slate-700 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-blue-600 uppercase">Draft</span>
                                <span className="text-xs text-slate-400">Yesterday</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">LinkedIn: Product Launch Post</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamHub;