import React, { useState } from 'react';
import { ToolDefinition } from '../types';
import { runGenericTool } from '../services/geminiService';
import { saveItem, getSupabaseConfig } from '../services/supabaseService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import { Icons } from '../constants';

interface UniversalToolProps {
  tool: ToolDefinition;
  onBack: () => void;
}

const UniversalTool: React.FC<UniversalToolProps> = ({ tool, onBack }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const IconComponent = Icons[tool.icon] || Icons.Grid;

  const handleRun = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const profile = getProfile();
      const context = formatProfileForPrompt(profile);
      
      const result = await runGenericTool(input, tool.systemInstruction, context);
      setOutput(result);
    } catch (e) {
      console.error(e);
      setOutput("Error running tool. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!output) return;
    setSaving(true);
    const title = `${tool.name}: ${input.substring(0, 30)}...`;
    const saveRes = await saveItem(tool.category, title, output);
    if (saveRes.success) {
      alert("Saved to database!");
    } else {
      alert("Failed to save: " + saveRes.error);
    }
    setSaving(false);
  };

  const handleRefine = () => {
      // Move output to input for iteration
      setInput(output + "\n\n--- REFINE REQUEST: ---\n");
      setOutput('');
      const textarea = document.querySelector('textarea');
      if (textarea) textarea.focus();
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                title="Back to Library"
            >
                <Icons.ArrowLeft />
            </button>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <IconComponent />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{tool.name}</h2>
                <p className="text-slate-500 text-sm">{tool.description}</p>
            </div>
            {tool.category === 'Custom' && (
                 <span className="ml-auto bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-bold border border-purple-200">
                    GENERATED TOOL
                 </span>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
            {/* Input Panel */}
            <div className="flex flex-col gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col flex-1 h-full">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                        <Icons.Pen /> Input Context
                    </label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={tool.placeholder || "Enter details here..."}
                        className="flex-1 w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-slate-50 text-slate-800 leading-relaxed"
                    />
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <button
                            onClick={handleRun}
                            disabled={loading || !input}
                            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-all
                                ${loading || !input ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
                        >
                            {loading ? 'Processing...' : <><Icons.Sparkles /> Run Tool</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Output Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                        <Icons.DocumentText /> Result
                    </label>
                    <div className="flex gap-2">
                        {output && (
                            <button
                                onClick={handleRefine}
                                className="text-xs flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                                title="Use result as input for next step"
                            >
                                <Icons.Loop /> Refine
                            </button>
                        )}
                        {output && getSupabaseConfig() && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium border border-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                            >
                                {saving ? 'Saving...' : <><Icons.Save /> Save</>}
                            </button>
                        )}
                        {output && (
                             <button 
                                onClick={() => navigator.clipboard.writeText(output)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                Copy
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-50 rounded-lg border border-slate-100 p-6 prose prose-slate max-w-none prose-sm leading-relaxed text-slate-800">
                    {output ? (
                        <div className="whitespace-pre-wrap">{output}</div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                             <div className="mb-2 text-slate-300"><Icons.DocumentText /></div>
                             <p className="italic">Output will appear here...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default UniversalTool;