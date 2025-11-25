import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { generateProjectTasks, prioritizeTasks } from '../services/geminiService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import { saveItem } from '../services/supabaseService';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';

interface TaskManagerProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
      if (tasks.length > 0) {
        localStorage.setItem('byete_current_board_state', JSON.stringify(tasks));
      }
  }, [tasks]);

  const handleManualSave = async () => {
      const content = JSON.stringify(tasks);
      const res = await saveItem('ProjectBoard', `Project Board Snapshot - ${new Date().toLocaleTimeString()}`, content);
      if (res.success) {
          toast.show("Board saved to database history!", "success");
      } else {
          toast.show("Failed to save board.", "error");
      }
  };

  const handleGenerate = async () => {
    if (!input) return;
    setLoading(true);
    try {
        const profile = getProfile();
        const context = formatProfileForPrompt(profile);
        const newTasks = await generateProjectTasks(input, context);
        setTasks(prev => [...prev, ...newTasks]);
        setInput('');
        toast.show("AI tasks generated!", "success");
    } catch (e) {
        console.error(e);
        toast.show("Failed to generate tasks.", "error");
    } finally {
        setLoading(false);
    }
  };

  const handlePrioritize = async () => {
      if (tasks.length === 0) return;
      setLoading(true);
      try {
          const profile = getProfile();
          const context = formatProfileForPrompt(profile);
          const updatedTasks = await prioritizeTasks(tasks, context);
          setTasks(updatedTasks);
          toast.show("Tasks have been re-prioritized by AI.", "info");
      } catch (e) {
          console.error(e);
          toast.show("Failed to prioritize tasks.", "error");
      } finally {
          setLoading(false);
      }
  };

  const moveTask = (taskId: string, direction: 'forward' | 'backward') => {
      setTasks(prev => prev.map(t => {
          if (t.id !== taskId) return t;
          let newCol = t.columnId;
          if (direction === 'forward') {
              if (t.columnId === 'todo') newCol = 'doing';
              else if (t.columnId === 'doing') newCol = 'done';
          } else {
              if (t.columnId === 'done') newCol = 'doing';
              else if (t.columnId === 'doing') newCol = 'todo';
          }
          return { ...t, columnId: newCol };
      }));
  };

  const deleteTask = (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const getPriorityColor = (p: string) => {
      switch(p) {
          case 'High': return 'bg-red-50 text-red-600 border-red-100';
          case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
          case 'Low': return 'bg-blue-50 text-blue-600 border-blue-100';
          default: return 'bg-slate-50 text-slate-600';
      }
  };

  const renderColumn = (colId: 'todo' | 'doing' | 'done', title: string, headerColor: string) => {
      const colTasks = tasks.filter(t => t.columnId === colId);
      
      return (
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden h-full border border-slate-200 dark:border-slate-700">
              <div className={`p-4 font-bold text-sm border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800`}>
                  <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${headerColor}`}></div>
                      <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wide">{title}</span>
                  </div>
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-mono">{colTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {colTasks.map(task => (
                      <div key={task.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 transition-all group">
                          <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                              </span>
                              <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Icons.Trash />
                              </button>
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug mb-2">{task.title}</h4>
                          {task.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-700/50">
                              {colId !== 'todo' ? (
                                  <button onClick={() => moveTask(task.id, 'backward')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                      <div className="rotate-180"><Icons.ArrowRight /></div>
                                  </button>
                              ) : <div></div>}
                              
                              {colId !== 'done' ? (
                                   <button onClick={() => moveTask(task.id, 'forward')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                       <Icons.ArrowRight />
                                   </button>
                              ) : (
                                  <div className="text-emerald-500"><Icons.CheckCircle /></div>
                              )}
                          </div>
                      </div>
                  ))}
                  {colTasks.length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-xl m-2 bg-slate-50/50">
                          No tasks
                      </div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                   <Icons.Board /> Smart Projects
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Manage tasks manually or let AI generate a structured plan for you.</p>
            </div>
            <div className="flex gap-2">
                 <button 
                    onClick={handlePrioritize}
                    disabled={loading || tasks.length === 0}
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                    <Icons.Scale /> AI Prioritize
                </button>
                <button 
                    onClick={handleManualSave} 
                    className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors border border-emerald-200"
                >
                    <Icons.Save /> Save Board
                </button>
            </div>
        </div>

        {/* Magic Input */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex gap-4 items-center ring-1 ring-slate-100 dark:ring-slate-800">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg">
                <Icons.Sparkles />
            </div>
            <div className="flex-1">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. 'Launch a monthly newsletter' or 'Hire a sales team'"
                    className="w-full text-sm outline-none placeholder:text-slate-400 bg-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
            </div>
            <button 
                onClick={handleGenerate}
                disabled={loading || !input}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50 transition-colors shadow-sm"
            >
                {loading ? 'Generating...' : 'Magic Add Tasks'}
            </button>
        </div>

        {/* Board */}
        <div className="flex-1 min-h-0 flex gap-6 overflow-x-auto pb-4">
            {renderColumn('todo', 'To Do', 'bg-slate-400')}
            {renderColumn('doing', 'In Progress', 'bg-blue-500')}
            {renderColumn('done', 'Done', 'bg-emerald-500')}
        </div>
    </div>
  );
};

export default TaskManager;