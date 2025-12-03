
import React, { useState } from 'react';
import { Icons } from '../constants';
import { discoverLeads, runGenericTool } from '../services/geminiService';
import { saveContact } from '../services/supabaseService';
import { useToast } from './ToastContainer';
import { Prospect, AppTool } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

const Prospector: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'outbound' | 'inbound'>('outbound');
    const [query, setQuery] = useState('');
    const [platform, setPlatform] = useState('LinkedIn');
    const [leads, setLeads] = useState<Prospect[]>([]);
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const { navigate } = useNavigation();
    
    // Capture Form State
    const [formName, setFormName] = useState('Contact Us');
    const [capturedLeads, setCapturedLeads] = useState<Prospect[]>([]);
    
    const toast = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        setSelectedLeads([]);
        try {
            const results = await discoverLeads(query, platform);
            setLeads(results);
            if (results.length === 0) toast.show("No leads found.", "info");
        } catch (e) {
            toast.show("Search failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectLead = (index: number) => {
        if (selectedLeads.includes(index)) {
            setSelectedLeads(selectedLeads.filter(i => i !== index));
        } else {
            setSelectedLeads([...selectedLeads, index]);
        }
    };

    const handleBulkAddToCRM = async () => {
        const leadsToAdd = selectedLeads.map(i => leads[i]);
        if (leadsToAdd.length === 0) return;

        let count = 0;
        for (const prospect of leadsToAdd) {
            await saveContact({
                name: prospect.name,
                role: prospect.role,
                company: prospect.company,
                email: prospect.email || '',
                phone: prospect.phone || '',
                location: prospect.location || '',
                status: 'Lead',
                notes: `Added via Prospector (${platform})`,
                workspace_id: '' // Handled by service
            });
            count++;
        }
        
        // Update local state to show exported
        const newLeads = [...leads];
        selectedLeads.forEach(i => newLeads[i].status = 'Exported');
        setLeads(newLeads);
        setSelectedLeads([]);
        
        toast.show(`${count} leads added to CRM`, "success");
    };

    const handleDraftOutreach = async () => {
        const leadsToEmail = selectedLeads.map(i => leads[i]);
        if (leadsToEmail.length === 0) return;

        toast.show("Generating mail merge template...", "info");
        
        // Generate a context string for the AI to write an email
        const sampleLead = leadsToEmail[0];
        const context = `Target Audience: ${sampleLead.role} at ${sampleLead.company}. Platform found: ${platform}. Count: ${leadsToEmail.length}`;
        const prompt = `Write a cold outreach email template for these leads. 
        Use variables like {{FirstName}} and {{Company}} for Mail Merge.
        Keep it short, professional, and mention I found them via ${platform}.`;

        try {
            const template = await runGenericTool(prompt, "You are an expert copywriter.");
            
            // Navigate to Content/Email tool with this data
            // Since we don't have a direct "pass data" to EmailMarketing component via props in the router easily without context,
            // We will use the ContentGenerator as the bridge or just copy to clipboard for now.
            // Better: Navigate to Content Tool and pre-fill.
            
            // For now, let's copy to clipboard and show success, or navigate to Content tool
            // navigate(AppTool.CONTENT, { ... } ); // If we updated navigation context to support data passing
            
            // Simulating navigation with data via localStorage or Context would be ideal.
            // For this implementation, we will use the existing 'onWorkflowSend' pattern if available, 
            // but here we are inside the component. We'll simply copy to clipboard or show in a modal.
            
            // Let's assume we want to push this to the Content Generator.
            // We can't easily push to a specific component without a global store for "workflow draft".
            // Let's use the clipboard as a fallback for the "Mail Merge Automation" experience.
            
            const fullOutput = `*** MAIL MERGE TEMPLATE ***\n\n${template}\n\n*** RECIPIENT LIST ***\n${leadsToEmail.map(l => `${l.name} <${l.email}>`).join('\n')}`;
            
            // In a real app, this would route to <EmailMarketing> with pre-filled state.
            // Here we will use a workaround to show we "integrated" it.
            navigator.clipboard.writeText(fullOutput);
            toast.show("Outreach template copied to clipboard! Paste in Email Marketing.", "success");
            navigate(AppTool.EMAIL_MARKETING); // Go there
            
        } catch (e) {
            toast.show("Failed to draft outreach.", "error");
        }
    };

    const handleExportCSV = () => {
        const leadsToExport = selectedLeads.length > 0 ? selectedLeads.map(i => leads[i]) : leads;
        const headers = ["Name", "Role", "Company", "Email", "Phone", "Location", "Platform", "Profile URL"];
        const rows = leadsToExport.map(l => [
            l.name, l.role, l.company, l.email || '', l.phone || '', l.location || '', l.socialPlatform || '', l.profileUrl || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(c => `"${c}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `leads_${platform}_${Date.now()}.csv`;
        link.click();
        toast.show("CSV Downloaded", "success");
    };

    const simulateCapture = () => {
        const dummyNames = ["Jane Doe", "John Smith", "Alice Wonder", "Bob Builder"];
        const randomName = dummyNames[Math.floor(Math.random() * dummyNames.length)];
        const newLead: Prospect = {
            name: randomName,
            email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
            role: "Interested Lead",
            company: "Unknown",
            location: "New York, USA",
            phone: "+1 555-0123",
            confidence: 100,
            status: 'New'
        };
        setCapturedLeads([newLead, ...capturedLeads]);
        // Auto-add logic if needed
        toast.show("New lead captured from form!", "success");
    };

    return (
        <div className="h-full flex flex-col max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Icons.Telescope /> Lead Prospector
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Scrape leads from social media and automate outreach.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-bold">
                    <button 
                        onClick={() => setActiveTab('outbound')}
                        className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${activeTab === 'outbound' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Icons.Search /> AI Scraping
                    </button>
                    <button 
                        onClick={() => setActiveTab('inbound')}
                        className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${activeTab === 'inbound' ? 'bg-white dark:bg-slate-700 shadow text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Icons.ClipboardText /> Capture Forms
                    </button>
                </div>
            </div>

            {activeTab === 'outbound' ? (
                <>
                    <form onSubmit={handleSearch} className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/4">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Source Platform</label>
                                <select 
                                    value={platform} 
                                    onChange={e => setPlatform(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none text-sm"
                                >
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Twitter">X (Twitter)</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="TikTok">TikTok</option>
                                    <option value="Google Maps">Google Maps</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Audience</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        placeholder={`e.g. CEO of SaaS companies in London...`}
                                        className="w-full p-3 pl-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none"
                                    />
                                    <div className="absolute left-3 top-3 text-slate-400"><Icons.Search /></div>
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button 
                                    disabled={loading || !query}
                                    className="h-[46px] bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-bold transition-colors disabled:opacity-50 w-full md:w-auto"
                                >
                                    {loading ? 'Scraping...' : 'Find Leads'}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={leads.length > 0 && selectedLeads.length === leads.length}
                                    onChange={(e) => setSelectedLeads(e.target.checked ? leads.map((_, i) => i) : [])}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                    {selectedLeads.length > 0 ? `${selectedLeads.length} Selected` : `Results (${leads.length})`}
                                </span>
                            </div>
                            
                            {leads.length > 0 && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleExportCSV}
                                        className="text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Export CSV
                                    </button>
                                    {selectedLeads.length > 0 && (
                                        <>
                                            <button 
                                                onClick={handleBulkAddToCRM}
                                                className="text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                            >
                                                <Icons.Plus /> Add to CRM
                                            </button>
                                            <button 
                                                onClick={handleDraftOutreach}
                                                className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                                            >
                                                <Icons.Mail /> Draft Outreach
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {leads.length === 0 && !loading && (
                                <div className="text-center text-slate-400 py-12">
                                    <div className="mb-2 text-4xl">🕵️</div>
                                    <p>Select a platform and enter a query to extract leads.</p>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 gap-3">
                                {leads.map((lead, idx) => (
                                    <div key={idx} className={`flex items-start justify-between p-4 border rounded-lg hover:shadow-md transition-all group ${selectedLeads.includes(idx) ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                        <div className="flex items-start gap-3">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedLeads.includes(idx)}
                                                onChange={() => toggleSelectLead(idx)}
                                                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg flex items-center gap-2">
                                                    {lead.name}
                                                    {lead.status === 'Exported' && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Saved</span>}
                                                </h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">{lead.role} at <span className="text-blue-600">{lead.company}</span></p>
                                                
                                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                    {lead.location && (
                                                        <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded">
                                                            <Icons.Globe /> {lead.location}
                                                        </span>
                                                    )}
                                                    {lead.email && (
                                                        <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded font-mono text-emerald-600 dark:text-emerald-400 select-all">
                                                            @ {lead.email}
                                                        </span>
                                                    )}
                                                    {lead.socialPlatform && (
                                                        <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded text-blue-500">
                                                            {lead.socialPlatform}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0 overflow-y-auto">
                    {/* Form Builder */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <Icons.Pen /> Inbound Form Builder
                        </h3>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Form Name</label>
                            <input 
                                className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-700" 
                                value={formName}
                                onChange={e => setFormName(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center relative">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md w-full max-w-sm border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-center mb-4 text-slate-800 dark:text-slate-200">{formName}</h4>
                                <div className="space-y-3">
                                    <input disabled placeholder="Full Name" className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
                                    <input disabled placeholder="Email Address" className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
                                    <input disabled placeholder="Phone Number" className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
                                    <button disabled className="w-full bg-blue-600 text-white text-sm font-bold py-2 rounded">Submit</button>
                                </div>
                            </div>
                            <div className="mt-4 text-xs text-slate-400">Preview Mode</div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                Copy Embed Code
                            </button>
                            <button 
                                onClick={simulateCapture}
                                className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-lg text-sm hover:bg-purple-700 transition-colors shadow-md"
                            >
                                Simulate Submission
                            </button>
                        </div>
                    </div>

                    {/* Captured Leads */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <Icons.Database /> Recent Inbound Leads
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {capturedLeads.length === 0 && (
                                <div className="text-center text-slate-400 py-12 italic">
                                    No form submissions yet.
                                </div>
                            )}
                            {capturedLeads.map((lead, i) => (
                                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center animate-fade-in">
                                    <div>
                                        <div className="font-bold text-slate-700 dark:text-slate-300">{lead.name}</div>
                                        <div className="text-xs text-slate-500">{lead.email} • {lead.location}</div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">Captured</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Prospector;
