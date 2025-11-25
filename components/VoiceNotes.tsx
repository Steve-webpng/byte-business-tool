import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';
import { TranscribedNote, Task } from '../types';
import { transcribeAndSummarizeAudio } from '../services/geminiService';

interface VoiceNotesProps {
    onAddTask: (title: string, priority?: Task['priority']) => void;
}

const VoiceNotes: React.FC<VoiceNotesProps> = ({ onAddTask }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState<TranscribedNote[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const toast = useToast();

    useEffect(() => {
        const savedNotes = localStorage.getItem('byete_voice_notes');
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('byete_voice_notes', JSON.stringify(notes));
    }, [notes]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
            toast.show("Recording started...", "info");
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.show("Could not access microphone.", "error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            
            mediaRecorderRef.current.onstop = async () => {
                setLoading(true);
                toast.show("Processing audio...", "info");
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                audioChunksRef.current = [];
                
                try {
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                        const base64Audio = reader.result as string;
                        const result = await transcribeAndSummarizeAudio(base64Audio);
                        const newNote: TranscribedNote = {
                            id: Date.now(),
                            createdAt: new Date().toISOString(),
                            ...result,
                        };
                        setNotes(prev => [newNote, ...prev]);
                        toast.show("Note processed and saved!", "success");
                    };
                } catch (e) {
                    toast.show("Failed to process audio.", "error");
                } finally {
                    setLoading(false);
                }
            };
        }
    };

    const handleDelete = (id: number) => {
        setNotes(notes.filter(n => n.id !== id));
        toast.show("Note deleted.", "info");
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">AI Voice Memos</h2>
                <p className="text-slate-500 dark:text-slate-400">Record your thoughts. Get a summary and action items.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-8 text-center mb-6">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={loading}
                    className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center text-white transition-all shadow-xl
                        ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}
                        ${loading ? 'opacity-50' : ''}
                    `}
                >
                    {loading ? <div className="w-8 h-8 border-4 border-white/50 border-t-white rounded-full animate-spin"></div> : <Icons.Mic />}
                </button>
                <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm font-medium">
                    {loading ? "Processing..." : isRecording ? "Recording... Click to stop." : "Click to start recording."}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
                {notes.map(note => (
                    <div key={note.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{note.summary}</h3>
                                <p className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => handleDelete(note.id)} className="text-slate-400 hover:text-red-500"><Icons.Trash /></button>
                        </div>
                       
                        <div className="mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                            <details>
                                <summary className="cursor-pointer text-sm font-bold text-slate-600 dark:text-slate-300">View Full Transcription</summary>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 whitespace-pre-wrap">{note.transcription}</p>
                            </details>
                        </div>
                        {note.actionItems.length > 0 && (
                             <div className="mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Action Items</h4>
                                <ul className="space-y-2">
                                    {note.actionItems.map((item, i) => (
                                        <li key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg text-sm">
                                            <span className="text-slate-700 dark:text-slate-300">{item}</span>
                                            <button onClick={() => { onAddTask(item, 'Medium'); toast.show("Task created!", 'success'); }} className="text-blue-600 text-xs font-bold hover:bg-blue-100 px-2 py-1 rounded">Create Task</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoiceNotes;
