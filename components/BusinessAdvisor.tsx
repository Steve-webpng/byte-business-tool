
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { ChatMessage, AppTool } from '../types';
import { streamChat } from '../services/geminiService';
import { getAdvisorContext, getStrategicMemory, updateStrategicMemory } from '../services/advisorService';
import MarkdownRenderer from './MarkdownRenderer';
import { useToast } from './ToastContainer';

interface BusinessAdvisorProps {
  onWorkflowSend?: (targetTool: AppTool, data: string) => void;
  onAddTask?: (title: string) => void;
}

const SUGGESTIONS = [
    "Draft a marketing strategy",
    "Analyze my project risks",
    "Write an investor update",
    "Suggest productivity hacks",
    "Review my brand voice"
];

const STORAGE_KEY = 'byete_advisor_history';

const BusinessAdvisor: React.FC<BusinessAdvisorProps> = ({ onWorkflowSend, onAddTask }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [memory, setMemory] = useState('');
  const [isEditingMemory, setIsEditingMemory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            const hydrated = parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
            setMessages(hydrated);
        } catch (e) {
            console.error("Failed to load history", e);
        }
    } else {
        setMessages([{
            role: 'model',
            text: "Hello! I'm your Chief of Staff. I have access to your Business Profile, recent projects, and saved work. How can I help you strategize today?",
            timestamp: new Date()
        }]);
    }
    setMemory(getStrategicMemory());
  }, []);

  // Save history on change
  useEffect(() => {
      if (messages.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const txt = overrideText || input;
    if (!txt.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: txt, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        const context = await getAdvisorContext();
        const aiMsgPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: new Date() };
        setMessages(prev => [...prev, aiMsgPlaceholder]);
        const stream = streamChat(userMsg.text, messages, context);
        
        let fullText = '';
        for await (const chunk of stream) {
            fullText += chunk;
            setMessages(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { ...aiMsgPlaceholder, text: fullText };
                return newHistory;
            });
        }
    } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { role: 'model', text: "I encountered an error. Please try again.", timestamp: new Date() }]);
    } finally {
        setLoading(false);
    }
  };
  
  const handleCreateTask = (text: string) => {
    if (onAddTask) {
      const potentialTitle = text.split('\n')[0].replace(/[*#]/g, '').trim();
      onAddTask(potentialTitle);
      toast.show(`Task "${potentialTitle.substring(0, 20)}..." added to Projects!`, 'success');
    }
  };

  const handleClearHistory = () => {
      if(confirm("Clear conversation history?")) {
          setMessages([{
            role: 'model',
            text: "History cleared. Ready for a new topic.",
            timestamp: new Date()
        }]);
        localStorage.removeItem(STORAGE_KEY);
      }
  };

  const handleSaveMemory = () => {
      updateStrategicMemory(memory);
      setIsEditingMemory(false);
      toast.show("Strategic Focus updated.", "success");
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg"><Icons.ChatBubble /></div>
             Chief of Staff
           </h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your context-aware AI business partner.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setIsEditingMemory(!isEditingMemory)} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg font-bold border border-indigo-100 dark:border-indigo-800">
                {isEditingMemory ? 'Cancel Strategy' : 'Set Strategy'}
            </button>
            <button onClick={handleClearHistory} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                Clear History
            </button>
        </div>
      </div>

      {isEditingMemory && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50 rounded-xl animate-fade-in">
              <h4 className="text-xs font-bold text-yellow-800 dark:text-yellow-500 uppercase mb-2 flex items-center gap-2">
                  <Icons.Star /> Strategic Focus (Long-Term Memory)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  What is the primary goal for this quarter? The Chief of Staff will remember this in every conversation.
              </p>
              <textarea 
                  value={memory}
                  onChange={(e) => setMemory(e.target.value)}
                  placeholder="e.g. Focus on Q3 Product Launch and reducing churn by 5%..."
                  className="w-full p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 mb-2"
              />
              <button onClick={handleSaveMemory} className="bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded hover:bg-yellow-700 transition-colors">
                  Save Focus
              </button>
          </div>
      )}

      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 space-y-6 mb-4">
          {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 items-end group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center flex-shrink-0 border border-indigo-100 dark:border-indigo-800 shadow-sm">
                          <Icons.ChatBubble />
                      </div>
                  )}

                  <div className="flex items-end gap-2 max-w-[85%]">
                    {msg.role === 'model' && msg.text && onAddTask && (
                        <button onClick={() => handleCreateTask(msg.text)} title="Create Task" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                            <Icons.Plus />
                        </button>
                    )}
                    {msg.role === 'model' && msg.text && onWorkflowSend && (
                        <button onClick={() => onWorkflowSend(AppTool.DOCUMENTS, msg.text)} title="Send to Doc" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                            <Icons.Share />
                        </button>
                    )}
                  
                    <div className={`w-full rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm overflow-hidden ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                    }`}>
                        {msg.role === 'user' ? (
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        ) : (
                            <MarkdownRenderer content={msg.text} />
                        )}
                        
                        {msg.text === '' && loading && idx === messages.length - 1 && (
                            <span className="animate-pulse">Thinking...</span>
                        )}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-600 shadow-sm">
                          <Icons.User />
                      </div>
                  )}
              </div>
          ))}
          <div ref={messagesEndRef} />
      </div>

      {messages.length < 3 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {SUGGESTIONS.map(s => (
                <button 
                    key={s} 
                    onClick={() => handleSend(undefined, s)}
                    className="whitespace-nowrap px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                >
                    {s}
                </button>
            ))}
        </div>
      )}

      <form onSubmit={handleSend} className="relative bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to review your tasks, draft a strategy, or suggest ideas..."
            className="w-full pl-4 pr-14 py-3 rounded-lg outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 bg-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg disabled:opacity-50 transition-colors shadow-md"
          >
              <Icons.Send />
          </button>
      </form>
    </div>
  );
};

export default BusinessAdvisor;
