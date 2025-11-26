
import React, { useState, useEffect, useRef } from 'react';
import { ToolDefinition } from '../types';
import { runGenericTool, generateSpeech, decodeAudio, decodeAudioData, editContentWithAI } from '../services/geminiService';
import { MANUAL_TOOLS } from '../services/manualLogic';
import { saveItem, getSupabaseConfig } from '../services/supabaseService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import { Icons } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';
import { useToast } from './ToastContainer';

interface UniversalToolProps {
  tool: ToolDefinition;
  onBack: () => void;
}

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

const UniversalTool: React.FC<UniversalToolProps> = ({ tool, onBack }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  
  // Manual Mode State
  const manualConfig = MANUAL_TOOLS[tool.id];
  const [mode, setMode] = useState<'ai' | 'manual'>(manualConfig ? 'manual' : 'ai');
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  
  // Audio State
  const [speaking, setSpeaking] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [isDictating, setIsDictating] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Reset state when tool changes
  useEffect(() => {
      setMode(manualConfig ? 'manual' : 'ai');
      setManualValues({});
      setInput('');
      setOutput('');
      stopSpeaking();
  }, [tool.id, manualConfig]);

  // Cleanup audio
  useEffect(() => {
      return () => {
          if (audioSourceRef.current) audioSourceRef.current.stop();
          if (audioCtxRef.current) audioCtxRef.current.close();
      };
  }, []);

  const IconComponent = Icons[tool.icon] || Icons.Grid;

  const handleAiRun = async () => {
    if (!input) return;
    setLoading(true);
    stopSpeaking();
    try {
      const profile = getProfile();
      const context = formatProfileForPrompt(profile);
      
      const result = await runGenericTool(input, tool.systemInstruction, context);
      setOutput(result);
    } catch (e) {
      console.error(e);
      setOutput("Error running tool. Please check your API key and try again.");
      toast.show("Error running tool. Please check your API key.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
      if (!output) return;
      setLoading(true);
      try {
          const newResult = await editContentWithAI(output, action);
          setOutput(newResult);
          toast.show("Result updated!", "success");
      } catch(e) {
          toast.show("Action failed.", "error");
      } finally {
          setLoading(false);
      }
  };

  const handleManualRun = () => {
      if (!manualConfig) return;
      const result = manualConfig.execute(manualValues);
      setOutput(result);
  };

  const handleSave = async () => {
    if (!output) return;
    setSaving(true);
    let titleInput = input;
    if (mode === 'manual') {
        const firstVal = Object.values(manualValues)[0];
        titleInput = firstVal ? String(firstVal) : 'Manual Entry';
    }
    const title = `${tool.name}: ${titleInput.substring(0, 30)}...`;
    const saveRes = await saveItem(tool.category, title, output);
    if (saveRes.success) {
      toast.show("Saved to database!", "success");
    } else {
      toast.show(`Failed to save: ${saveRes.error}`, "error");
    }
    setSaving(false);
  };

  const handleRefine = () => {
      // Move output to input for iteration (Only in AI mode)
      setMode('ai');
      setInput(output + "\n\n--- REFINE REQUEST: ---\n");
      setOutput('');
      const textarea = document.querySelector('textarea');
      if (textarea) textarea.focus();
  };

  // --- Realistic TTS Handlers ---
  const handleSpeak = async () => {
      if (speaking) {
          stopSpeaking();
          return;
      }
      if (!output) return;

      const cleanText = output.replace(/[*#_\[\]|]/g, ' ').replace(/<[^>]*>?/gm, '');
      if (!cleanText.trim()) return;

      setAudioLoading(true);
      try {
          const base64Audio = await generateSpeech(cleanText, selectedVoice);
          
          if (!audioCtxRef.current) {
              audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          }
          
          const buffer = await decodeAudioData(decodeAudio(base64Audio), audioCtxRef.current, 24000, 1);
          
          if (audioSourceRef.current) audioSourceRef.current.stop();
          audioSourceRef.current = audioCtxRef.current.createBufferSource();
          audioSourceRef.current.buffer = buffer;
          audioSourceRef.current.connect(audioCtxRef.current.destination);
          audioSourceRef.current.onended = () => setSpeaking(false);
          audioSourceRef.current.start();
          
          setSpeaking(true);
      } catch (e) {
          console.error(e);
          toast.show("Failed to generate speech.", "error");
      } finally {
          setAudioLoading(false);
      }
  };

  const stopSpeaking = () => {
      if (audioSourceRef.current) {
          audioSourceRef.current.stop();
      }
      setSpeaking(false);
  };

  const toggleDictation = () => {
      if (isDictating) {
          if (recognitionRef.current) recognitionRef.current.stop();
          setIsDictating(false);
      } else {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (!SpeechRecognition) {
              toast.show("Speech recognition not supported in this browser.", "error");
              return;
          }
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              setInput(prev => prev + (prev ? " " : "") + transcript);
              setIsDictating(false);
          };
          recognition.start();
          setIsDictating(true);
          recognitionRef.current = recognition;
      }
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 flex-1">
                <button 
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                    title="Back to Library"
                >
                    <Icons.ArrowLeft />
                </button>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl">
                    <IconComponent />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{tool.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{tool.description}</p>
                </div>
            </div>
            
            {manualConfig && (
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg self-start md:self-center">
                    <button 
                        onClick={() => setMode('manual')}
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${mode === 'manual' ? 'bg-white dark:bg-slate-700 shadow text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Manual Calc
                    </button>
                    <button 
                        onClick={() => setMode('ai')}
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${mode === 'ai' ? 'bg-white dark:bg-slate-700 shadow text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        AI Generate
                    </button>
                </div>
            )}
            
            {tool.category === 'Custom' && (
                 <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-bold border border-purple-200">
                    GENERATED TOOL
                 </span>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
            {/* Input Panel */}
            <div className="flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col flex-1 h-full">
                    <div className="flex justify-between items-center mb-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                            <Icons.Pen /> {mode === 'manual' ? 'Input Data' : 'Input Context'}
                        </label>
                        {mode === 'ai' && (
                            <button 
                                onClick={toggleDictation}
                                className={`p-1.5 rounded-full transition-all ${isDictating ? 'text-red-500 bg-red-50 dark:bg-red-900/50 animate-pulse' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700'}`}
                                title="Dictate"
                            >
                                <Icons.Mic />
                            </button>
                        )}
                    </div>
                    
                    {mode === 'manual' && manualConfig ? (
                        <div className="flex-1 flex flex-col gap-4">
                            {manualConfig.inputs.map(field => (
                                <div key={field.name}>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea 
                                            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-900 h-32"
                                            placeholder={field.placeholder}
                                            value={manualValues[field.name] || ''}
                                            onChange={e => setManualValues(prev => ({...prev, [field.name]: e.target.value}))}
                                        />
                                    ) : (
                                        <input 
                                            type={field.type}
                                            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-900"
                                            placeholder={field.placeholder}
                                            value={manualValues[field.name] || ''}
                                            onChange={e => setManualValues(prev => ({...prev, [field.name]: e.target.value}))}
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={handleManualRun}
                                    className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                                >
                                    Calculate
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isDictating ? "Listening..." : (tool.placeholder || "Enter details here...")}
                                className="flex-1 w-full p-4 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 leading-relaxed"
                            />
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={handleAiRun}
                                    disabled={loading || !input}
                                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-all
                                        ${loading || !input ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'}`}
                                >
                                    {loading ? 'Processing...' : <><Icons.Sparkles /> Run with AI</>}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Output Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        <Icons.DocumentText /> Result
                    </label>
                    <div className="flex gap-2 items-center">
                        {output && (
                             <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 rounded-lg p-0.5 border border-slate-200 dark:border-slate-600 mr-2">
                                 <select 
                                    value={selectedVoice} 
                                    onChange={(e) => setSelectedVoice(e.target.value)}
                                    className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none px-2 py-1"
                                 >
                                     {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                                 </select>
                                 <button
                                    onClick={handleSpeak}
                                    disabled={audioLoading}
                                    className={`flex items-center justify-center w-8 h-7 rounded-md transition-all ${speaking ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-600 hover:text-blue-600'}`}
                                    title="Read Aloud"
                                 >
                                     {audioLoading ? (
                                         <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                     ) : (
                                         speaking ? <div className="w-2 h-2 bg-white rounded-sm"></div> : <Icons.SpeakerWave />
                                     )}
                                 </button>
                             </div>
                        )}
                        {output && mode === 'ai' && (
                            <button
                                onClick={handleRefine}
                                className="text-xs flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                title="Use result as input for next step"
                            >
                                <Icons.Loop /> Refine
                            </button>
                        )}
                        {output && getSupabaseConfig() && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium border border-emerald-100 dark:border-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors"
                            >
                                {saving ? 'Saving...' : <><Icons.Save /> Save</>}
                            </button>
                        )}
                        {output && (
                             <button 
                                onClick={() => navigator.clipboard.writeText(output)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium border border-blue-100 dark:border-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
                            >
                                Copy
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 p-6 relative">
                    {output ? (
                        <>
                            <MarkdownRenderer content={output} />
                            {mode === 'ai' && !loading && (
                                <div className="absolute bottom-4 right-4 flex gap-2">
                                    <button onClick={() => handleQuickAction("Shorten this")} className="text-xs bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">Shorten</button>
                                    <button onClick={() => handleQuickAction("Expand this")} className="text-xs bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">Expand</button>
                                    <button onClick={() => handleQuickAction("Critique this output")} className="text-xs bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">Critique</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
                             <div className="mb-2 text-slate-300 dark:text-slate-600"><Icons.DocumentText /></div>
                             <p className="italic">Output will appear here...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default UniversalTool;
