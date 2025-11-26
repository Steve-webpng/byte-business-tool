
import React, { useState, useEffect } from 'react';
import { Contact, ContactStatus, Deal, DealStage } from '../types';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';
import { getContacts, saveContact, updateContact, deleteContact, testConnection, getDeals, saveDeal, updateDeal, deleteDeal } from '../services/supabaseService';
import { generateContactInsights, discoverLeads, suggestNextDealAction, generateFollowUpEmail } from '../services/geminiService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import MarkdownRenderer from './MarkdownRenderer';
import { format, parseISO, addDays, isPast, isToday } from 'date-fns';

const DEAL_STAGES: DealStage[] = ['Lead In', 'Contact Made', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const CRM: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'pipeline' | 'reminders' | 'form' | 'detail'>('list');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [formState, setFormState] = useState<Contact>({ name: '', email: '', company: '', role: '', status: 'Lead', notes: '', last_contacted: '', follow_up_date: '' });
    const [tableMissing, setTableMissing] = useState<'none' | 'contacts' | 'deals'>('none');
    const toast = useToast();
    
    // AI Features state
    const [aiInsight, setAiInsight] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [leadQuery, setLeadQuery] = useState('');
    const [discoveredLeads, setDiscoveredLeads] = useState<any[]>([]);
    const [generatedEmail, setGeneratedEmail] = useState<{text: string, contactId: number} | null>(null);

    const [dealForm, setDealForm] = useState<{show: boolean, contactId?: number}>({show: false});
    const [newDeal, setNewDeal] = useState<Partial<Deal>>({name: '', value: 0, stage: 'Lead In', notes: ''});
    
    const refreshData = async () => {
        setLoading(true);
        const hasContactsTable = await testConnection('contacts');
        const hasDealsTable = await testConnection('deals');

        if (!hasContactsTable) { setTableMissing('contacts'); setLoading(false); return; }
        if (!hasDealsTable) { setTableMissing('deals'); setLoading(false); return; }

        const contactsData = await getContacts();
        const dealsData = await getDeals();
        setContacts(contactsData);
        setDeals(dealsData);
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleSelectContact = (contact: Contact) => {
        setSelectedContact(contact);
        setView('detail');
        setAiInsight('');
    };

    const handleNewContact = () => {
        setIsNew(true);
        setFormState({ name: '', email: '', company: '', role: '', status: 'Lead', notes: '', last_contacted: '', follow_up_date: '' });
        setView('form');
    };

    const handleEditContact = (contact: Contact) => {
        setIsNew(false);
        setFormState(contact);
        setView('form');
    };

    const handleSaveContact = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = isNew ? await saveContact(formState) : await updateContact(formState);
        if (res) {
            await refreshData();
            toast.show(`Contact ${isNew ? 'created' : 'updated'}!`, 'success');
            setView('list');
        } else {
            toast.show("Failed to save contact.", 'error');
        }
    };

    const handleDeleteContact = async (id: number) => {
        if (window.confirm("Are you sure? This may also affect linked deals.")) {
            const success = await deleteContact(id);
            if (success) {
                await refreshData();
                toast.show("Contact deleted.", 'success');
                setView('list');
            } else {
                toast.show("Failed to delete contact.", 'error');
            }
        }
    };

    const handleSaveDeal = async () => {
        if(!newDeal.name || !newDeal.value || !dealForm.contactId) return;
        const dealToSave: Omit<Deal, 'id' | 'created_at'> = {
            name: newDeal.name,
            value: newDeal.value,
            contact_id: dealForm.contactId,
            stage: 'Lead In',
            notes: newDeal.notes || ''
        };
        const res = await saveDeal(dealToSave);
        if (res) {
            await refreshData();
            toast.show("Deal created!", 'success');
            setDealForm({show: false});
            setView('pipeline');
        } else {
            toast.show("Failed to create deal.", 'error');
        }
    };

    const handleMoveDeal = async (deal: Deal, newStage: DealStage) => {
        const updatedDeal = { ...deal, stage: newStage };
        const res = await updateDeal(updatedDeal);
        if (res) {
            await refreshData();
            toast.show(`Deal moved to ${newStage}`, 'info');
        } else {
            toast.show("Failed to update deal.", 'error');
        }
    };

    const handleGenerateInsights = async (contact: Contact) => {
        setAiLoading(true);
        setAiInsight('');
        try {
            const insight = await generateContactInsights(contact);
            setAiInsight(insight);
        } catch (e) {
            toast.show("Failed to get AI insights.", "error");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSuggestNextStep = async (deal: Deal) => {
        const contact = contacts.find(c => c.id === deal.contact_id);
        if (!contact) return;
        setAiLoading(true);
        try {
            const suggestion = await suggestNextDealAction(deal, contact);
            toast.show(suggestion, 'info');
        } catch (e) {
            toast.show("Failed to get suggestion.", "error");
        } finally {
            setAiLoading(false);
        }
    };
    
    const handleDiscoverLeads = async () => {
        if(!leadQuery) return;
        setAiLoading(true);
        setDiscoveredLeads([]);
        try {
            const leads = await discoverLeads(leadQuery);
            setDiscoveredLeads(leads);
        } catch (e) {
            toast.show("Failed to discover leads.", "error");
        } finally {
            setAiLoading(false);
        }
    };

    const handleDraftFollowUp = async (contact: Contact) => {
        setAiLoading(true);
        try {
            const profile = getProfile();
            const context = formatProfileForPrompt(profile);
            const emailBody = await generateFollowUpEmail(contact, context);
            setGeneratedEmail({ text: emailBody, contactId: contact.id! });
        } catch (e) {
            toast.show("Failed to generate email.", "error");
        } finally {
            setAiLoading(false);
        }
    };

    const getFollowUpStatus = (dateStr?: string) => {
        if (!dateStr) return 'none';
        const date = parseISO(dateStr);
        if (isToday(date)) return 'today';
        if (isPast(date)) return 'overdue';
        return 'upcoming';
    };

    if (loading) return <div>Loading...</div>;

    if (tableMissing !== 'none') return (
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg">
            <h3 className="font-bold text-red-700 dark:text-red-300">Database Table Missing</h3>
            <p className="text-red-600 dark:text-red-400">The '{tableMissing}' table was not found. Please visit the Database settings and run the setup script.</p>
        </div>
    );

    const renderHeader = () => (
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-end gap-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">CRM</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage contacts, pipeline, and follow-ups.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                    <button onClick={() => setView('list')} className={`px-3 py-2 text-sm font-bold rounded-md ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>Contacts</button>
                    <button onClick={() => setView('pipeline')} className={`px-3 py-2 text-sm font-bold rounded-md ${view === 'pipeline' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>Pipeline</button>
                    <button onClick={() => setView('reminders')} className={`px-3 py-2 text-sm font-bold rounded-md flex items-center gap-1 ${view === 'reminders' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>
                        <Icons.Clock /> Reminders
                    </button>
                </div>
                <button onClick={handleNewContact} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                    <Icons.Plus /> New
                </button>
            </div>
        </div>
    );

    const stageColors: Record<DealStage, string> = {
        'Lead In': 'bg-slate-200 dark:bg-slate-700',
        'Contact Made': 'bg-blue-200 dark:bg-blue-800',
        'Proposal Sent': 'bg-yellow-200 dark:bg-yellow-800',
        'Negotiation': 'bg-orange-200 dark:bg-orange-800',
        'Won': 'bg-emerald-200 dark:bg-emerald-800',
        'Lost': 'bg-red-200 dark:bg-red-800',
    };
    
    // --- Main List View ---
    if (view === 'list') return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            {renderHeader()}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                 <table className="w-full text-left">
                    <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Name</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Company</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Status</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Follow Up</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map(contact => {
                            const status = getFollowUpStatus(contact.follow_up_date);
                            return (
                                <tr key={contact.id} onClick={() => handleSelectContact(contact)} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer group">
                                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{contact.name}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">{contact.company}</td>
                                    <td className="p-4"><span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">{contact.status}</span></td>
                                    <td className="p-4">
                                        {contact.follow_up_date && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit
                                                ${status === 'overdue' ? 'bg-red-100 text-red-600' : status === 'today' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {status === 'overdue' && <Icons.X />}
                                                {new Date(contact.follow_up_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                 </table>
            </div>
        </div>
    );

    // --- Reminders View ---
    if (view === 'reminders') {
        const pendingContacts = contacts.filter(c => c.follow_up_date && !isPast(addDays(parseISO(c.follow_up_date), -30))); // Just a filter
        const overdue = contacts.filter(c => getFollowUpStatus(c.follow_up_date) === 'overdue');
        const today = contacts.filter(c => getFollowUpStatus(c.follow_up_date) === 'today');
        const upcoming = contacts.filter(c => getFollowUpStatus(c.follow_up_date) === 'upcoming').sort((a, b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime());

        return (
            <div className="h-full flex flex-col max-w-7xl mx-auto">
                {renderHeader()}
                
                {generatedEmail && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">AI Drafted Email</h3>
                                <button onClick={() => setGeneratedEmail(null)} className="text-slate-400"><Icons.X /></button>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4 max-h-60 overflow-y-auto">
                                <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{generatedEmail.text}</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { navigator.clipboard.writeText(generatedEmail.text); toast.show("Copied to clipboard", "success"); setGeneratedEmail(null); }} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">Copy Text</button>
                                <button onClick={() => setGeneratedEmail(null)} className="flex-1 border border-slate-200 dark:border-slate-700 py-2 rounded-lg font-bold">Close</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-6">
                    {(overdue.length > 0 || today.length > 0) && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Needs Attention</h3>
                            {[...overdue, ...today].map(c => (
                                <div key={c.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-l-4 border-slate-200 dark:border-slate-700 border-l-red-500 shadow-sm flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{c.name}</span>
                                            <span className="text-xs text-slate-500">{c.company}</span>
                                        </div>
                                        <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                                            <Icons.Clock /> Follow Up: {new Date(c.follow_up_date!).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSelectContact(c)} className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200">View</button>
                                        <button onClick={() => handleDraftFollowUp(c)} className="text-xs font-bold text-white bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1">
                                            {aiLoading ? 'Drafting...' : <><Icons.Sparkles /> AI Draft Email</>}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Upcoming</h3>
                        <div className="space-y-2">
                            {upcoming.map(c => (
                                <div key={c.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-all flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                                        <span className="text-xs text-slate-500 ml-2">{c.company}</span>
                                        <p className="text-xs text-slate-400 mt-1">Due: {new Date(c.follow_up_date!).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => handleSelectContact(c)} className="p-2 text-slate-400 hover:text-blue-600"><Icons.ArrowRight /></button>
                                </div>
                            ))}
                            {upcoming.length === 0 && <p className="text-slate-400 text-sm italic">No upcoming reminders.</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Pipeline View ---
    if (view === 'pipeline') return (
        <div className="h-full flex flex-col max-w-full mx-auto">
            {renderHeader()}
            <div className="flex-1 min-h-0 flex gap-6 overflow-x-auto pb-4">
                {DEAL_STAGES.map(stage => {
                    const stageDeals = deals.filter(d => d.stage === stage);
                    const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
                    return (
                        <div key={stage} className="w-80 flex-shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden h-full border border-slate-200 dark:border-slate-700">
                            <div className="p-4 font-bold text-sm border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${stageColors[stage]}`}></div>
                                    <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wide">{stage}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">${totalValue.toLocaleString()}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {stageDeals.map(deal => {
                                    const contact = contacts.find(c => c.id === deal.contact_id);
                                    return (
                                        <div key={deal.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{deal.name}</p>
                                                <button onClick={() => handleSuggestNextStep(deal)} disabled={aiLoading} className="text-purple-500 hover:bg-purple-100 p-1 rounded-full"><Icons.Sparkles /></button>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{contact?.name || 'No contact'}</p>
                                            <p className="text-lg font-bold text-emerald-600 mt-2">${deal.value.toLocaleString()}</p>
                                            {/* Move buttons */}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
    // --- Form View ---
    if (view === 'form') return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => setView('list')} className="mb-4 text-slate-500">&larr; Back to list</button>
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">{isNew ? 'New Contact' : 'Edit Contact'}</h2>
            <form onSubmit={handleSaveContact} className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <div className="grid grid-cols-2 gap-4">
                    <input name="name" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} placeholder="Name" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" required/>
                    <input name="email" value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} placeholder="Email" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <input name="company" value={formState.company} onChange={e => setFormState({...formState, company: e.target.value})} placeholder="Company" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                    <input name="role" value={formState.role} onChange={e => setFormState({...formState, role: e.target.value})} placeholder="Role" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                 </div>
                 <select name="status" value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as ContactStatus})} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                     <option>Lead</option><option>Contacted</option><option>Customer</option><option>Archived</option>
                 </select>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Last Contacted</label>
                         <input type="date" value={formState.last_contacted || ''} onChange={e => setFormState({...formState, last_contacted: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"/>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Next Follow Up</label>
                         <input type="date" value={formState.follow_up_date || ''} onChange={e => setFormState({...formState, follow_up_date: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"/>
                     </div>
                 </div>
                 <textarea name="notes" value={formState.notes} onChange={e => setFormState({...formState, notes: e.target.value})} placeholder="Notes..." className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-32"/>
                 <button type="submit" className="bg-blue-600 text-white font-bold p-3 rounded-lg w-full hover:bg-blue-700 transition-colors">Save Contact</button>
            </form>
        </div>
    );
    
    // --- Detail View ---
    if (view === 'detail' && selectedContact) return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => setView('list')} className="mb-4 text-slate-500">&larr; Back to list</button>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">{selectedContact.name}</h2>
                            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-300 font-bold">{selectedContact.status}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{selectedContact.role} at {selectedContact.company}</p>
                        <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline mt-1 block">{selectedContact.email}</a>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setDealForm({show: true, contactId: selectedContact.id})} className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">New Deal</button>
                        <button onClick={() => handleEditContact(selectedContact)} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600">Edit</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div>
                        <span className="text-xs text-slate-400 uppercase font-bold block">Last Interaction</span>
                        <span className="text-sm font-medium">{selectedContact.last_contacted ? new Date(selectedContact.last_contacted).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-400 uppercase font-bold block">Next Follow-up</span>
                        <span className={`text-sm font-medium ${getFollowUpStatus(selectedContact.follow_up_date) === 'overdue' ? 'text-red-500' : ''}`}>
                            {selectedContact.follow_up_date ? new Date(selectedContact.follow_up_date).toLocaleDateString() : 'None set'}
                        </span>
                    </div>
                </div>

                <div className="mt-6 border-t dark:border-slate-700 pt-6">
                    <h3 className="font-bold text-sm uppercase text-slate-500 dark:text-slate-400 mb-2">Notes</h3>
                    <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{selectedContact.notes || 'No notes for this contact.'}</p>
                </div>

                <div className="mt-6 border-t dark:border-slate-700 pt-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm uppercase text-slate-500 dark:text-slate-400">AI Assistant</h3>
                        <div className="flex gap-2">
                            <button onClick={() => handleDraftFollowUp(selectedContact)} disabled={aiLoading} className="bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-lg text-sm border border-blue-100 hover:bg-blue-100">
                                {aiLoading ? 'Thinking...' : 'Draft Follow-up Email'}
                            </button>
                            <button onClick={() => handleGenerateInsights(selectedContact)} disabled={aiLoading} className="bg-purple-50 text-purple-700 font-bold px-4 py-2 rounded-lg text-sm border border-purple-100 hover:bg-purple-100">
                                Strategy Ideas
                            </button>
                        </div>
                    </div>
                    
                    {generatedEmail && generatedEmail.contactId === selectedContact.id && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="text-xs font-bold text-blue-600 mb-2">Draft Email</h4>
                            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{generatedEmail.text}</p>
                            <button onClick={() => { navigator.clipboard.writeText(generatedEmail.text); toast.show("Copied!", "success"); }} className="mt-2 text-xs text-blue-600 font-bold hover:underline">Copy to Clipboard</button>
                        </div>
                    )}

                    {aiInsight && <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"><MarkdownRenderer content={aiInsight} /></div>}
                </div>
            </div>
            {dealForm.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg max-w-sm w-full space-y-4 shadow-xl">
                        <h3 className="font-bold text-lg">New Deal for {selectedContact.name}</h3>
                        <input type="text" placeholder="Deal Name (e.g., Q3 Subscription)" value={newDeal.name} onChange={e => setNewDeal({...newDeal, name: e.target.value})} className="w-full p-2 border rounded"/>
                        <input type="number" placeholder="Value ($)" value={newDeal.value} onChange={e => setNewDeal({...newDeal, value: Number(e.target.value)})} className="w-full p-2 border rounded"/>
                        <textarea placeholder="Notes..." value={newDeal.notes} onChange={e => setNewDeal({...newDeal, notes: e.target.value})} className="w-full p-2 border rounded h-24"/>
                        <div className="flex gap-2">
                            <button onClick={() => setDealForm({show: false})} className="flex-1 p-2 border rounded font-bold">Cancel</button>
                            <button onClick={handleSaveDeal} className="flex-1 p-2 bg-blue-600 text-white rounded font-bold">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return null;
};

export default CRM;
