
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { Contact, Invoice, InvoiceItem } from '../types';
import { getContacts, saveInvoice, getInvoices, updateInvoice, deleteInvoice, testConnection } from '../services/supabaseService';
import { useToast } from './ToastContainer';
import { format, addDays } from 'date-fns';

const InvoiceBuilder: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [loading, setLoading] = useState(true);
    const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
    const [tableMissing, setTableMissing] = useState(false);
    const toast = useToast();

    // Initial Load
    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = async () => {
        setLoading(true);
        const hasTable = await testConnection('invoices');
        if (!hasTable) {
            setTableMissing(true);
            setLoading(false);
            return;
        }
        const [inv, cnt] = await Promise.all([getInvoices(), getContacts()]);
        setInvoices(inv);
        setContacts(cnt);
        setLoading(false);
    };

    // Create New Invoice
    const handleNewInvoice = () => {
        const newItem: InvoiceItem = { id: Date.now().toString(), description: 'Consulting Services', quantity: 1, unitPrice: 100 };
        const newInv: Invoice = {
            invoice_number: `INV-${Date.now().toString().slice(-6)}`,
            contact_id: 0,
            date: format(new Date(), 'yyyy-MM-dd'),
            due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
            items: [newItem],
            status: 'Draft',
            notes: 'Thank you for your business!'
        };
        setCurrentInvoice(newInv);
        setView('editor');
    };

    const handleEditInvoice = (inv: Invoice) => {
        setCurrentInvoice(inv);
        setView('editor');
    };

    const handleDeleteInvoice = async (id: number) => {
        if (confirm("Delete this invoice?")) {
            await deleteInvoice(id);
            await refreshData();
            toast.show("Invoice deleted", "info");
        }
    };

    // Form Handlers
    const updateField = (field: keyof Invoice, value: any) => {
        if (!currentInvoice) return;
        setCurrentInvoice({ ...currentInvoice, [field]: value });
    };

    const updateItem = (idx: number, field: keyof InvoiceItem, value: any) => {
        if (!currentInvoice) return;
        const newItems = [...currentInvoice.items];
        newItems[idx] = { ...newItems[idx], [field]: value };
        setCurrentInvoice({ ...currentInvoice, items: newItems });
    };

    const addItem = () => {
        if (!currentInvoice) return;
        const newItem: InvoiceItem = { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 };
        setCurrentInvoice({ ...currentInvoice, items: [...currentInvoice.items, newItem] });
    };

    const removeItem = (idx: number) => {
        if (!currentInvoice) return;
        const newItems = currentInvoice.items.filter((_, i) => i !== idx);
        setCurrentInvoice({ ...currentInvoice, items: newItems });
    };

    const calculateTotal = (inv: Invoice) => {
        return inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const handleSave = async () => {
        if (!currentInvoice || !currentInvoice.contact_id) {
            toast.show("Please select a client.", "error");
            return;
        }
        if (currentInvoice.id) {
            await updateInvoice(currentInvoice);
        } else {
            await saveInvoice(currentInvoice);
        }
        await refreshData();
        setView('list');
        toast.show("Invoice saved!", "success");
    };

    const handlePrint = () => {
        window.print();
    };

    // Render helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (tableMissing) return (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
            <h3 className="font-bold">Table Missing</h3>
            <p className="text-sm">Please go to Database Management and run the setup script to create the 'invoices' table.</p>
        </div>
    );

    // --- LIST VIEW ---
    if (view === 'list') return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Invoices</h2>
                    <p className="text-slate-500 dark:text-slate-400">Track billings and payments.</p>
                </div>
                <button onClick={handleNewInvoice} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors">
                    <Icons.Plus /> New Invoice
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {invoices.length === 0 && !loading && (
                        <div className="text-center p-12 text-slate-400">No invoices found. Create one to get started.</div>
                    )}
                    {invoices.map(inv => {
                        const contact = contacts.find(c => c.id === inv.contact_id);
                        const total = calculateTotal(inv);
                        return (
                            <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400">
                                        <Icons.DocumentCurrency />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{inv.invoice_number}</h4>
                                        <p className="text-xs text-slate-500">{contact?.name || 'Unknown Client'} • {inv.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">${total.toFixed(2)}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(inv.status)}`}>{inv.status}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditInvoice(inv)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Icons.Pen /></button>
                                        <button onClick={() => handleDeleteInvoice(inv.id!)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Icons.Trash /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // --- EDITOR VIEW ---
    if (!currentInvoice) return null;
    
    const client = contacts.find(c => c.id === currentInvoice.contact_id);
    const total = calculateTotal(currentInvoice);

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto print:max-w-none">
            {/* Toolbar (Hidden on print) */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-bold"><Icons.ArrowLeft /> Invoices</button>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm hover:bg-slate-200">Print / PDF</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-sm flex items-center gap-2"><Icons.Save /> Save Invoice</button>
                </div>
            </div>

            {/* Invoice Paper */}
            <div className="bg-white text-slate-900 p-12 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 flex-1 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h1>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-bold">#</span>
                            <input 
                                type="text" 
                                value={currentInvoice.invoice_number} 
                                onChange={e => updateField('invoice_number', e.target.value)}
                                className="border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-32 bg-transparent"
                            />
                        </div>
                    </div>
                    <div className="text-right">
                        {/* Placeholder Logo */}
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center ml-auto mb-2">
                            <span className="font-bold text-2xl text-slate-300">Logo</span>
                        </div>
                        <p className="font-bold text-lg">My Business Name</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Bill To</label>
                        <select 
                            value={currentInvoice.contact_id} 
                            onChange={e => updateField('contact_id', Number(e.target.value))}
                            className="w-full p-2 border border-slate-200 rounded bg-slate-50 text-sm outline-none focus:border-blue-500 print:hidden"
                        >
                            <option value={0}>Select Client...</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name} - {c.company}</option>)}
                        </select>
                        {client && (
                            <div className="mt-2 text-sm leading-relaxed">
                                <p className="font-bold">{client.name}</p>
                                <p>{client.company}</p>
                                <p>{client.email}</p>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-right">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date</label>
                            <input type="date" value={currentInvoice.date} onChange={e => updateField('date', e.target.value)} className="text-sm text-right w-full outline-none bg-transparent" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Due Date</label>
                            <input type="date" value={currentInvoice.due_date} onChange={e => updateField('due_date', e.target.value)} className="text-sm text-right w-full outline-none bg-transparent" />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                             <select value={currentInvoice.status} onChange={e => updateField('status', e.target.value)} className="text-sm text-right w-full outline-none bg-transparent font-bold text-slate-700 cursor-pointer hover:bg-slate-50 rounded px-1">
                                 <option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option>
                             </select>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-12">
                    <div className="flex border-b-2 border-slate-100 pb-2 mb-4 text-xs font-bold text-slate-400 uppercase">
                        <div className="flex-1">Description</div>
                        <div className="w-24 text-right">Qty</div>
                        <div className="w-32 text-right">Price</div>
                        <div className="w-32 text-right">Total</div>
                        <div className="w-10 print:hidden"></div>
                    </div>
                    
                    <div className="space-y-2">
                        {currentInvoice.items.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 py-2 border-b border-slate-50 group">
                                <input 
                                    type="text" 
                                    value={item.description} 
                                    onChange={e => updateItem(idx, 'description', e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-slate-300"
                                    placeholder="Item description"
                                />
                                <input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                                    className="w-24 text-right bg-transparent outline-none text-sm"
                                />
                                <input 
                                    type="number" 
                                    value={item.unitPrice} 
                                    onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))}
                                    className="w-32 text-right bg-transparent outline-none text-sm"
                                />
                                <div className="w-32 text-right text-sm font-bold">
                                    ${(item.quantity * item.unitPrice).toFixed(2)}
                                </div>
                                <div className="w-10 text-right print:hidden opacity-0 group-hover:opacity-100">
                                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><Icons.X /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button onClick={addItem} className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 print:hidden">
                        <Icons.Plus /> Add Item
                    </button>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-bold">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg border-t-2 border-slate-900 pt-3">
                            <span className="font-bold">Total</span>
                            <span className="font-bold">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Notes */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Notes</label>
                    <textarea 
                        value={currentInvoice.notes || ''}
                        onChange={e => updateField('notes', e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-lg text-sm text-slate-600 outline-none resize-none h-24 border border-transparent focus:border-blue-200 print:bg-transparent print:p-0"
                        placeholder="Payment terms, thank you note, etc."
                    />
                </div>
            </div>
        </div>
    );
};

export default InvoiceBuilder;
