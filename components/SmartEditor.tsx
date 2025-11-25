import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { editContentWithAI } from '../services/geminiService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import { saveItem, getSavedItems } from '../services/supabaseService';
import { SavedItem } from '../types';

interface SmartEditorProps {
  workflowData?: string | null;
  clearWorkflowData?: () => void;
}

const TEMPLATES = [
  { name: "Meeting Notes", text: "Date:\nAttendees:\n\nAgenda:\n1.\n2.\n\nAction Items:\n- [ ] " },
  { name: "Project Proposal", text: "# Project Title\n\n## Executive Summary\n[Brief overview]\n\n## Objectives\n- Goal 1\n- Goal 2\n\n## Timeline\n[Dates]" },
  { name: "Invoice", text: "INVOICE #001\n\nBill To:\n[Client Name]\n\nItems:\n1. Service A - $500\n2. Service B - $200\n\nTotal: $700" },
  { name: "Memo", text: "TO: All Staff\nFROM: Management\nDATE: \nSUBJECT: \n\n[Body text]" }
];

const SmartEditor: React.FC<SmartEditorProps> = ({ workflowData, clearWorkflowData }) => {
  const [docs, setDocs] = useState<SavedItem[]>([]);
  const [currentDocId, setCurrentDocId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    refreshDocs();
  }, []);

  useEffect(() => {
    if (workflowData && clearWorkflowData) {
      handleCreateNew();
      setContent(workflowData);
      setTitle("New Document from Workflow");
      clearWorkflowData();
    }
  }, [workflowData, clearWorkflowData]);

  const refreshDocs = async () => {
    const items = await getSavedItems();
    const docItems = items.filter(i => i.tool_type === 'SmartDoc');
    setDocs(docItems);
  };

  const handleCreateNew = () => {
    setCurrentDocId(null);
    setTitle('Untitled Document');
    setContent('');
    setSelection('');
  };

  const handleSelectDoc = (doc: SavedItem) => {
    setCurrentDocId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    const docTitle = title || 'Untitled Document';
    const res = await saveItem('SmartDoc', docTitle, content);
    if (res.success) {
      refreshDocs();
    }
  };

  const handleTextSelect = () => {
    if (!editorRef.current) return;
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    if (start !== end) {
      setSelection(content.substring(start, end));
    } else {
      setSelection('');
    }
  };

  const insertTemplate = (text: string) => {
      setContent(prev => prev + (prev ? "\n\n" : "") + text);
      setShowTemplates(false);
  };

  const handleAiAction = async (actionType: 'write' | 'rewrite') => {
    if (!aiPrompt && actionType === 'write') return; 
    
    setLoading(true);
    try {
      const profile = getProfile();
      const context = formatProfileForPrompt(profile);
      
      let instruction = aiPrompt;
      let textToProcess = selection;

      if (actionType === 'write') {
        textToProcess = ""; 
        instruction = `Write the following: ${aiPrompt}`;
      } else {
         if (!aiPrompt) instruction = "Improve this text, fix grammar, and make it more professional.";
      }

      const result = await editContentWithAI(textToProcess, instruction, context);

      if (actionType === 'write') {
         const cursor = editorRef.current?.selectionStart || content.length;
         const newContent = content.slice(0, cursor) + result + content.slice(cursor);
         setContent(newContent);
      } else {
         if (editorRef.current) {
             const start = editorRef.current.selectionStart;
             const end = editorRef.current.selectionEnd;
             const newContent = content.substring(0, start) + result + content.substring(end);
             setContent(newContent);
         }
      }
      
      setAiPrompt('');
      setSelection('');
    } catch (e) {
      console.error(e);
      alert("AI Error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
              h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
              p { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <p>${content}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="h-full flex gap-6 max-w-7xl mx-auto">
      {/* Sidebar List */}
      <div className="w-64 flex-shrink-0 flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hidden md:flex">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
           <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase">Documents</h3>
           <button onClick={handleCreateNew} className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-1.5 rounded transition-colors">
              <Icons.Plus />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
           {docs.length === 0 && (
               <div className="text-center p-8 text-slate-400 text-xs italic">No saved docs</div>
           )}
           {docs.map(doc => (
               <button 
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc)}
                  className={`w-full text-left p-3 rounded-lg text-sm truncate transition-colors ${currentDocId === doc.id ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'}`}
               >
                   {doc.title}
               </button>
           ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
         {/* Toolbar */}
         <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-10">
             <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Document"
                className="text-xl font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-300 outline-none bg-transparent"
             />
             <div className="flex gap-2 relative">
                 <button 
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                 >
                     <Icons.Briefcase /> Templates
                 </button>
                 
                 {showTemplates && (
                     <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-48 py-1 z-30">
                         {TEMPLATES.map(t => (
                             <button 
                                key={t.name}
                                onClick={() => insertTemplate(t.text)}
                                className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600"
                             >
                                 {t.name}
                             </button>
                         ))}
                     </div>
                 )}

                 <button 
                    onClick={handlePrint}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Export PDF / Print"
                 >
                    <Icons.Printer />
                 </button>
                 <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                 >
                    <Icons.Save /> Save
                 </button>
             </div>
         </div>

         {/* Text Area */}
         <div className="flex-1 relative bg-slate-50 dark:bg-slate-900/50 overflow-hidden flex flex-col">
             <textarea 
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={handleTextSelect}
                className="flex-1 w-full p-8 outline-none resize-none font-serif text-lg leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-inner"
                placeholder="Start typing or use the AI bar below..."
             />

             {/* AI Bar */}
             <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-xl z-20">
                 <div className="max-w-3xl mx-auto flex flex-col gap-2">
                    {selection && (
                         <div className="flex gap-2 pb-2 border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
                             <span className="text-xs font-bold text-slate-400 uppercase px-2 py-1 whitespace-nowrap">Selected:</span>
                             <button onClick={() => { setAiPrompt("Fix grammar and spelling"); handleAiAction('rewrite'); }} className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 px-3 py-1 rounded-full whitespace-nowrap">Fix Grammar</button>
                             <button onClick={() => { setAiPrompt("Make it more professional"); handleAiAction('rewrite'); }} className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 px-3 py-1 rounded-full whitespace-nowrap">Make Professional</button>
                             <button onClick={() => { setAiPrompt("Shorten this"); handleAiAction('rewrite'); }} className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 px-3 py-1 rounded-full whitespace-nowrap">Shorten</button>
                         </div>
                     )}
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg">
                             <Icons.Sparkles />
                         </div>
                         <input 
                            type="text" 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder={selection ? "Ask AI to rewrite selected text..." : "Ask AI to write something..."}
                            className="flex-1 outline-none text-sm bg-transparent"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAiAction(selection ? 'rewrite' : 'write');
                                }
                            }}
                         />
                         <button 
                            disabled={loading || !aiPrompt}
                            onClick={() => handleAiAction(selection ? 'rewrite' : 'write')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50 shadow-md"
                         >
                            {loading ? 'Working...' : (selection ? 'Rewrite' : 'Write')}
                         </button>
                     </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default SmartEditor;