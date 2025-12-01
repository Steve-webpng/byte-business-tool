
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { Automation } from '../types';
import { getAutomations, saveAutomation, deleteAutomation } from '../services/automationService';
import { useToast } from './ToastContainer';

const Automator: React.FC = () => {
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [triggerType, setTriggerType] = useState<Automation['trigger']['type']>('deal_stage');
    const [actionType, setActionType] = useState<Automation['action']['type']>('create_task');
    const toast = useToast();

    useEffect(() => {
        setAutomations(getAutomations());
    }, []);

    const handleSave = () => {
        if (!name) return;
        const newAutomation: Automation = {
            id: `auto-${Date.now()}`,
            name,
            active: true,
            trigger: { type: triggerType, config: {} },
            action: { type: actionType, config: {} }
        };
        saveAutomation(newAutomation);
        setAutomations(getAutomations());
        setIsCreating(false);
        setName('');
        toast.show("Automation created", "success");
    };

    const handleDelete = (id: string) => {
        deleteAutomation(id);
        setAutomations(getAutomations());
        toast.show("Automation deleted", "info");
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Icons.Flow /> Automator
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Create workflows to put your business on autopilot.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Icons.Plus /> New Workflow
                </button>
            </div>

            {isCreating && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg mb-6">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">Create Automation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                            <input 
                                className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Onboarding Task"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">When (Trigger)</label>
                            <select 
                                className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                value={triggerType} onChange={e => setTriggerType(e.target.value as any)}
                            >
                                <option value="deal_stage">Deal Stage Changes</option>
                                <option value="task_created">Task Created</option>
                                <option value="time">Scheduled Time</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Then (Action)</label>
                            <select 
                                className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                value={actionType} onChange={e => setActionType(e.target.value as any)}
                            >
                                <option value="create_task">Create Task</option>
                                <option value="send_email">Draft Email</option>
                                <option value="create_invoice">Create Invoice</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                        <button onClick={handleSave} className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg">Save Automation</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {automations.map(auto => (
                    <div key={auto.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${auto.active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Icons.Flow />
                            </div>
                            <button onClick={() => handleDelete(auto.id)} className="text-slate-300 hover:text-red-500"><Icons.X /></button>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{auto.name}</h4>
                        <div className="text-xs text-slate-500 space-y-1">
                            <p><strong>When:</strong> {auto.trigger.type.replace('_', ' ')}</p>
                            <p><strong>Then:</strong> {auto.action.type.replace('_', ' ')}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${auto.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {auto.active ? 'Active' : 'Paused'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Automator;
