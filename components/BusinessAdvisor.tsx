import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { ChatMessage } from '../types';
import { streamChat } from '../services/geminiService';
import { getAdvisorContext } from '../services/advisorService';
import MarkdownRenderer from './MarkdownRenderer';

const SUGGESTIONS = [
    "Draft a marketing strategy",
    "Analyze my project risks",
    "Write an investor update",
    "Suggest productivity hacks",
    "Review my brand voice"
];

const BusinessAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Greeting
    if (messages.length === 0) {
        setMessages([{
            role: 'model',
            text: "Hello! I'm your Chief of Staff. I have access to your Business Profile, recent projects, and saved work. How can I help you strategize today?",
            timestamp: new Date()
        }]);
    }
  }, []);

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

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Icons.ChatBubble /></div>
             Chief of Staff
           </h2>
           <p className="text-slate-500 text-sm mt-1">Your context-aware AI business partner.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6 mb-4">
          {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 border border-indigo-100 shadow-sm">
                          <Icons.ChatBubble />
                      </div>
                  )}
                  
                  <div className={`max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm overflow-hidden ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}>
                      {/* User messages are text, AI messages are Markdown */}
                      {msg.role === 'user' ? (
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                      ) : (
                          <MarkdownRenderer content={msg.text} />
                      )}
                      
                      {msg.text === '' && loading && idx === messages.length - 1 && (
                          <span className="animate-pulse">Thinking...</span>
                      )}
                  </div>

                  {msg.role === 'user' && (
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-sm">
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
                    className="whitespace-nowrap px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                >
                    {s}
                </button>
            ))}
        </div>
      )}

      <form onSubmit={handleSend} className="relative bg-white rounded-xl shadow-lg border border-slate-200 p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to review your tasks, draft a strategy, or suggest ideas..."
            className="w-full pl-4 pr-14 py-3 rounded-lg outline-none text-slate-800 placeholder:text-slate-400"
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