
import React, { useState, useRef, useEffect } from 'react';
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

const AudioStudio: React.FC = () => {
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('Kore');
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const toast = useToast();
    const audioRef = useRef<HTMLAudioElement>(null);

    // Clean up ObjectURL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setAudioUrl(null);

        try {
            const base64Audio = await generateSpeech(text, selectedVoice);
            const pcmData = decodeAudio(base64Audio); // Returns Uint8Array containing PCM 16-bit LE
            const wavBlob = pcmToWav(pcmData);
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);
            toast.show("Audio generated successfully!", "success");
        } catch (e) {
            console.error(e);
            toast.show("Failed to generate audio.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Audio Studio</h2>
                <p className="text-slate-500 dark:text-slate-400">Transform text into lifelike speech using Gemini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Controls Side */}
                <div className="md:col-span-1 flex flex-col gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-fit">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Select Voice</label>
                        <div className="space-y-2">
                            {VOICES.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVoice(v.id)}
                                    className={`w-full text-left p-3 rounded-lg text-sm border transition-all ${
                                        selectedVoice === v.id 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500' 
                                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <div className="font-bold">{v.id}</div>
                                    <div className="text-xs opacity-70">{v.name.split('(')[1]?.replace(')', '')}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Area */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Script / Text</label>
                        <textarea 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text to convert to speech..."
                            className="w-full flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-800 dark:text-slate-200 leading-relaxed min-h-[200px]"
                        />
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={handleGenerate}
                                disabled={loading || !text}
                                className={`px-6 py-3 rounded-lg font-bold text-white shadow-md flex items-center gap-2 transition-all
                                    ${loading || !text ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}
                                `}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Icons.SpeakerWave /> Generate Audio
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {audioUrl && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <Icons.CheckCircle /> Result Ready
                                </h3>
                                <a 
                                    href={audioUrl} 
                                    download={`generated-audio-${Date.now()}.wav`}
                                    className="text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Icons.Download /> Download WAV
                                </a>
                            </div>
                            <audio 
                                ref={audioRef} 
                                src={audioUrl} 
                                controls 
                                className="w-full h-12 rounded-lg"
                                autoPlay
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudioStudio;
