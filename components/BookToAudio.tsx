import React, { useState, useRef } from 'react';
import { generateSpeech, decodeAudio, pcmToWav } from '../services/geminiService';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';

const VOICES = [
    { id: 'Kore', name: 'Kore (Deep, Professional)' },
    { id: 'Puck', name: 'Puck (Warm, Friendly)' },
    { id: 'Charon', name: 'Charon (Calm, Male)' },
    { id: 'Fenrir', name: 'Fenrir (Bright, Male)' },
    { id: 'Zephyr', name: 'Zephyr (Gentle, Female)' },
];

const BookToAudio: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [extractedText, setExtractedText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('Kore');
    const [loading, setLoading] = useState(false);
    const [processingStep, setProcessingStep] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const toast = useToast();

    const handleFiles = async (newFiles: File[]) => {
        if (!newFiles.length) return;
        setFiles(prev => [...prev, ...newFiles]);
        setLoading(true);
        setProcessingStep('Parsing files...');
        
        try {
            let combinedText = extractedText;
            
            for (const file of newFiles) {
                if (file.type === 'application/pdf') {
                    const pdfjsLib = await import('pdfjs-dist');
                    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
                    }
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
                    
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => item.str).join(' ');
                        combinedText += pageText + '\n';
                    }
                } else if (file.type === 'text/plain') {
                    const text = await file.text();
                    combinedText += text + '\n';
                }
            }
            
            setExtractedText(combinedText);
            toast.show(`Added ${newFiles.length} files.`, "success");
        } catch (e) {
            console.error(e);
            toast.show("Failed to parse some files.", "error");
        } finally {
            setLoading(false);
            setProcessingStep('');
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFiles = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type === 'application/pdf' || f.type === 'text/plain');
        handleFiles(droppedFiles);
    };

    const handleGenerateAudio = async () => {
        if (!extractedText.trim()) return;
        
        setLoading(true);
        setProcessingStep('Converting text to speech...');
        setAudioUrl(null);
        setProgress(0);

        try {
            const MAX_CHUNK_SIZE = 4000;
            const chunks: string[] = [];
            let currentChunk = '';
            
            const sentences = extractedText.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
            
            for (const sentence of sentences) {
                if ((currentChunk + sentence).length > MAX_CHUNK_SIZE) {
                    chunks.push(currentChunk);
                    currentChunk = sentence;
                } else {
                    currentChunk += (currentChunk ? ' ' : '') + sentence;
                }
            }
            if (currentChunk) chunks.push(currentChunk);

            const audioParts: Uint8Array[] = [];
            
            for (let i = 0; i < chunks.length; i++) {
                setProcessingStep(`Generating audio part ${i + 1} of ${chunks.length}...`);
                const chunkText = chunks[i].trim();
                if (!chunkText) continue;

                const base64 = await generateSpeech(chunkText, selectedVoice);
                const pcmData = decodeAudio(base64);
                audioParts.push(pcmData);
                
                setProgress(Math.round(((i + 1) / chunks.length) * 100));
            }

            setProcessingStep('Stitching audio...');
            const totalLength = audioParts.reduce((acc, part) => acc + part.length, 0);
            const mergedPcm = new Uint8Array(totalLength);
            let offset = 0;
            for (const part of audioParts) {
                mergedPcm.set(part, offset);
                offset += part.length;
            }

            const wavBlob = pcmToWav(mergedPcm);
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);
            
            toast.show("Audiobook generated successfully!", "success");

        } catch (e) {
            console.error(e);
            toast.show("Failed to generate audio.", "error");
        } finally {
            setLoading(false);
            setProcessingStep('');
            setProgress(0);
        }
    };

    const clearAll = () => {
        setFiles([]);
        setExtractedText('');
        setAudioUrl(null);
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Icons.Headphones /> Book to Audio
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Turn PDFs and text files into a downloadable audiobook.</p>
                </div>
                <button onClick={clearAll} className="text-sm font-bold text-red-500 hover:text-red-700 px-3 py-1 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    Reset All
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div 
                        onDrop={handleDrop}
                        onDragOver={e => e.preventDefault()}
                        className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('book-upload')?.click()}
                    >
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icons.Upload />
                        </div>
                        <p className="font-bold text-slate-700 dark:text-slate-200">Click or Drop Files</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF or TXT supported</p>
                        <input 
                            type="file" 
                            id="book-upload" 
                            multiple 
                            accept=".pdf,.txt" 
                            className="hidden" 
                            onChange={e => handleFiles(Array.from(e.target.files || []))} 
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase mb-4">Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Narrator Voice</label>
                                <select 
                                    value={selectedVoice}
                                    onChange={e => setSelectedVoice(e.target.value)}
                                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none"
                                >
                                    {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                            <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p><strong>Files:</strong> {files.length}</p>
                                <p><strong>Characters:</strong> {extractedText.length.toLocaleString()}</p>
                                <p><strong>Est. Duration:</strong> {Math.ceil(extractedText.length / 1500)} mins</p>
                            </div>
                            <button
                                onClick={handleGenerateAudio}
                                disabled={loading || !extractedText}
                                className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2
                                    ${loading || !extractedText ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transition-all'}
                                `}
                            >
                                {loading ? 'Processing...' : <><Icons.SpeakerWave /> Generate Audiobook</>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-[500px]">
                    {loading && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-blue-200 dark:border-blue-900 shadow-sm">
                            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">{processingStep}</h3>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {audioUrl && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500 text-white rounded-full"><Icons.CheckCircle /></div>
                                <div>
                                    <h3 className="font-bold text-emerald-800 dark:text-emerald-300">Audiobook Ready!</h3>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Success. You can now listen or download.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <audio controls src={audioUrl} className="h-10 w-full md:w-64 rounded-lg" />
                                <a 
                                    href={audioUrl} 
                                    download={`audiobook-${Date.now()}.wav`} 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Icons.Download /> Download
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase">Extracted Content Preview</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 font-serif text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {extractedText || <span className="text-slate-400 italic">No text extracted yet. Upload files to begin.</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookToAudio;