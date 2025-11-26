
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { CalendarEvent, Contact } from '../types';
import { getEvents, saveEvent, deleteEvent } from '../services/calendarService';
import { parseScheduleRequest, generateMeetingBriefing } from '../services/geminiService';
import { getContacts } from '../services/supabaseService';
import { useToast } from './ToastContainer';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, parseISO, addHours } from 'date-fns';
import MarkdownRenderer from './MarkdownRenderer';

const CalendarView: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [magicInput, setMagicInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [briefing, setBriefing] = useState('');
    const [briefingLoading, setBriefingLoading] = useState(false);
    const toast = useToast();

    // Form State
    const [formTitle, setFormTitle] = useState('');
    const [formStart, setFormStart] = useState('');
    const [formEnd, setFormEnd] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formContactId, setFormContactId] = useState<number | undefined>(undefined);

    useEffect(() => {
        setEvents(getEvents());
        getContacts().then(setContacts);
    }, []);

    const handleMagicSchedule = async () => {
        if(!magicInput) return;
        setLoading(true);
        try {
            const parsed = await parseScheduleRequest(magicInput);
            if(parsed.title && parsed.start) {
                const newEvent: CalendarEvent = {
                    id: `evt-${Date.now()}`,
                    title: parsed.title,
                    start: parsed.start,
                    end: parsed.end || addHours(parseISO(parsed.start), 1).toISOString(),
                    description: parsed.description || '',
                    type: 'meeting'
                };
                saveEvent(newEvent);
                setEvents(getEvents());
                setMagicInput('');
                toast.show("Event scheduled!", "success");
            } else {
                toast.show("Could not understand request.", "error");
            }
        } catch (e) {
            toast.show("AI scheduling failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEvent = () => {
        if(!formTitle || !formStart) return;
        const newEvent: CalendarEvent = {
            id: selectedEvent?.id || `evt-${Date.now()}`,
            title: formTitle,
            start: formStart,
            end: formEnd || addHours(parseISO(formStart), 1).toISOString(),
            description: formDesc,
            contactId: formContactId,
            type: 'meeting'
        };
        saveEvent(newEvent);
        setEvents(getEvents());
        setShowModal(false);
        toast.show("Event saved.", "success");
    };

    const handleDeleteEvent = () => {
        if(selectedEvent) {
            deleteEvent(selectedEvent.id);
            setEvents(getEvents());
            setShowModal(false);
            toast.show("Event deleted.", "info");
        }
    };

    const handleGenerateBriefing = async () => {
        if(!formContactId) return;
        const contact = contacts.find(c => c.id === Number(formContactId));
        if(!contact) return;

        setBriefingLoading(true);
        try {
            const result = await generateMeetingBriefing(contact);
            setBriefing(result);
        } catch(e) {
            toast.show("Failed to generate briefing.", "error");
        } finally {
            setBriefingLoading(false);
        }
    };

    const openModal = (event?: CalendarEvent, date?: Date) => {
        setSelectedEvent(event || null);
        setFormTitle(event?.title || '');
        setFormStart(event?.start || (date ? date.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)));
        setFormEnd(event?.end || (date ? addHours(date, 1).toISOString().slice(0, 16) : addHours(new Date(), 1).toISOString().slice(0, 16)));
        setFormDesc(event?.description || '');
        setFormContactId(event?.contactId);
        setBriefing('');
        setShowModal(true);
    };

    // Render Grid
    const renderHeader = () => {
        const dateFormat = "MMMM yyyy";
        return (
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(addDays(currentDate, -30))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><Icons.ArrowLeft /></button>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{format(currentDate, dateFormat)}</span>
                    <button onClick={() => setCurrentDate(addDays(currentDate, 30))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 rotate-180"><Icons.ArrowLeft /></button>
                </div>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm">
                    <Icons.Plus /> New Event
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const dateFormat = "EEE";
        const startDate = startOfWeek(currentDate);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="text-center text-xs font-bold text-slate-500 uppercase py-2" key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-2 border-b border-slate-200 dark:border-slate-700">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const dayEvents = events.filter(e => isSameDay(parseISO(e.start), day));
                
                days.push(
                    <div
                        className={`min-h-[100px] p-2 border border-slate-100 dark:border-slate-700 relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
                            ${!isSameMonth(day, monthStart) ? "bg-slate-50/50 dark:bg-slate-900/50 text-slate-400" : "bg-white dark:bg-slate-800"}
                            ${isSameDay(day, selectedDate) ? "ring-2 ring-inset ring-blue-200 dark:ring-blue-800" : ""}
                        `}
                        key={day.toString()}
                        onClick={() => openModal(undefined, cloneDay)}
                    >
                        <span className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>{formattedDate}</span>
                        <div className="mt-1 space-y-1">
                            {dayEvents.map(ev => (
                                <div 
                                    key={ev.id}
                                    onClick={(e) => { e.stopPropagation(); openModal(ev); }}
                                    className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded truncate font-medium hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
                                >
                                    {ev.title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
            days = [];
        }
        return <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">{rows}</div>;
    };

    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Smart Calendar</h2>
                <p className="text-slate-500 dark:text-slate-400">AI-powered scheduling and meeting preparation.</p>
            </div>

            {/* Magic Input */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex gap-4 items-center ring-1 ring-slate-100 dark:ring-slate-800">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg"><Icons.Sparkles /></div>
                <input 
                    type="text" 
                    value={magicInput} 
                    onChange={e => setMagicInput(e.target.value)} 
                    placeholder="e.g. 'Meeting with Alex next Friday at 10am to discuss Q3 results'" 
                    className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-200"
                    onKeyDown={e => e.key === 'Enter' && handleMagicSchedule()}
                />
                <button onClick={handleMagicSchedule} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    {loading ? 'Thinking...' : 'Magic Schedule'}
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 flex-1 overflow-y-auto">
                {renderHeader()}
                {renderDays()}
                {renderCells()}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row">
                        {/* Left: Form */}
                        <div className="p-6 flex-1 border-r border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{selectedEvent ? 'Edit Event' : 'New Event'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
                            </div>
                            <div className="space-y-4">
                                <input className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Event Title" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Start</label>
                                        <input type="datetime-local" className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" value={formStart} onChange={e => setFormStart(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">End</label>
                                        <input type="datetime-local" className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" value={formEnd} onChange={e => setFormEnd(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                                    <textarea className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 h-24 text-sm" placeholder="Details..." value={formDesc} onChange={e => setFormDesc(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Link to Contact (CRM)</label>
                                    <select className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" value={formContactId || ''} onChange={e => setFormContactId(Number(e.target.value))}>
                                        <option value="">-- Select Contact --</option>
                                        {contacts.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button onClick={handleSaveEvent} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg">Save</button>
                                    {selectedEvent && <button onClick={handleDeleteEvent} className="bg-red-50 text-red-500 font-bold px-4 py-2 rounded-lg">Delete</button>}
                                </div>
                            </div>
                        </div>

                        {/* Right: AI Assistant (Only if Contact Linked) */}
                        {formContactId && (
                            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 md:w-1/3 flex flex-col">
                                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase mb-4 flex items-center gap-2"><Icons.Sparkles /> AI Prep</h4>
                                <div className="flex-1 overflow-y-auto text-xs text-slate-600 dark:text-slate-400 mb-4 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                    {briefingLoading ? (
                                        <div className="animate-pulse space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                                        </div>
                                    ) : briefing ? (
                                        <MarkdownRenderer content={briefing} />
                                    ) : (
                                        <p className="italic text-center mt-10 opacity-50">Link a contact to generate a pre-meeting briefing.</p>
                                    )}
                                </div>
                                <button 
                                    onClick={handleGenerateBriefing} 
                                    disabled={briefingLoading}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-lg text-xs transition-colors shadow-sm"
                                >
                                    {briefingLoading ? 'Analyzing...' : 'Generate Briefing'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
