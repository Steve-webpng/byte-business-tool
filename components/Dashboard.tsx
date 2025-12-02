
import React, { useEffect, useState } from 'react';
import { AppTool, SavedItem } from '../types';
import { Icons } from '../constants';
import { getSupabaseConfig, getSavedItems } from '../services/supabaseService';
import { generateDailyBriefing } from '../services/geminiService';
import { getDailyContext } from '../services/advisorService';
import MarkdownRenderer from './MarkdownRenderer';

interface DashboardProps {
  setTool: (tool: AppTool) => void;
}

const Widget = ({ title, desc, icon: Icon, onClick, color }: any) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between h-40 relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-12 rounded-bl-full opacity-5 ${color.replace('bg-', 'text-')}`}>
         <div className="scale-125 transform translate-x-2 -translate-y-2">
             <Icon />
         </div>
    </div>
    
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-2.5 rounded-lg ${color} text-white shadow-sm`}>
        <Icon />
      </div>
      <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        <Icons.ArrowRight />
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-0.5 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">{desc}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setTool }) => {
  const [recentItems, setRecentItems] = useState<SavedItem[]>([]);
  const [dbConnected, setDbConnected] = useState(false);
  
  // Daily Briefing State
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  
  // Quick Note State
  const [quickNote, setQuickNote] = useState('');

  useEffect(() => {
    const checkDb = async () => {
        const items = await getSavedItems();
        setRecentItems(items.slice(0, 5));
        const config = getSupabaseConfig();
        setDbConnected(!!config);
    };
    checkDb();
    
    // Load persisted briefing if from today
    const savedBriefing = localStorage.getItem('byete_daily_briefing');
    const savedBriefingDate = localStorage.getItem('byete_daily_briefing_date');
    const today = new Date().toDateString();
    
    if (savedBriefing && savedBriefingDate === today) {
        setBriefing(savedBriefing);
    }
    
    // Load Quick Note
    const savedNote = localStorage.getItem('byete_quick_note');
    if (savedNote) setQuickNote(savedNote);
  }, []);

  const handleGenerateBriefing = async () => {
      setBriefingLoading(true);
      try {
          const context = await getDailyContext();
          const result = await generateDailyBriefing(context);
          setBriefing(result);
          
          localStorage.setItem('byete_daily_briefing', result);
          localStorage.setItem('byete_daily_briefing_date', new Date().toDateString());
      } catch (e) {
          console.error(e);
      } finally {
          setBriefingLoading(false);
      }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setQuickNote(e.target.value);
      localStorage.setItem('byete_quick_note', e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400">Your AI-powered business command center is ready.</p>
        </div>
        <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Hero Section: Briefing & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Briefing Card */}
          <div className="lg:col-span-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col h-64">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
              
              <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Icons.Sparkles /> Morning Briefing</h3>
                  {!briefing && !briefingLoading && (
                      <button 
                        onClick={handleGenerateBriefing}
                        className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm"
                      >
                          Generate
                      </button>
                  )}
              </div>
              
              <div className="flex-1 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
                  {briefingLoading ? (
                      <div className="animate-pulse space-y-3 opacity-80">
                          <div className="h-4 bg-white/30 rounded w-3/4"></div>
                          <div className="h-4 bg-white/30 rounded w-1/2"></div>
                          <div className="h-4 bg-white/30 rounded w-5/6"></div>
                      </div>
                  ) : briefing ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                          <MarkdownRenderer content={briefing} className="text-white" />
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-80 py-4">
                          <p className="text-sm italic mb-2">Get a concise AI summary of your tasks, meetings, and alerts for today.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Quick Note Scratchpad */}
          <div className="bg-amber-50 dark:bg-slate-800 rounded-xl p-4 border border-amber-100 dark:border-slate-700 shadow-sm flex flex-col relative group h-64">
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-amber-300 dark:text-slate-600"><Icons.Pen /></div>
              </div>
              <label className="text-xs font-bold text-amber-800 dark:text-slate-400 uppercase tracking-wide mb-2 block">Quick Note</label>
              <textarea 
                  value={quickNote}
                  onChange={handleNoteChange}
                  placeholder="Jot down a thought..."
                  className="flex-1 w-full bg-transparent resize-none outline-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-amber-800/30 dark:placeholder:text-slate-600"
              />
          </div>
      </div>

      <div className="space-y-8">
          
          {/* Revenue & Growth */}
          <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">Revenue & Growth</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Widget 
                  title="Chief of Staff" 
                  desc="Your AI business partner."
                  icon={Icons.ChatBubble}
                  color="bg-indigo-500"
                  onClick={() => setTool(AppTool.ADVISOR)}
                />
                <Widget 
                  title="Strategy Hub" 
                  desc="Personas, Marketing Plans, SWOT."
                  icon={Icons.Telescope}
                  color="bg-purple-500"
                  onClick={() => setTool(AppTool.STRATEGY_HUB)}
                />
                <Widget 
                  title="Lead Prospector" 
                  desc="Find new leads with AI search."
                  icon={Icons.UserPlus}
                  color="bg-blue-500"
                  onClick={() => setTool(AppTool.PROSPECTOR)}
                />
                <Widget 
                  title="CRM Pipeline" 
                  desc="Manage contacts and deals."
                  icon={Icons.Identification}
                  color="bg-indigo-500"
                  onClick={() => setTool(AppTool.CRM)}
                />
              </div>
          </div>

          {/* Creation & Content */}
          <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">Creative Studio</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Widget 
                  title="Content Studio" 
                  desc="Draft posts, emails, and blogs."
                  icon={Icons.Pen}
                  color="bg-pink-500"
                  onClick={() => setTool(AppTool.CONTENT)}
                />
                <Widget 
                  title="Video Studio" 
                  desc="Turn audio into social videos."
                  icon={Icons.Film}
                  color="bg-red-500"
                  onClick={() => setTool(AppTool.VIDEO_STUDIO)}
                />
                <Widget 
                  title="Email Marketing" 
                  desc="Campaigns and automations."
                  icon={Icons.Mail}
                  color="bg-orange-500"
                  onClick={() => setTool(AppTool.EMAIL_MARKETING)}
                />
                <Widget 
                  title="Audio Studio" 
                  desc="Text-to-speech generation."
                  icon={Icons.SpeakerWave}
                  color="bg-cyan-500"
                  onClick={() => setTool(AppTool.AUDIO_STUDIO)}
                />
              </div>
          </div>

          {/* Analysis */}
          <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">Intelligence & Ops</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Widget 
                  title="Market Research" 
                  desc="Competitor and trend analysis."
                  icon={Icons.Search}
                  color="bg-teal-500"
                  onClick={() => setTool(AppTool.RESEARCH)}
                />
                <Widget 
                  title="Data Analysis" 
                  desc="Visualize CSVs or chart images."
                  icon={Icons.Chart}
                  color="bg-sky-500"
                  onClick={() => setTool(AppTool.ANALYSIS)}
                />
                <Widget 
                  title="Projects" 
                  desc="Kanban board and tasks."
                  icon={Icons.Board}
                  color="bg-emerald-500"
                  onClick={() => setTool(AppTool.PROJECTS)}
                />
                <Widget 
                  title="App Library" 
                  desc="200+ specialized micro-tools."
                  icon={Icons.Apps}
                  color="bg-slate-500"
                  onClick={() => setTool(AppTool.LIBRARY)}
                />
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
