
import React, { useState, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { analyzeData, forecastData } from '../services/geminiService';
import { saveItem, getSupabaseConfig } from '../services/supabaseService';
import { AnalysisResult, ChartDataPoint } from '../types';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface DataAnalyzerProps {
  isWidget?: boolean;
}

const DataAnalyzer: React.FC<DataAnalyzerProps> = ({ isWidget = false }) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const toast = useToast();
  
  // AI State
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual State
  const [manualDataInput, setManualDataInput] = useState(''); // CSV format: Label, Value
  const [manualChartType, setManualChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [manualTitle, setManualTitle] = useState('');

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [forecasting, setForecasting] = useState(false);

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

  const handleAnalyzeAI = async () => {
    if (!prompt && !file) return;
    setLoading(true);
    try {
      const data = await analyzeData(prompt || "Analyze this image.", preview || undefined);
      setResult(data);
      toast.show("Analysis complete!", "success");
    } catch (err) {
      console.error(err);
      toast.show("Failed to analyze data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleManualRender = () => {
      if (!manualDataInput.trim()) return;
      
      const lines = manualDataInput.trim().split('\n');
      const dataPoints = lines.map(line => {
          const parts = line.split(',');
          if (parts.length < 2) return null;
          const val = parseFloat(parts[1].trim());
          return {
              name: parts[0].trim(),
              value: isNaN(val) ? 0 : val
          };
      }).filter(d => d !== null) as ChartDataPoint[];

      if (dataPoints.length === 0) {
          toast.show("Invalid data format. Use 'Label, Value'", "error");
          return;
      }

      setResult({
          summary: manualTitle || "Manual Data Visualization",
          type: manualChartType,
          data: dataPoints
      });
  };

  const handleForecast = async () => {
      if (!result || !result.data.length) return;
      setForecasting(true);
      try {
          const forecastedData = await forecastData(result.data);
          setResult({
              ...result,
              summary: result.summary + " (Includes AI Forecast)",
              data: forecastedData
          });
          toast.show("Forecast added to chart.", "success");
      } catch(e) {
          toast.show("Forecasting failed.", "error");
      } finally {
          setForecasting(false);
      }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    const contentToSave = JSON.stringify(result, null, 2);
    const title = result.summary.substring(0, 50) + "...";
    const saveRes = await saveItem('Analysis', title, contentToSave);
    if (saveRes.success) {
      toast.show("Analysis data saved!", "success");
    } else {
      toast.show("Failed to save: " + saveRes.error, "error");
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
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Data Analyzer</h2>
            <p className="text-slate-500 dark:text-slate-400">Visualize data instantly via AI interpretation or manual input.</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                  onClick={() => setMode('ai')}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${mode === 'ai' ? 'bg-white dark:bg-slate-700 shadow text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  AI Analysis
              </button>
              <button 
                  onClick={() => setMode('manual')}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${mode === 'manual' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Manual Entry
              </button>
          </div>
        </div>
      )}

      {isWidget && (
        <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300">
          <Icons.Chart />
          <h3 className="font-bold text-sm uppercase tracking-wide">Data Analyzer</h3>
        </div>
      )}

      <div className={`grid ${isWidget ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-3 gap-6'} flex-1 min-h-0`}>
        
        {/* Input Section */}
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-4 overflow-y-auto ${isWidget ? 'p-3 order-2' : 'p-6'}`}>
          
          {mode === 'ai' ? (
              <>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
                    ${preview ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
                    ${isWidget ? 'h-24' : 'h-32'}
                    `}
                >
                    {preview ? (
                    <img src={preview} alt="Upload preview" className="h-full w-full object-contain rounded-lg p-2" />
                    ) : (
                    <div className="text-center p-2">
                        <div className={`mx-auto text-slate-400 mb-2 ${isWidget ? 'h-6 w-6' : 'h-8 w-8'}`}>
                            <Icons.Chart />
                        </div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Upload Chart Image</p>
                    </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Instructions</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the data or ask specific questions..."
                        className={`w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 ${isWidget ? 'h-20' : 'h-32'}`}
                    />
                </div>

                <button
                    onClick={handleAnalyzeAI}
                    disabled={loading || (!prompt && !file)}
                    className={`mt-auto w-full py-3 rounded-lg font-bold text-white transition-all shadow-md
                        ${loading || (!prompt && !file) ? 'bg-slate-300 dark:bg-slate-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {loading ? 'Analyzing...' : 'AI Analyze'}
                </button>
              </>
          ) : (
              <>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Chart Title</label>
                    <input 
                        type="text"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                        placeholder="e.g. Q1 Sales"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Chart Type</label>
                    <select 
                        value={manualChartType}
                        onChange={(e) => setManualChartType(e.target.value as any)}
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="pie">Pie Chart</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Data (Label, Value)</label>
                    <textarea 
                        value={manualDataInput}
                        onChange={(e) => setManualDataInput(e.target.value)}
                        placeholder="Jan, 100&#10;Feb, 150&#10;Mar, 120"
                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 h-full font-mono"
                    />
                </div>
                <button
                    onClick={handleManualRender}
                    disabled={!manualDataInput}
                    className="mt-4 w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
                >
                    Render Chart
                </button>
              </>
          )}
        </div>

        {/* Output Section */}
        <div className={`${isWidget ? 'col-span-1 h-64 order-1' : 'lg:col-span-2 min-h-[500px]'} bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col`}>
          {result ? (
            <>
              <div className="mb-4 flex justify-between items-start border-b border-slate-100 dark:border-slate-700 pb-4">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {mode === 'ai' ? 'AI Insight' : 'Chart Title'}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-1">{result.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                    {result.data.length > 0 && !isWidget && (
                        <button 
                            onClick={handleForecast} 
                            disabled={forecasting}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-bold bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            {forecasting ? 'Predicting...' : <><Icons.Sparkles /> Predict Future</>}
                        </button>
                    )}
                    {getSupabaseConfig() && (
                        <button onClick={handleSave} disabled={saving} className="text-emerald-600 hover:text-emerald-700 flex-shrink-0 ml-2">
                            {saving ? <span className="text-[10px] font-bold">Saving...</span> : <Icons.Save />}
                        </button>
                    )}
                </div>
              </div>
              <div className="flex-1 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50 relative flex items-center justify-center border border-slate-100 dark:border-slate-700">
                 {renderChart()}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
               <div className={`bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 ${isWidget ? 'w-12 h-12' : 'w-20 h-20'}`}>
                  <Icons.Chart />
               </div>
               <p className="font-bold text-slate-500 dark:text-slate-400">No chart generated</p>
               <p className="text-sm mt-1">
                   {mode === 'ai' ? 'Upload an image to analyze' : 'Enter data to visualize'}
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataAnalyzer;
