import React, { useState, useRef, useEffect } from 'react';
import { connectLiveSession, float32ToInt16, encodeAudio, decodeAudio, decodeAudioData } from '../services/geminiService';
import { getProfile } from '../services/settingsService';
import { LiveServerMessage } from "@google/genai";
import { Icons } from '../constants';
import { TranscriptItem } from '../types';

interface LiveSupportProps {
  isWidget?: boolean;
}

const LiveSupport: React.FC<LiveSupportProps> = ({ isWidget = false }) => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [volume, setVolume] = useState(0); 
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentUserTranscript, setCurrentUserTranscript] = useState('');
  const [currentModelTranscript, setCurrentModelTranscript] = useState('');
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeRef = useRef(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, currentUserTranscript, currentModelTranscript]);

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
      activeRef.current = true; 
      
      const profile = getProfile();
      const systemContext = profile 
        ? `You are a senior business coach for a company called "${profile.name}". Industry: ${profile.industry}. Brand Voice: ${profile.voice}. Help the user practice a pitch or negotiate. Be concise.`
        : "You are a senior business coach. Help the user practice a sales pitch or handle a difficult negotiation. Be concise.";

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

  useEffect(() => {
      // Cleanup on unmount
      return () => {
          stopSession();
      };
  }, []);

  return (
    <div className={`h-full flex flex-col ${isWidget ? '' : 'max-w-4xl mx-auto items-center justify-center'}`}>
        {!isWidget && (
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">AI Sales Coach</h2>
                <p className="text-slate-500 dark:text-slate-400">Practice your pitch or negotiation skills with real-time feedback.</p>
            </div>
        )}

        {isWidget && (
            <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300">
                <Icons.Mic />
                <h3 className="font-bold text-sm uppercase tracking-wide">Live Coach</h3>
            </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 w-full items-stretch justify-center h-[500px]">
            {/* Visualizer */}
            <div className={`
                flex flex-col items-center justify-center relative overflow-hidden transition-all bg-slate-900 shadow-2xl
                ${isWidget ? 'flex-1 rounded-xl p-4 w-full' : 'flex-1 rounded-3xl p-8'}
            `}>
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

                <div className="z-10 flex flex-col items-center gap-6">
                    <div className={`rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-white text-blue-600 scale-110 shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-slate-400'} ${isWidget ? 'w-16 h-16' : 'w-24 h-24'}`}>
                        {status === 'connecting' ? (
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                        ) : (
                            <div className={`${isWidget ? 'w-8 h-8' : 'w-10 h-10'}`}>
                                <Icons.Mic />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        {active ? (
                            <button 
                                onClick={stopSession}
                                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                            >
                                <Icons.Stop /> End Session
                            </button>
                        ) : (
                            <button 
                                onClick={startSession}
                                disabled={status === 'connecting'}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
                            >
                                Start Coaching
                            </button>
                        )}
                        
                        <div className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-2 h-4">
                            {status === 'idle' && 'Ready to connect'}
                            {status === 'connecting' && 'Establishing link...'}
                            {status === 'connected' && 'Listening...'}
                            {status === 'error' && 'Connection Error'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transcript Panel (Only in full view) */}
            {!isWidget && (
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                        <Icons.ChatBubble />
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase">Live Transcript</h3>
                    </div>
                    <div ref={transcriptRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {transcript.length === 0 && !currentUserTranscript && !currentModelTranscript ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center opacity-60">
                                <p className="text-sm italic">Start the session and speak...</p>
                                <p className="text-xs mt-1">Transcript will appear here.</p>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default LiveSupport;