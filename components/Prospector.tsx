
import React, { useState } from 'react';
import { Icons } from '../constants';
import { discoverLeads } from '../services/geminiService';
import { saveContact } from '../services/supabaseService';
import { useToast } from './ToastContainer';
import { Prospect } from '../types';

const Prospector: React.FC = () => {
    const [query, setQuery] = useState('');
    const [leads, setLeads] = useState<Prospect[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        try {
            const results = await discoverLeads(query);
            // Map results to Prospect type, adding default confidence
            const prospects: Prospect[] = results.map(r => ({
                ...r,
                confidence: 85 // Mock confidence for now
            }));
            setLeads(prospects);
            if (prospects.length === 0) toast.show("No leads found.", "info");
        } catch (e) {
            toast.show("Search failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddLead = async (prospect: Prospect) => {
        await saveContact({
            name: prospect.name,
            role: prospect.role,
            company: prospect.company,
            email: prospect.email || '',
            status: 'Lead',
            notes: 'Added via Prospector',
            workspace_id: '' // Handled by service
        });
        toast.show(`${prospect.name} added to CRM`, "success");
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Icons.Telescope /> Lead Prospector
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Find potential customers using AI search.</p>
            </div>

            <form onSubmit={handleSearch} className="mb-8 relative">
                <input 
                    type="text" 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="e.g. Marketing Directors at SaaS companies in London"
                    className="w-full p-4 pl-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
                <button 
                    disabled={loading || !query}
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                    {loading ? 'Searching...' : 'Find Leads'}
                </button>
            </form>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 font-bold text-sm text-slate-500">
                    Results ({leads.length})
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {leads.length === 0 && !loading && (
                        <div className="text-center text-slate-400 py-12">
                            Enter a query to start prospecting.
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-3">
                        {leads.map((lead, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg hover:shadow-md transition-all">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{lead.name}</h4>
                                    <p className="text-sm text-slate-500">{lead.role} at <span className="font-semibold text-blue-600">{lead.company}</span></p>
                                </div>
                                <button 
                                    onClick={() => handleAddLead(lead)}
                                    className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                                >
                                    <Icons.Plus /> Add to CRM
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Prospector;
