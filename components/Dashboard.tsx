import React, { useEffect, useState } from 'react';
import { AppTool, SavedItem } from '../types';
import { Icons } from '../constants';
import { getSupabaseConfig, getSavedItems } from '../services/supabaseService';

interface DashboardProps {
  setTool: (tool: AppTool) => void;
}

const Widget = ({ title, desc, icon: Icon, onClick, color }: any) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group flex flex-col justify-between h-48 relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-16 rounded-bl-full opacity-5 ${color.replace('bg-', 'text-')}`}>
         <div className="scale-150 transform translate-x-4 -translate-y-4">
             <Icon />
         </div>
    </div>
    
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-3 rounded-lg ${color} text-white shadow-sm`}>
        <Icon />
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        <Icons.ArrowRight />
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">{desc}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setTool }) => {
  const [recentItems, setRecentItems] = useState<SavedItem[]>([]);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    const checkDb = async () => {
        const items = await getSavedItems();
        setRecentItems(items.slice(0, 5));
        const config = getSupabaseConfig();
        setDbConnected(!!config);
    };
    checkDb();
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Welcome Back</h1>
        <p className="text-slate-500 dark:text-slate-400">Your AI-powered business command center is ready.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Widget 
          title="Create Content" 
          desc="Generate emails, blog posts, and marketing copy."
          icon={Icons.Pen}
          color="bg-purple-500"
          onClick={() => setTool(AppTool.CONTENT)}
        />
        <Widget 
          title="Market Research" 
          desc="Analyze competitors and trends with real-time search."
          icon={Icons.Search}
          color="bg-blue-500"
          onClick={() => setTool(AppTool.RESEARCH)}
        />
        <Widget 
          title="File Chat" 
          desc="Upload a document and ask questions about its content."
          icon={Icons.Upload}
          color="bg-emerald-500"
          onClick={() => setTool(AppTool.FILE_CHAT)}
        />
        <Widget 
          title="Sales Coach" 
          desc="Practice pitches with real-time AI voice feedback."
          icon={Icons.Mic}
          color="bg-rose-500"
          onClick={() => setTool(AppTool.COACH)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
        {/* Gemini Promo / Feature Highlight */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-white relative overflow-hidden flex flex-col justify-center shadow-lg">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20"></div>
            
            <div className="relative z-10 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold mb-6 backdrop-blur-sm">
                    <Icons.Sparkles /> 
                    <span>POWERED BY GEMINI AI</span>
                </div>
                
                <h3 className="text-3xl font-bold mb-4 leading-tight">Next-Gen Multimodal Intelligence</h3>
                <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                    Experience low-latency reasoning across text, audio, and vision. 
                    Upload documents for instant analysis, practice negotiations with a real-time voice coach, 
                    or generate live market reports grounded in Google Search.
                </p>
                
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => setTool(AppTool.MISSION_CONTROL)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                    >
                        <Icons.Grid /> Open Mission Control
                    </button>
                    <button 
                        onClick={() => setTool(AppTool.LIBRARY)}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold transition-all backdrop-blur-sm flex items-center gap-2 border border-white/10"
                    >
                        <Icons.Apps /> Browse Tools
                    </button>
                </div>
            </div>
        </div>

        {/* Recent Activity / DB Widget */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden h-full min-h-[400px]">
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center backdrop-blur-sm">
                 <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                     <Icons.History /> Recent Saved Work
                 </h4>
                 {dbConnected ? (
                     <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">CLOUD</span>
                 ) : (
                     <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold border border-slate-200">LOCAL</span>
                 )}
             </div>
             
             <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                 {recentItems.length > 0 ? (
                     recentItems.map(item => (
                         <div 
                            key={item.id} 
                            onClick={() => setTool(AppTool.DATABASE)}
                            className="p-4 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-sm cursor-pointer transition-all group bg-white dark:bg-slate-800"
                         >
                             <div className="flex items-center justify-between mb-2">
                                 <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border 
                                    ${item.tool_type === 'Content' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                                      item.tool_type === 'Research' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                      'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                     {item.tool_type}
                                 </span>
                                 <span className="text-[10px] text-slate-400 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                             </div>
                             <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</p>
                             <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-1">{item.content.substring(0, 50)}...</p>
                         </div>
                     ))
                 ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center opacity-60">
                         <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                             <Icons.Database />
                         </div>
                         <p className="text-sm font-medium">No saved items yet.</p>
                         <p className="text-xs mt-1">Generated content will appear here.</p>
                     </div>
                 )}
             </div>
             
             {recentItems.length > 0 && (
                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <button 
                        onClick={() => setTool(AppTool.DATABASE)}
                        className="w-full text-center text-xs font-bold text-slate-500 hover:text-blue-600 uppercase tracking-wider transition-colors py-2"
                    >
                        View All Activity
                    </button>
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;