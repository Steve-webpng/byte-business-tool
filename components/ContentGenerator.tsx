

import React, { useState, useRef, useEffect } from 'react';
import { generateMarketingContent, generateMarketingCampaign, generateImage, generateSpeech, decodeAudio, decodeAudioData, analyzeSEO, editContentWithAI, analyzeBrandVoice } from '../services/geminiService';
import { saveItem, getSupabaseConfig, getSavedItems } from '../services/supabaseService';
import { getProfile, formatProfileForPrompt, getCustomVoices, saveCustomVoice, deleteCustomVoice } from '../services/settingsService';
import { MarketingCampaign, SavedItem, AppTool, SEOResult } from '../types';
import { Icons } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';
import { useToast } from './ToastContainer';

interface ContentGeneratorProps {
  isWidget?: boolean;
  workflowData?: string | null;
  clearWorkflowData?: () => void;
  onWorkflowSend?: (targetTool: AppTool, data: string) => void;
}

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ isWidget = false, workflowData, clearWorkflowData, onWorkflowSend }) => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Email');
  const [tone, setTone] = useState('Professional');
  const [customTone, setCustomTone] = useState('');
  const [mode, setMode] = useState<'Single' | 'Campaign' | 'Image' | 'VoiceMatch'>('Single');
  const [generatedText, setGeneratedText] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [campaign, setCampaign] = useState<MarketingCampaign | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'linkedin' | 'twitter'>('email');
  const [showPreview, setShowPreview] = useState(false);
  const [recentDrafts, setRecentDrafts] = useState<SavedItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Custom Tones
  const [savedTones, setSavedTones] = useState<string[]>([]);
  
  // Power-up states
  const [seoResult, setSeoResult] = useState<SEOResult | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [voiceSample, setVoiceSample] = useState('');
  
  // Audio state
  const [speaking, setSpeaking] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [isDictating, setIsDictating] = useState(false);
  const recognitionRef = useRef<any>(null);
  const toast = useToast();

  useEffect(() => {
    if (workflowData && clearWorkflowData) {
      setTopic(workflowData);
      clearWorkflowData();
    }
    refreshHistory();
    setSavedTones(getCustomVoices());
  }, [workflowData, clearWorkflowData]);

  // Cleanup audio on unmount
  useEffect(() => {
      return () => {
          if (audioSourceRef.current) audioSourceRef.current.stop();
          if (audioCtxRef.current) audioCtxRef.current.close();
      };
  }, []);

  const refreshHistory = async () => {
      const items = await getSavedItems();
      setRecentDrafts(items.filter(i => i.tool_type === 'Content').slice(0, 5));
  }

  const handleSaveCustomTone = () => {
      if(!customTone) return;
      saveCustomVoice(customTone);
      setSavedTones(getCustomVoices());
      toast.show("Custom tone saved!", "success");
  }

  const handleDeleteCustomTone = (t: string) => {
      deleteCustomVoice(t);
      setSavedTones(getCustomVoices());
      toast.show("Custom tone deleted.", "info");
  }

  const handleGenerate = async () => {
    if (!topic && mode !== 'VoiceMatch') return;
    setLoading(true);
    setGeneratedText('');
    setGeneratedImage('');
    setCampaign(null);
    setSeoResult(null);
    
    try {
      const profile = getProfile();
      const context = formatProfileForPrompt(profile);
      const finalTone = customTone || tone;

      if (mode === 'Image') {
          const imgBase64 = await generateImage(topic);
          setGeneratedImage(imgBase64);
      } else if (mode === 'Campaign') {
          const camp = await generateMarketingCampaign(topic, finalTone, context);
          setCampaign(camp);
          setActiveTab('email');
      } else if (mode === 'VoiceMatch') {
          if(!voiceSample) throw new Error("Please enter sample text.");
          const voiceAnalysis = await analyzeBrandVoice(voiceSample);
          setCustomTone(voiceAnalysis);
          setTone('Custom');
          setMode('Single'); // Switch back to generator with new tone
          toast.show("Brand voice extracted! You can now generate content.", "success");
      } else {
          const text = await generateMarketingContent(topic, type, finalTone, context);
          setGeneratedText(text);
      }
    } catch (e: any) {
      console.error(e);
      toast.show(e.message || "Generation failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSEO = async () => {
      if (!generatedText) return;
      setSeoLoading(true);
      try {
          const res = await analyzeSEO(generatedText);
          setSeoResult(res);
      } catch(e) {
          toast.show("SEO Analysis failed.", "error");
      } finally {
          setSeoLoading(false);
      }
  };

  const handleModifyText = async (instruction: string) => {
      if (!generatedText) return;
      setLoading(true);
      try {
          const res = await editContentWithAI(generatedText, instruction);
          setGeneratedText(res);
          setSeoResult(null); // Reset SEO as content changed
          toast.show("Content updated!", "success");
      } catch(e) {
          toast.show("Update failed.", "error");
      } finally {
          setLoading(false);
      }
  }

  const handleSave = async () => {
    setSaving(true);
    let contentToSave = '';
    let title = topic.substring(0, 30);

    if (mode === 'Single') contentToSave = generatedText;
    else if (mode === 'Campaign') contentToSave = JSON.stringify(campaign, null, 2);
    else if (mode === 'Image') contentToSave = generatedImage;

    if (!contentToSave) return;

    const res = await saveItem('Content', title, contentToSave);
    if (res.success) {
        toast.show("Content saved successfully!", "success");
        refreshHistory();
    } else {
        toast.show(`Failed to save: ${res.error}`, "error");
    }
    setSaving(false);
  };

  const downloadImage = () => {
      if (!generatedImage) return;
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- Realistic TTS Logic ---
  const handleSpeak = async () => {
      if (speaking) {
          stopSpeaking();
          return;
      }

      let textToSpeak = '';
      if (mode === 'Single') textToSpeak = generatedText;
      else if (mode === 'Campaign' && campaign) {
          if (activeTab === 'email') textToSpeak = campaign.emailBody;
          else if (activeTab === 'linkedin') textToSpeak = campaign.linkedinPost;
          else if (activeTab === 'twitter') textToSpeak = campaign.twitterThread.join('. ');
      }

      // Clean markdown
      textToSpeak = textToSpeak.replace(/[*#_\[\]|]/g, ' ').replace(/<[^>]*>?/gm, '');

      if (!textToSpeak) return;

      setAudioLoading(true);
      try {
          const base64Audio = await generateSpeech(textToSpeak, selectedVoice);
          
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
              setTopic(prev => prev + (prev ? " " : "") + transcript);
              setIsDictating(false);
          };
          recognition.start();
          setIsDictating(true);
          recognitionRef.current = recognition;
      }
  };

  return (
    <div className={`h-full flex flex-col ${isWidget ? '' : 'max-w-6xl mx-auto'}`}>
      {!isWidget && (
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">Content Studio</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Draft professional emails, posts, and generate brand visuals.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                 <button 
                    onClick={() => setShowHistory(!showHistory)} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400"
                    title="History"
                 >
                     <Icons.History />
                 </button>
                 {showHistory && (
                     <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
                         <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Recent Drafts</div>
                         {recentDrafts.map(d => (
                             <button 
                                key={d.id}
                                onClick={() => { setGeneratedText(d.content); setShowHistory(false); }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 last:border-0 truncate"
                             >
                                 {d.title}
                             </button>
                         ))}
                     </div>
                 )}
             </div>
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => setMode('Single')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'Single' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Text
                </button>
                <button 
                    onClick={() => setMode('Campaign')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'Campaign' ? 'bg-white dark:bg-slate-700 shadow text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Campaign
                </button>
                <button 
                    onClick={() => setMode('Image')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'Image' ? 'bg-white dark:bg-slate-700 shadow text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Image
                </button>
                <button 
                    onClick={() => setMode('VoiceMatch')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'VoiceMatch' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Voice Match
                </button>
             </div>
          </div>
        </div>
      )}

      {isWidget && (
        <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300">
          <Icons.Pen />
          <h3 className="font-bold text-sm uppercase tracking-wide">Content Studio</h3>
        </div>
      )}

      <div className={`grid ${isWidget ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-12 gap-6'} flex-1 min-h-0`}>
        {/* Controls */}
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col ${isWidget ? 'p-3' : 'p-6 h-fit lg:col-span-4'}`}>
          
          {mode === 'VoiceMatch' ? (
              <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Brand Voice Clone</h3>
                  <p className="text-xs text-slate-500">Paste a sample of your writing (blog post, email, etc.). The AI will analyze your style and create a custom tone preset.</p>
                  <textarea 
                      value={voiceSample}
                      onChange={e => setVoiceSample(e.target.value)}
                      className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 h-32"
                      placeholder="Paste your writing sample here..."
                  />
                  <button onClick={handleGenerate} disabled={loading || !voiceSample} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">
                      {loading ? 'Analyzing...' : 'Extract Style'}
                  </button>
              </div>
          ) : (
              <>
                {mode !== 'Image' && (
                    <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Format</label>
                                <select 
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                                >
                                    <option>Email</option>
                                    <option>LinkedIn Post</option>
                                    <option>Twitter Thread</option>
                                    <option>Blog Post</option>
                                    <option>Press Release</option>
                                    <option>Ad Copy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Tone</label>
                                <select 
                                    value={tone}
                                    onChange={(e) => { 
                                        const val = e.target.value;
                                        setTone(val);
                                        if(val !== 'Custom') {
                                            const saved = savedTones.find(t => t === val);
                                            setCustomTone(saved || ''); 
                                        } else {
                                            setCustomTone('');
                                        }
                                    }}
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                                >
                                    <option>Professional</option>
                                    <option>Friendly</option>
                                    <option>Persuasive</option>
                                    <option>Witty</option>
                                    <option>Urgent</option>
                                    <optgroup label="Saved Voices">
                                        {savedTones.map(t => <option key={t} value={t}>{t.substring(0, 15)}...</option>)}
                                    </optgroup>
                                    <option value="Custom">Custom / New</option>
                                </select>
                            </div>
                        </div>
                        {(tone === 'Custom' || savedTones.includes(tone)) && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Voice Description</label>
                                <textarea 
                                    value={customTone}
                                    onChange={(e) => { setCustomTone(e.target.value); setTone('Custom'); }}
                                    placeholder="e.g. 'Like Steve Jobs' or paste analysis"
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 outline-none h-16 mb-2"
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleSaveCustomTone} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Save Tone</button>
                                    {savedTones.includes(customTone) && (
                                        <button onClick={() => handleDeleteCustomTone(customTone)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="space-y-5">
                    <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex justify-between">
                        <span>Topic / Prompt</span>
                        <button onClick={toggleDictation} className={`${isDictating ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-blue-500'}`} title="Dictate">
                            <Icons.Mic />
                        </button>
                    </label>
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className={`w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 ${isWidget ? 'h-20 text-sm' : 'min-h-[140px]'}`}
                        placeholder={isDictating ? "Listening..." : "e.g. Announce a summer sale..."}
                    />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !topic}
                        className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-md hover:shadow-lg
                            ${loading ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' : 
                            mode === 'Image' ? 'bg-pink-600 hover:bg-pink-700' : 
                            mode === 'Campaign' ? 'bg-purple-600 hover:bg-purple-700' :
                            'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generating...
                            </span>
                        ) : (
                            mode === 'Image' ? 'Generate Image' : 'Generate Content'
                        )}
                    </button>
                </div>
              </>
          )}
        </div>

        {/* Output */}
        <div className={`${isWidget ? 'col-span-1' : 'lg:col-span-8'} bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col ${isWidget ? 'h-64' : 'min-h-[500px]'}`}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide flex items-center gap-2">
                {mode === 'Image' ? <Icons.Photo /> : <Icons.DocumentText />} Result
            </h3>
            <div className="flex gap-2 items-center">
                 {generatedText && mode !== 'Image' && (
                     <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border ${showPreview ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-500 bg-white border-slate-200 hover:bg-slate-50'}`}
                     >
                         {showPreview ? 'Edit' : 'Preview'}
                     </button>
                 )}
                 {onWorkflowSend && (generatedText || campaign) && (
                    <button onClick={() => {
                        let data = generatedText;
                        if(campaign) {
                            if(activeTab === 'email') data = `Subject: ${campaign.emailSubject}\n\n${campaign.emailBody}`;
                            else if(activeTab === 'linkedin') data = campaign.linkedinPost;
                            else if(activeTab === 'twitter') data = campaign.twitterThread.join('\n\n');
                        }
                        onWorkflowSend(AppTool.DOCUMENTS, data);
                    }}
                    className="text-xs flex items-center gap-1 font-bold px-3 py-1.5 rounded-lg transition-colors text-slate-500 dark:text-slate-300 hover:text-blue-600 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    >
                        <Icons.Share /> Send to Doc
                    </button>
                 )}
                 
                 {(generatedText || campaign) && (
                     <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 rounded-lg p-0.5 border border-slate-200 dark:border-slate-600 ml-2">
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

                 {getSupabaseConfig() && (generatedText || campaign || generatedImage) && (
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        {saving ? 'Saving...' : <><Icons.Save /> SAVE</>}
                    </button>
                 )}
                 {generatedImage && (
                     <button 
                        onClick={downloadImage}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-bold bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                     >
                         <Icons.Download />
                     </button>
                 )}
            </div>
          </div>

          <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 p-6 overflow-y-auto relative">
            {mode === 'Image' ? (
                generatedImage ? (
                    <div className="flex items-center justify-center h-full">
                        <img src={generatedImage} alt="Generated" className="max-h-full max-w-full rounded-lg shadow-lg" />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <Icons.Photo />
                        <p className="text-sm mt-2">Image will appear here</p>
                    </div>
                )
            ) : mode === 'Campaign' && campaign ? (
                <div className="flex flex-col h-full">
                    <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <button onClick={() => setActiveTab('email')} className={`px-3 py-1 text-sm font-bold rounded-md ${activeTab === 'email' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Email</button>
                        <button onClick={() => setActiveTab('linkedin')} className={`px-3 py-1 text-sm font-bold rounded-md ${activeTab === 'linkedin' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>LinkedIn</button>
                        <button onClick={() => setActiveTab('twitter')} className={`px-3 py-1 text-sm font-bold rounded-md ${activeTab === 'twitter' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Twitter</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {activeTab === 'email' && (
                            <div>
                                <div className="font-bold text-slate-700 dark:text-slate-300 mb-2">Subject: {campaign.emailSubject}</div>
                                <MarkdownRenderer content={campaign.emailBody} />
                            </div>
                        )}
                        {activeTab === 'linkedin' && <MarkdownRenderer content={campaign.linkedinPost} />}
                        {activeTab === 'twitter' && (
                            <div className="space-y-4">
                                {campaign.twitterThread.map((tweet, i) => (
                                    <div key={i} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                                        <div className="text-xs font-bold text-slate-400 mb-1">Tweet {i+1}/{campaign.twitterThread.length}</div>
                                        {tweet}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                generatedText ? (
                    <>
                        {showPreview ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="bg-white rounded-lg shadow border border-gray-200 w-full max-w-md p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                        <div>
                                            <div className="h-3 w-24 bg-gray-200 rounded mb-1"></div>
                                            <div className="h-2 w-16 bg-gray-100 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-800 space-y-2 whitespace-pre-wrap">
                                        {generatedText}
                                    </div>
                                    <div className="h-48 bg-gray-100 rounded mt-3 flex items-center justify-center text-gray-400 text-xs">Image Placeholder</div>
                                    <div className="flex justify-between mt-3 px-2">
                                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-4">Simulated Social Media Preview</p>
                            </div>
                        ) : (
                            <>
                                {seoResult && (
                                    <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase flex items-center gap-2"><Icons.Chart /> SEO Score</h4>
                                            <span className={`text-sm font-bold px-2 py-1 rounded ${seoResult.score > 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{seoResult.score}/100</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 mb-3">
                                            <div>
                                                <strong>Readability:</strong> {seoResult.readability}
                                            </div>
                                            <div>
                                                <strong>Keywords:</strong> {seoResult.keywords.join(', ')}
                                            </div>
                                        </div>
                                        {seoResult.suggestions.length > 0 && (
                                            <div className="text-xs bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700">
                                                <strong className="block mb-1 text-slate-500">Suggestions:</strong>
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {seoResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <MarkdownRenderer content={generatedText} />
                                
                                {/* Power-Up Toolbar */}
                                <div className="absolute bottom-4 right-4 flex gap-2">
                                    <button 
                                        onClick={handleAnalyzeSEO} 
                                        disabled={seoLoading}
                                        className="text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
                                    >
                                        {seoLoading ? 'Analyzing...' : <><Icons.Chart /> Check SEO</>}
                                    </button>
                                    <button 
                                        onClick={() => handleModifyText("Translate this to Spanish")}
                                        className="text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
                                    >
                                        <Icons.Globe /> Translate
                                    </button>
                                    <button 
                                        onClick={() => handleModifyText("Make this text shorter and more punchy")}
                                        className="text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                                    >
                                        Shorten
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <div className="mb-2 text-slate-300 dark:text-slate-600"><Icons.DocumentText /></div>
                        <p className="italic">Output will appear here...</p>
                    </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;
