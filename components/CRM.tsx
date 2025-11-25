import React, { useState, useEffect } from 'react';
import { Contact, ContactStatus } from '../types';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';
import { getContacts, saveContact, updateContact, deleteContact, testConnection } from '../services/supabaseService';
import { generateContactInsights, discoverLeads } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const CRM: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [formState, setFormState] = useState<Contact>({ name: '', email: '', company: '', role: '', status: 'Lead', notes: '' });
    const [tableMissing, setTableMissing] = useState(false);
    const toast = useToast();
    
    // AI Features state
    const [aiInsight, setAiInsight] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [leadQuery, setLeadQuery] = useState('');
    const [discoveredLeads, setDiscoveredLeads] = useState<any[]>([]);

    useEffect(() => {
        const checkAndLoad = async () => {
            const hasTable = await testConnection('contacts');
            if (!hasTable) {
                setTableMissing(true);
                setLoading(false);
                return;
            }
            const data = await getContacts();
            setContacts(data);
            setLoading(false);
        };
        checkAndLoad();
    }, []);

    const handleSelectContact = (contact: Contact) => {
        setSelectedContact(contact);
        setView('detail');
        setAiInsight('');
    };

    const handleNewContact = () => {
        setIsNew(true);
        setFormState({ name: '', email: '', company: '', role: '', status: 'Lead', notes: '' });
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
            const data = await getContacts();
            setContacts(data);
            toast.show(`Contact ${isNew ? 'created' : 'updated'}!`, 'success');
            setView('list');
        } else {
            toast.show("Failed to save contact.", 'error');
        }
    };

    const handleDeleteContact = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this contact?")) {
            const success = await deleteContact(id);
            if (success) {
                setContacts(contacts.filter(c => c.id !== id));
                toast.show("Contact deleted.", 'success');
                setView('list');
            } else {
                toast.show("Failed to delete contact.", 'error');
            }
        }
    };

    const handleGenerateInsights = async () => {
        if (!selectedContact) return;
        setAiLoading(true);
        setAiInsight('');
        try {
            const insight = await generateContactInsights(selectedContact);
            setAiInsight(insight);
        } catch (e) {
            toast.show("Failed to get AI insights.", "error");
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

    if (loading) return <div>Loading...</div>;

    if (tableMissing) return (
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-bold text-red-700">Database Table Missing</h3>
            <p className="text-red-600">The 'contacts' table was not found. Please visit the Database settings and run the setup script.</p>
        </div>
    );
    
    // --- Main List View ---
    if (view === 'list') return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Contacts (CRM)</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage your business relationships.</p>
                </div>
                <button onClick={handleNewContact} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                    <Icons.Plus /> New Contact
                </button>
            </div>

            {/* AI Lead Discovery */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex gap-4">
                    <input type="text" value={leadQuery} onChange={e => setLeadQuery(e.target.value)} placeholder="e.g., 'Find VCs investing in SaaS in NYC'" className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg outline-none"/>
                    <button onClick={handleDiscoverLeads} disabled={aiLoading} className="bg-purple-600 text-white font-bold px-4 py-2 rounded-lg">
                        {aiLoading ? 'Searching...' : 'Discover Leads'}
                    </button>
                </div>
                {discoveredLeads.length > 0 && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h4 className="font-bold text-sm mb-2">Discovered Leads</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {discoveredLeads.map((lead, i) => (
                                <div key={i} className="text-xs p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                                    <p className="font-bold">{lead.name}</p>
                                    <p>{lead.role} at {lead.company}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                 <table className="w-full text-left">
                    <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Name</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Company</th>
                            <th className="p-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map(contact => (
                            <tr key={contact.id} onClick={() => handleSelectContact(contact)} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{contact.name}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">{contact.company}</td>
                                <td className="p-4"><span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{contact.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </div>
    );
    
    // --- Form View ---
    if (view === 'form') return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => setView('list')} className="mb-4 text-slate-500">&larr; Back to list</button>
            <h2 className="text-2xl font-bold mb-4">{isNew ? 'New Contact' : 'Edit Contact'}</h2>
            <form onSubmit={handleSaveContact} className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                 <input name="name" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} placeholder="Name" className="w-full p-2 border rounded" required/>
                 <input name="email" value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} placeholder="Email" className="w-full p-2 border rounded" />
                 <input name="company" value={formState.company} onChange={e => setFormState({...formState, company: e.target.value})} placeholder="Company" className="w-full p-2 border rounded" />
                 <input name="role" value={formState.role} onChange={e => setFormState({...formState, role: e.target.value})} placeholder="Role" className="w-full p-2 border rounded" />
                 <select name="status" value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as ContactStatus})} className="w-full p-2 border rounded bg-white dark:bg-slate-700">
                     <option>Lead</option><option>Contacted</option><option>Customer</option><option>Archived</option>
                 </select>
                 <textarea name="notes" value={formState.notes} onChange={e => setFormState({...formState, notes: e.target.value})} placeholder="Notes..." className="w-full p-2 border rounded h-32"/>
                 <button type="submit" className="bg-blue-600 text-white font-bold p-2 rounded w-full">Save Contact</button>
            </form>
        </div>
    );
    
    // --- Detail View ---
    if (view === 'detail' && selectedContact) return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => setView('list')} className="mb-4 text-slate-500">&larr; Back to list</button>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold">{selectedContact.name}</h2>
                        <p className="text-slate-500">{selectedContact.role} at {selectedContact.company}</p>
                        <a href={`mailto:${selectedContact.email}`} className="text-blue-600">{selectedContact.email}</a>
                    </div>
                    <div>
                        <button onClick={() => handleEditContact(selectedContact)} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-lg mr-2">Edit</button>
                        <button onClick={() => handleDeleteContact(selectedContact.id!)} className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-lg">Delete</button>
                    </div>
                </div>
                <div className="mt-6 border-t pt-6">
                    <h3 className="font-bold text-sm uppercase text-slate-500 dark:text-slate-400 mb-2">Notes</h3>
                    <p className="whitespace-pre-wrap">{selectedContact.notes || 'No notes for this contact.'}</p>
                </div>

                <div className="mt-6 border-t pt-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm uppercase text-slate-500 dark:text-slate-400">AI Outreach Assistant</h3>
                        <button onClick={handleGenerateInsights} disabled={aiLoading} className="bg-purple-100 text-purple-700 font-bold px-4 py-2 rounded-lg text-sm">
                            {aiLoading ? 'Generating...' : 'Generate Ideas'}
                        </button>
                    </div>
                    {aiInsight && <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"><MarkdownRenderer content={aiInsight} /></div>}
                </div>
            </div>
        </div>
    );

    return null;
};

export default CRM;