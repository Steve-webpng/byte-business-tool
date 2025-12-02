

import React, { useState, useEffect, useRef } from 'react';
import { Contact, ContactStatus, Deal, DealStage, Comment } from '../types';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';
import { getContacts, saveContact, updateContact, deleteContact, testConnection, getDeals, saveDeal, updateDeal, deleteDeal, getComments, addComment } from '../services/supabaseService';
import { generateContactInsights, discoverLeads, suggestNextDealAction, enrichContactData, generateFollowUpEmail } from '../services/geminiService';

const CRM: React.FC = () => {
    const [view, setView] = useState<'contacts' | 'deals'>('contacts');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [aiInsight, setAiInsight] = useState('');
    const [insightLoading, setInsightLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tableMissing, setTableMissing] = useState(false);
    const toast = useToast();

    // Deal specific state
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isEditingDeal, setIsEditingDeal] = useState(false);

    // Comments
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = async () => {
        setLoading(true);
        // Check DB connection first
        const hasTable = await testConnection('contacts');
        if (!hasTable) {
            setTableMissing(true);
            setLoading(false);
            return;
        }

        const [cData, dData] = await Promise.all([getContacts(), getDeals()]);
        setContacts(cData);
        setDeals(dData);
        setLoading(false);
    };

    const handleSaveContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContact) return;
        
        // Auto-assign random Lead Score if new
        if (selectedContact.lead_score === undefined) {
            selectedContact.lead_score = Math.floor(Math.random() * 40) + 10; // Default low score
        }

        if (selectedContact.id) {
            await updateContact(selectedContact);
            toast.show("Contact updated", "success");
        } else {
            await saveContact(selectedContact);
            toast.show("Contact created", "success");
        }
        setIsEditing(false);
        setSelectedContact(null);
        refreshData();
    };

    const handleDeleteContact = async (id: number) => {
        if (confirm("Delete this contact?")) {
            await deleteContact(id);
            refreshData();
            setSelectedContact(null);
            toast.show("Contact deleted", "info");
        }
    };

    const handleGenerateInsight = async () => {
        if (!selectedContact) return;
        setInsightLoading(true);
        try {
            const insight = await generateContactInsights(selectedContact);
            setAiInsight(insight);
        } catch (e) {
            toast.show("Failed to generate insight", "error");
        } finally {
            setInsightLoading(false);
        }
    };

    const handleEnrich = async () => {
        if (!selectedContact) return;
        setInsightLoading(true);
        try {
            const enriched = await enrichContactData(selectedContact);
            setAiInsight(enriched);
            // Auto update notes
            const updated = { ...selectedContact, notes: (selectedContact.notes || '') + '\n\nAI Enrichment:\n' + enriched, lead_score: Math.min(100, (selectedContact.lead_score || 50) + 20) };
            await updateContact(updated);
            setSelectedContact(updated);
            toast.show("Contact enriched & score updated!", "success");
        } catch(e) {
            toast.show("Enrichment failed", "error");
        } finally {
            setInsightLoading(false);
        }
    };

    // Deal Logic
    const handleSaveDeal = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedDeal) return;
        if(selectedDeal.id) await updateDeal(selectedDeal);
        else await saveDeal(selectedDeal);
        
        setIsEditingDeal(false);
        setSelectedDeal(null);
        refreshData();
        toast.show("Deal saved", "success");
    };

    const getPipelineVal = () => deals.reduce((acc, d) => acc + Number(d.value), 0);

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getLeadScoreColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-100 text-emerald-700';
        if (score >= 50) return 'bg-blue-100 text-blue-700';
        return 'bg-slate-100 text-slate-600';
    };

    const getProbabilityColor = (prob: number) => {
        if (prob >= 80) return 'text-emerald-600 font-bold';
        if (prob >= 50) return 'text-blue-600 font-semibold';
        return 'text-slate-500';
    };

    if (tableMissing) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><Icons.Database /></div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Database Setup Required</h3>
                <p className="text-slate-500 max-w-md mt-2">Please go to <strong>Settings -> Data Management</strong> and run the setup script to create the CRM tables.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Icons.Identification /> Intelligent CRM
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage relationships and track your pipeline.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-sm font-bold">
                        <button onClick={() => setView('contacts')} className={`px-3 py-1.5 rounded-md transition-all ${view === 'contacts' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>Contacts</button>
                        <button onClick={() => setView('deals')} className={`px-3 py-1.5 rounded-md transition-all ${view === 'deals' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>Pipeline</button>
                    </div>
                    <button 
                        onClick={() => {
                            if (view === 'contacts') {
                                setSelectedContact({ name: '', email: '', company: '', role: '', status: 'Lead', notes: '', lead_score: 10 });
                                setIsEditing(true);
                            } else {
                                setSelectedDeal({ name: '', value: 0, contact_id: 0, stage: 'Lead In', notes: '', probability: 20 });
                                setIsEditingDeal(true);
                            }
                        }}
                        className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Icons.Plus /> Add {view === 'contacts' ? 'Contact' : 'Deal'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                
                {/* CONTACTS VIEW */}
                {view === 'contacts' && (
                    <>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
                            <div className="relative flex-1">
                                <div className="absolute left-3 top-2.5 text-slate-400"><Icons.Search /></div>
                                <input 
                                    type="text" 
                                    placeholder="Search contacts..." 
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 font-bold">Name</th>
                                        <th className="p-4 font-bold">Role & Company</th>
                                        <th className="p-4 font-bold">Status</th>
                                        <th className="p-4 font-bold">Lead Score</th>
                                        <th className="p-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredContacts.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800 dark:text-slate-200">{c.name}</div>
                                                <div className="text-xs text-slate-400">{c.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-700 dark:text-slate-300">{c.role}</div>
                                                <div className="text-xs text-blue-600 dark:text-blue-400 font-bold">{c.company}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${c.status === 'Customer' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className={`h-full ${c.lead_score && c.lead_score > 70 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${c.lead_score || 0}%`}}></div>
                                                    </div>
                                                    <span className={`text-xs font-bold ${c.lead_score && c.lead_score > 70 ? 'text-emerald-600' : 'text-slate-500'}`}>{c.lead_score || 0}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => { setSelectedContact(c); setIsEditing(true); }} className="text-slate-400 hover:text-blue-600 p-2"><Icons.Pen /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* DEALS VIEW */}
                {view === 'deals' && (
                    <div className="flex-1 overflow-x-auto p-4 flex gap-4 min-w-0">
                        {['Lead In', 'Contact Made', 'Proposal Sent', 'Negotiation', 'Won'].map(stage => {
                            const stageDeals = deals.filter(d => d.stage === stage);
                            const total = stageDeals.reduce((acc, d) => acc + Number(d.value), 0);
                            return (
                                <div key={stage} className="w-72 flex-shrink-0 flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 h-full">
                                    <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-xl">
                                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase flex justify-between">
                                            {stage} 
                                            <span className="text-slate-400 text-xs">{stageDeals.length}</span>
                                        </h4>
                                        <p className="text-xs font-bold text-emerald-600 mt-1">${total.toLocaleString()}</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                        {stageDeals.map(deal => {
                                            const contact = contacts.find(c => c.id === deal.contact_id);
                                            return (
                                                <div key={deal.id} onClick={() => { setSelectedDeal(deal); setIsEditingDeal(true); }} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all group">
                                                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{deal.name}</div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">${Number(deal.value).toLocaleString()}</span>
                                                        {deal.probability && (
                                                            <span className={`text-[10px] ${getProbabilityColor(deal.probability)}`}>{deal.probability}% Prob.</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-2 mt-2 flex items-center gap-1">
                                                        <Icons.User /> {contact?.name || 'Unknown'}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* EDIT CONTACT MODAL */}
            {isEditing && selectedContact && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                {selectedContact.id ? 'Edit Contact' : 'New Contact'}
                            </h3>
                            <button onClick={() => { setIsEditing(false); setSelectedContact(null); }} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Form Side */}
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                            <input className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-600" value={selectedContact.name} onChange={e => setSelectedContact({...selectedContact, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company</label>
                                            <input className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-600" value={selectedContact.company} onChange={e => setSelectedContact({...selectedContact, company: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                                            <input className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-600" value={selectedContact.role} onChange={e => setSelectedContact({...selectedContact, role: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                            <select className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-600" value={selectedContact.status} onChange={e => setSelectedContact({...selectedContact, status: e.target.value as any})}>
                                                <option>Lead</option><option>Contacted</option><option>Customer</option><option>Archived</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex justify-between">
                                            <span>Lead Score (0-100)</span>
                                            <span className="text-blue-600">{selectedContact.lead_score || 0}</span>
                                        </label>
                                        <input 
                                            type="range" min="0" max="100" 
                                            className="w-full accent-blue-600"
                                            value={selectedContact.lead_score || 0}
                                            onChange={e => setSelectedContact({...selectedContact, lead_score: parseInt(e.target.value)})}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
                                        <textarea className="w-full p-2 border rounded h-32 bg-slate-50 dark:bg-slate-900 dark:border-slate-600" value={selectedContact.notes} onChange={e => setSelectedContact({...selectedContact, notes: e.target.value})} />
                                    </div>
                                    
                                    <div className="flex gap-3 pt-4">
                                        <button onClick={handleSaveContact} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Save</button>
                                        {selectedContact.id && <button onClick={() => handleDeleteContact(selectedContact.id!)} className="bg-red-50 text-red-600 font-bold px-4 rounded hover:bg-red-100">Delete</button>}
                                    </div>
                                </div>

                                {/* AI Side */}
                                <div className="md:w-1/3 bg-purple-50 dark:bg-slate-900/50 rounded-xl p-4 border border-purple-100 dark:border-slate-700">
                                    <h4 className="font-bold text-purple-800 dark:text-purple-400 mb-4 flex items-center gap-2"><Icons.Sparkles /> AI Actions</h4>
                                    
                                    <div className="flex flex-col gap-2 mb-4">
                                        <button onClick={handleEnrich} disabled={insightLoading} className="text-xs bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-600 p-2 rounded text-left hover:bg-purple-50 transition-colors">
                                            <strong>Smart Enrich</strong><br/><span className="text-slate-500">Find details on web</span>
                                        </button>
                                        <button onClick={handleGenerateInsight} disabled={insightLoading} className="text-xs bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-600 p-2 rounded text-left hover:bg-purple-50 transition-colors">
                                            <strong>Generate Strategy</strong><br/><span className="text-slate-500">How to close this deal</span>
                                        </button>
                                    </div>

                                    <div className="bg-white dark:bg-slate-800 rounded p-3 text-xs text-slate-600 dark:text-slate-300 min-h-[100px] max-h-[300px] overflow-y-auto">
                                        {insightLoading ? 'Thinking...' : aiInsight || <span className="italic text-slate-400">AI insights will appear here...</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT DEAL MODAL */}
            {isEditingDeal && selectedDeal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">{selectedDeal.id ? 'Edit Deal' : 'New Deal'}</h3>
                        <form onSubmit={handleSaveDeal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deal Name</label>
                                <input className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-600" value={selectedDeal.name} onChange={e => setSelectedDeal({...selectedDeal, name: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Value ($)</label>
                                    <input type="number" className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-600" value={selectedDeal.value} onChange={e => setSelectedDeal({...selectedDeal, value: Number(e.target.value)})} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stage</label>
                                    <select className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-600" value={selectedDeal.stage} onChange={e => setSelectedDeal({...selectedDeal, stage: e.target.value as any})}>
                                        <option>Lead In</option><option>Contact Made</option><option>Proposal Sent</option><option>Negotiation</option><option>Won</option><option>Lost</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex justify-between">
                                    <span>Probability</span>
                                    <span className={getProbabilityColor(selectedDeal.probability || 0)}>{selectedDeal.probability || 0}%</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="0" max="100" step="5"
                                    className="w-full accent-blue-600"
                                    value={selectedDeal.probability || 0}
                                    onChange={e => setSelectedDeal({...selectedDeal, probability: parseInt(e.target.value)})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Linked Contact</label>
                                <select className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-600" value={selectedDeal.contact_id || ''} onChange={e => setSelectedDeal({...selectedDeal, contact_id: Number(e.target.value)})}>
                                    <option value="">Select Contact...</option>
                                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                                </select>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2 rounded">Save Deal</button>
                                <button type="button" onClick={() => { setIsEditingDeal(false); setSelectedDeal(null); }} className="px-4 text-slate-500">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRM;
