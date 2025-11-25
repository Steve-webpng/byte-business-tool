import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Icons } from '../constants';
import { ChatMessage, AppTool } from '../types';
import { streamChat } from '../services/geminiService';
import { useToast } from './ToastContainer';
import MarkdownRenderer from './MarkdownRenderer';

// Configure the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const FileChat: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState<'idle' | 'parsing' | 'thinking'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading('parsing');
    setMessages([]);
    setExtractedText('');

    try {
        if (selectedFile.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => ('str' in item) ? item.str : '').join(' ');
                }
                setExtractedText(fullText);
                toast.show("PDF processed successfully!", "success");
            };
            reader.readAsArrayBuffer(selectedFile);
        } else if (selectedFile.type === 'text/plain') {
            const text = await selectedFile.text();
            setExtractedText(text);
            toast.show("Text file loaded!", "success");
        } else {
            toast.show("Unsupported file type. Please use PDF or TXT.", "error");
            setFile(null);
        }
    } catch(e) {
        toast.show("Failed to parse the file.", "error");
        setFile(null);
    } finally {
        setLoading('idle');
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) handleFileChange(droppedFile);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading !== 'idle' || !extractedText) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading('thinking');

    try {
        const systemInstruction = `You are an expert document analyst. The user has uploaded a document with the following content. Your task is to answer questions based ONLY on the information provided in this document. Do not use external knowledge unless specifically asked. If the answer is not in the document, say so.
        \n--- DOCUMENT START ---\n${extractedText}\n--- DOCUMENT END ---`;
        
        const aiMsgPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: new Date() };
        setMessages(prev => [...prev, aiMsgPlaceholder]);
        
        const stream = streamChat(userMsg.text, messages, systemInstruction);
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
        setMessages(prev => [...prev, { role: 'model', text: "I encountered an error. Please check your API key and try again.", timestamp: new Date() }]);
        toast.show("An error occurred while communicating with the AI.", "error");
    } finally {
        setLoading('idle');
    }
  };

  const reset = () => {
    setFile(null);
    setExtractedText('');
    setMessages([]);
  };

  // --- Initial Upload View ---
  if (!file || !extractedText) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">AI File Chat</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Upload a PDF or TXT document to start asking questions.</p>

            <div 
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 transition-all hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.txt"
                    onChange={(e) => handleFileChange(e.target.files?.[0] as File)}
                />
                {loading === 'parsing' ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                        <p className="font-bold">Processing Document...</p>
                        <p className="text-sm">This may take a moment for large files.</p>
                    </div>
                ) : (
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800">
                            <Icons.Upload />
                        </div>
                        <p className="font-bold text-slate-700 dark:text-slate-300">Drag & drop your file here</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">or <span className="text-blue-600 font-semibold">browse files</span></p>
                    </label>
                )}
            </div>
        </div>
    );
  }

  // --- Chat View ---
  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
        <div className="flex items-center gap-3 min-w-0">
           <div className="p-2 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg"><Icons.DocumentText /></div>
           <div className="flex-1 min-w-0">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Ready to answer your questions.</p>
           </div>
        </div>
        <button onClick={reset} className="text-sm font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-900 px-4 py-2 rounded-lg transition-colors">
            New File
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 space-y-6 mb-4">
          {messages.length === 0 && (
             <div className="h-full flex items-center justify-center">
                 <p className="text-slate-400 italic">Ask a question about the document to begin.</p>
             </div>
          )}
          {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 items-end group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-800 shadow-sm">
                          <Icons.ChatBubble />
                      </div>
                  )}
                  
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm overflow-hidden ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                  }`}>
                      <MarkdownRenderer content={msg.text} />
                      {msg.text === '' && loading === 'thinking' && idx === messages.length - 1 && (
                          <span className="animate-pulse">Thinking...</span>
                      )}
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

      <form onSubmit={handleSend} className="relative bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'Summarize page 3' or 'What are the key risks mentioned?'"
            className="w-full pl-4 pr-14 py-3 rounded-lg outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 bg-transparent"
            disabled={loading !== 'idle'}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading !== 'idle'}
            className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg disabled:opacity-50 transition-colors shadow-md"
          >
              <Icons.Send />
          </button>
      </form>
    </div>
  );
};

export default FileChat;