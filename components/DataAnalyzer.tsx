import React, { useState, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { analyzeData } from '../services/geminiService';
import { saveItem, getSupabaseConfig } from '../services/supabaseService';
import { AnalysisResult } from '../types';
import { Icons } from '../constants';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface DataAnalyzerProps {
  isWidget?: boolean;
}

const DataAnalyzer: React.FC<DataAnalyzerProps> = ({ isWidget = false }) => {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!prompt && !file) return;
    setLoading(true);
    try {
      const data = await analyzeData(prompt || "Analyze this image.", preview || undefined);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    const contentToSave = JSON.stringify(result, null, 2);
    const title = result.summary.substring(0, 50) + "...";
    const saveRes = await saveItem('Analysis', title, contentToSave);
    if (saveRes.success) {
      alert("Analysis data saved!");
    } else {
      alert("Failed to save: " + saveRes.error);
    }
    setSaving(false);
  };

  const renderChart = () => {
    if (!result) return null;
    const { type, data } = result;

    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            {!isWidget && <Legend />}
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
             <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={isWidget ? 60 : 120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {!isWidget && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );
    }
    // Default Bar
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          {!isWidget && <Legend />}
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className={`h-full flex flex-col ${isWidget ? '' : 'max-w-6xl mx-auto gap-6'}`}>
      {!isWidget && (
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Data Analyzer</h2>
            <p className="text-slate-500">Upload charts or describe data to generate instant visualization and insights.</p>
          </div>
        </div>
      )}

      {isWidget && (
        <div className="flex items-center gap-2 mb-3 text-slate-700">
          <Icons.Chart />
          <h3 className="font-bold text-sm uppercase tracking-wide">Data Analyzer</h3>
        </div>
      )}

      <div className={`grid ${isWidget ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-3 gap-6'} flex-1 min-h-0`}>
        
        {/* Input Section */}
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4 overflow-y-auto ${isWidget ? 'p-3 order-2' : 'p-6'}`}>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
              ${preview ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
              ${isWidget ? 'h-24' : 'h-48'}
            `}
          >
            {preview ? (
              <img src={preview} alt="Upload preview" className="h-full w-full object-contain rounded-lg p-2" />
            ) : (
              <div className="text-center p-2">
                 <div className={`mx-auto text-slate-400 mb-2 ${isWidget ? 'h-6 w-6' : 'h-10 w-10'}`}>
                    <Icons.Chart />
                 </div>
                 <p className="text-sm font-bold text-slate-600">Click to Upload Image</p>
                 {!isWidget && <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG (Charts, Tables)</p>}
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Instructions / Data</label>
             <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the data or ask specific questions about the image..."
                className={`w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 ${isWidget ? 'h-20' : 'h-32'}`}
             />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || (!prompt && !file)}
            className={`mt-auto w-full py-3 rounded-lg font-bold text-white transition-all shadow-md
                ${loading || (!prompt && !file) ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
          >
            {loading ? 'Analyzing...' : 'Analyze Data'}
          </button>
        </div>

        {/* Output Section */}
        <div className={`${isWidget ? 'col-span-1 h-64 order-1' : 'lg:col-span-2 min-h-[500px]'} bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col`}>
          {result ? (
            <>
              <div className="mb-4 flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Insight</span>
                    <p className="text-slate-700 font-medium leading-relaxed mt-1">{result.summary}</p>
                </div>
                {getSupabaseConfig() && (
                    <button onClick={handleSave} disabled={saving} className="text-emerald-600 hover:text-emerald-700 flex-shrink-0 ml-4">
                        {saving ? <span className="text-[10px] font-bold">Saving...</span> : <Icons.Save />}
                    </button>
                )}
              </div>
              <div className="flex-1 rounded-xl p-4 bg-slate-50 relative flex items-center justify-center border border-slate-100">
                 {renderChart()}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
               <div className={`bg-slate-100 rounded-full flex items-center justify-center mb-4 ${isWidget ? 'w-12 h-12' : 'w-20 h-20'}`}>
                  <Icons.Chart />
               </div>
               <p className="font-bold text-slate-500">No analysis yet</p>
               <p className="text-sm mt-1">Upload an image or text to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataAnalyzer;