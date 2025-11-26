import React, { useState, useRef, useEffect } from 'react';
import { connectLiveSession, float32ToInt16, encodeAudio, decodeAudio, decodeAudioData, analyzeSessionTranscript } from '../services/geminiService';
import { getProfile } from '../services/settingsService';
import { LiveServerMessage } from "@google/genai";
import { Icons } from '../constants';
import { TranscriptItem } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { useToast } from './ToastContainer';

interface LiveSupportProps {
  isWidget?: boolean;
}

const SCENARIOS = [
    { id: 'cold-call', name: 'Cold Call Practice', desc: 'Simulate a first-contact sales call with a busy prospect.', role: 'Act as a busy, slightly skeptical prospect receiving a cold call. Be professional but guarded. Challenge the user to prove value quickly.' },
    { id: 'negotiation', name: 'Salary/Price Negotiation', desc: 'Practice negotiating a higher rate or closing a deal.', role: 'Act as a hiring manager or procurement officer. You want the deal but have budget constraints. Push back on price but yield to good value arguments.' },
    { id: 'pitch', name: 'Pitch Deck Review', desc: 'Deliver your elevator pitch and get grilled.', role: 'Act as a Venture Capitalist. Listen to the pitch. Ask tough questions about market size, traction, and competition. Be direct.' },
    { id: 'interview', name: 'Behavioral Interview', desc: 'Practice answering "Tell me about a time..." questions.', role: 'Act as a Senior Recruiter. Ask behavioral interview questions (STAR method). Follow up on specific details. Evaluate their clarity.' },
    { id: 'conflict', name: 'Conflict Resolution', desc: 'Handle a difficult conversation with a team member.', role: 'Act as a frustrated team member who feels unheard. Be emotional but professional. Require empathy to calm down.' },
    { id: 'support', name: 'Angry Customer', desc: 'De-escalate a service issue.', role: 'Act as an angry customer who has experienced a service failure. Demand a solution. Be impatient.' }
];

const LiveSupport: React.FC<LiveSupportProps> = ({ isWidget = false }) => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [volume, setVolume] = useState(0); 
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentUserTranscript, setCurrentUserTranscript] = useState('');
  const [currentModelTranscript, setCurrentModelTranscript] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState('cold-call');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const toast = useToast();

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeRef = useRef(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, currentUserTranscript, currentModelTranscript]);

  useEffect(() => {
      if (active) {
          timerRef.current = window.setInterval(() => {
              setSessionDuration(prev => prev + 1);
          }, 1000);
      } else {
          if (timerRef.current) clearInterval(timerRef.current);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active]);

  const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Cleanup function
  const stopSession = () => {
    activeRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setActive(false);
    setStatus('idle');
    setVolume(0);
    sessionPromiseRef.current = null;
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      setTranscript([]);
      setAnalysis(null);
      setSessionDuration(0);
      activeRef.current = true; 
      
      const profile = getProfile();
      const scenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];
      
      let systemContext = `You are an AI Roleplay Partner for business training. 
      YOUR CURRENT ROLE: ${scenario.role}
      
      CONTEXT:
      User's Business: "${profile?.name || 'Generic Corp'}"
      Industry: ${profile?.industry || 'General Business'}
      
      INSTRUCTIONS:
      - Stay in character 100% of the time.
      - Be realistic. Do not be overly helpful if the scenario calls for skepticism.
      - Keep responses concise (1-3 sentences) to allow for a natural back-and-forth flow.
      - Do not break character to give feedback during the call. Wait for the user to end the call.
      `;

      // Output Context (Model returns 24kHz)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const outputNode = audioCtx.createGain();
      outputNode.connect(audioCtx.destination);

      const sessionPromise = connectLiveSession(
        {
          onOpen: () => {
              console.log('Session Opened');
              setStatus('connected');
              setActive(true);

              const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); 
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              scriptProcessorRef.current = scriptProcessor;
              
              scriptProcessor.onaudioprocess = (e) => {
                  if (!activeRef.current) return;

                  const inputData = e.inputBuffer.getChannelData(0);
                  
                  // Visualizer volume approximation
                  let sum = 0;
                  for(let i=0; i<inputData.length; i++) sum += Math.abs(inputData[i]);
                  setVolume(Math.min(100, (sum / inputData.length) * 500));

                  const pcmData = float32ToInt16(inputData);
                  const uint8Array = new Uint8Array(pcmData.buffer);
                  const base64 = encodeAudio(uint8Array);

                  if (sessionPromiseRef.current) {
                      sessionPromiseRef.current.then(session => {
                          session.sendRealtimeInput({
                              media: {
                                  mimeType: 'audio/pcm',
                                  data: base64
                              }
                          });
                      });
                  }
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
          },
          onMessage: async (message: LiveServerMessage) => {
             // Handle Audio
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio) {
                 try {
                    const audioBuffer = await decodeAudioData(
                        decodeAudio(base64Audio),
                        audioCtx,
                        24000,
                        1
                    );
                    const source = audioCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputNode);

                    // Scheduling
                    const currentTime = audioCtx.currentTime;
                    if (nextStartTimeRef.current < currentTime) {
                        nextStartTimeRef.current = currentTime;
                    }
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                 } catch (e) {
                     console.error("Error decoding audio", e);
                 }
             }

             // Handle Transcription
            if (message.serverContent?.inputTranscription) {
                setCurrentUserTranscript(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.outputTranscription) {
                setCurrentModelTranscript(prev => prev + message.serverContent!.outputTranscription!.text);
            }

            if (message.serverContent?.turnComplete) {
                const finalUserTurn = (currentUserTranscript + (message.serverContent?.inputTranscription?.text || '')).trim();
                const finalModelTurn = (currentModelTranscript + (message.serverContent?.outputTranscription?.text || '')).trim();
                
                setTranscript(prev => {
                    const newTurns: TranscriptItem[] = [];
                    if (finalUserTurn) newTurns.push({ role: 'user', text: finalUserTurn, timestamp: Date.now() });
                    if (finalModelTurn) newTurns.push({ role: 'model', text: finalModelTurn, timestamp: Date.now() });
                    return [...prev, ...newTurns];
                });

                setCurrentUserTranscript('');
                setCurrentModelTranscript('');
            }

             if (message.serverContent?.interrupted) {
                nextStartTimeRef.current = 0;
             }
          },
          onClose: (e) => {
              console.log('Session Closed', e);
              stopSession();
          },
          onError: (e) => {
              console.error('Session Error', e);
              setStatus('error');
              stopSession();
          }
        },
        systemContext
      );
      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
        console.error("Failed to start session:", error);
        setStatus('error');
        stopSession();
    }
  };

  const handleAnalyzeSession = async () => {
      if (transcript.length < 2) {
          toast.show("Conversation too short to analyze.", "error");
          return;
      }
      setAnalyzing(true);
      try {
          const result = await analyzeSessionTranscript(transcript);
          setAnalysis(result);
      } catch(e) {
          toast.show("Failed to generate analysis.", "error");
      } finally {
          setAnalyzing(false);
      }
  };

  useEffect(() => {
      // Cleanup on unmount
      return () => {
          stopSession();
      };
  }, []);

  return (
    <div className={`h-full flex flex-col ${isWidget ? '' : 'max-w-5xl mx-auto items-center justify-center'}`}>
        {!isWidget && (
            <div className="text-center mb-6 w-full">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">AI Sales & Leadership Coach</h2>
                <p className="text-slate-500 dark:text-slate-400">Select a scenario, practice your skills live, and get instant AI feedback.</p>
            </div>
        )}

        {isWidget && (
            <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300">
                <Icons.Mic />
                <h3 className="font-bold text-sm uppercase tracking-wide">Live Coach</h3>
            </div>
        )}

        {/* Scenario Selector (Only show if not active and no analysis yet) */}
        {!active && !analysis && !isWidget && transcript.length === 0 && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in">
                {SCENARIOS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setSelectedScenarioId(s.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedScenarioId === s.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'}`}
                    >
                        <h4 className={`font-bold ${selectedScenarioId === s.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>{s.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                    </button>
                ))}
            </div>
        )}

        {/* Active Session View or Transcript Review */}
        <div className="flex flex-col md:flex-row gap-6 w-full items-stretch justify-center flex-1 min-h-[400px]">
            {/* Visualizer / Controls */}
            <div className={`
                flex flex-col items-center justify-center relative overflow-hidden transition-all bg-slate-900 shadow-2xl
                ${isWidget ? 'flex-1 rounded-xl p-4 w-full' : 'flex-1 rounded-3xl p-8 max-w-md w-full mx-auto'}
            `}>
                {/* Timer Overlay */}
                {active && (
                    <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-red-400 border border-red-500/30 flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        LIVE {formatTime(sessionDuration)}
                    </div>
                )}

                {/* Visualizer Circles */}
                {active && (
                    <>
                        <div 
                            className="absolute bg-blue-500 rounded-full opacity-20 transition-all duration-75 blur-xl"
                            style={{ width: `${40 + volume}%`, height: `${40 + volume}%` }}
                        ></div>
                        <div 
                            className="absolute bg-indigo-500 rounded-full opacity-30 transition-all duration-100 blur-lg"
                            style={{ width: `${50 + volume * 0.8}%`, height: `${50 + volume * 0.8}%` }}
                        ></div>
                    </>
                )}

                <div className="z-10 flex flex-col items-center gap-6 w-full">
                    {!active && (
                        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">
                            {transcript.length > 0 ? 'Session Ended' : 'Ready to Start'}
                        </h3>
                    )}
                    
                    <div className={`rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-white text-blue-600 scale-110 shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-slate-400'} ${isWidget ? 'w-16 h-16' : 'w-32 h-32'}`}>
                        {status === 'connecting' ? (
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                        ) : (
                            <div className={`${isWidget ? 'w-8 h-8' : 'w-12 h-12'}`}>
                                <Icons.Mic />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full">
                        {active ? (
                            <button 
                                onClick={stopSession}
                                className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2 w-full justify-center max-w-xs"
                            >
                                <Icons.Stop /> End Session
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={startSession}
                                    disabled={status === 'connecting'}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105 disabled:opacity-50 w-full justify-center max-w-xs flex items-center gap-2"
                                >
                                    {transcript.length > 0 ? <><Icons.Loop /> Start New Session</> : 'Start Practice'}
                                </button>
                                {!isWidget && transcript.length > 0 && !analysis && (
                                    <button 
                                        onClick={handleAnalyzeSession}
                                        disabled={analyzing}
                                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105 disabled:opacity-50 w-full justify-center max-w-xs flex items-center gap-2"
                                    >
                                        {analyzing ? 'Analyzing...' : <><Icons.Chart /> Generate Feedback</>}
                                    </button>
                                )}
                            </>
                        )}
                        
                        <div className="text-slate-500 text-xs font-medium mt-2 h-4">
                            {status === 'idle' && !transcript.length && (isWidget ? '' : `Scenario: ${SCENARIOS.find(s=>s.id === selectedScenarioId)?.name}`)}
                            {status === 'connecting' && 'Establishing secure link...'}
                            {status === 'connected' && 'Listening... Speak clearly.'}
                            {status === 'error' && 'Connection Error. Please try again.'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transcript / Analysis Panel */}
            {!isWidget && (transcript.length > 0 || active) && (
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col overflow-hidden min-h-[500px]">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                        {analysis ? <Icons.Chart /> : <Icons.ChatBubble />}
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase">
                            {analysis ? 'AI Performance Analysis' : 'Live Transcript'}
                        </h3>
                    </div>
                    
                    <div ref={transcriptRef} className="flex-1 overflow-y-auto pr-2">
                        {analysis ? (
                            <div className="animate-fade-in">
                                <MarkdownRenderer content={analysis} />
                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 text-xs uppercase">Transcript Reference</h4>
                                    <div className="max-h-40 overflow-y-auto opacity-70 text-xs">
                                        {transcript.map((t, i) => (
                                            <p key={i} className="mb-1"><strong className="capitalize">{t.role}:</strong> {t.text}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transcript.map((item, i) => (
                                    <div key={i} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                                            item.role === 'user' 
                                                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200 rounded-br-none' 
                                                : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-bl-none'
                                        }`}>
                                            {item.text}
                                        </div>
                                    </div>
                                ))}
                                {(currentUserTranscript || currentModelTranscript) && (
                                    <div className="flex flex-col gap-4 opacity-60">
                                        {currentUserTranscript && (
                                            <div className="flex justify-end">
                                                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-br-none italic">
                                                    {currentUserTranscript}...
                                                </div>
                                            </div>
                                        )}
                                        {currentModelTranscript && (
                                            <div className="flex justify-start">
                                                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-slate-50 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 rounded-bl-none italic">
                                                    {currentModelTranscript}...
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {transcript.length === 0 && !currentUserTranscript && !currentModelTranscript && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center opacity-60 min-h-[200px]">
                                        <p className="text-sm italic">Start the session and speak...</p>
                                        <p className="text-xs mt-1">Transcript will appear here.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default LiveSupport;