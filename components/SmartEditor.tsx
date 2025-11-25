import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { editContentWithAI } from '../services/geminiService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import { saveItem, getSavedItems } from '../services/supabaseService';
import { SavedItem } from '../types';

const SmartEditor: React.FC = () => {
  const [docs, setDocs] = useState<SavedItem[]>([]);
  const [currentDocId, setCurrentDocId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    refreshDocs();
  }, []);

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
      <div className="w-64 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-slate-700 text-sm uppercase">Documents</h3>
           <button onClick={handleCreateNew} className="text-blue-600 hover:bg-blue-100 p-1.5 rounded transition-colors">
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
                  className={`w-full text-left p-3 rounded-lg text-sm truncate transition-colors ${currentDocId === doc.id ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100' : 'hover:bg-slate-50 text-slate-600'}`}
               >
                   {doc.title}
               </button>
           ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
         {/* Toolbar */}
         <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
             <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Document"
                className="text-xl font-bold text-slate-800 placeholder:text-slate-300 outline-none bg-transparent"
             />
             <div className="flex gap-2">
                 <button 
                    onClick={handlePrint}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
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
         <div className="flex-1 relative bg-slate-50 overflow-hidden flex flex-col">
             <textarea 
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={handleTextSelect}
                className="flex-1 w-full p-8 outline-none resize-none font-serif text-lg leading-relaxed text-slate-800 bg-white shadow-inner"
                placeholder="Start typing or use the AI bar below..."
             />

             {/* AI Bar */}
             <div className="bg-white border-t border-slate-200 p-4 shadow-xl z-20">
                 <div className="max-w-3xl mx-auto flex flex-col gap-2">
                    {selection && (
                         <div className="flex gap-2 pb-2 border-b border-slate-100 overflow-x-auto">
                             <span className="text-xs font-bold text-slate-400 uppercase px-2 py-1 whitespace-nowrap">Selected:</span>
                             <button onClick={() => { setAiPrompt("Fix grammar and spelling"); handleAiAction('rewrite'); }} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full whitespace-nowrap">Fix Grammar</button>
                             <button onClick={() => { setAiPrompt("Make it more professional"); handleAiAction('rewrite'); }} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full whitespace-nowrap">Make Professional</button>
                             <button onClick={() => { setAiPrompt("Shorten this"); handleAiAction('rewrite'); }} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full whitespace-nowrap">Shorten</button>
                         </div>
                     )}
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
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