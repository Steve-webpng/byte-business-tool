
import React, { useState, useEffect, useMemo } from 'react';
import { Task } from '../types';
import { generateProjectTasks, prioritizeTasks, generateSubtasks } from '../services/geminiService';
import { getProfile, formatProfileForPrompt } from '../services/settingsService';
import { saveItem } from '../services/supabaseService';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';
import { format, isPast, isToday, parseISO, differenceInDays } from 'date-fns';

interface TaskManagerProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks }) => {
  const [input, setInput] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('Medium');
  const [newDate, setNewDate] = useState('');
  const [newProject, setNewProject] = useState('');
  
  // Filters
  const [filterProject, setFilterProject] = useState('All Projects');
  const [filterPriority, setFilterPriority] = useState('All');

  const [loading, setLoading] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const toast = useToast();

  useEffect(() => {
      if (tasks.length > 0) {
        localStorage.setItem('byete_current_board_state', JSON.stringify(tasks));
      }
  }, [tasks]);

  // Get unique projects
  const uniqueProjects = useMemo(() => {
      const projects = new Set(tasks.map(t => t.project).filter(Boolean));
      return ['All Projects', ...Array.from(projects).sort()];
  }, [tasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
      return tasks.filter(t => {
          const matchProject = filterProject === 'All Projects' || t.project === filterProject;
          const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
          return matchProject && matchPriority;
      });
  }, [tasks, filterProject, filterPriority]);

  const handleManualSave = async () => {
      const content = JSON.stringify(tasks);
      const res = await saveItem('ProjectBoard', `Project Board Snapshot - ${new Date().toLocaleTimeString()}`, content);
      if (res.success) {
          toast.show("Board saved to database history!", "success");
      } else {
          toast.show("Failed to save board.", "error");
      }
  };

  const handleAddTask = () => {
      if (!input.trim()) return;
      const newTask: Task = {
          id: `task-${Date.now()}`,
          title: input,
          priority: newPriority,
          dueDate: newDate || undefined,
          columnId: 'todo',
          project: newProject.trim() || undefined
      };
      setTasks(prev => [...prev, newTask]);
      setInput('');
      // Keep other settings for rapid entry, maybe clear date?
      toast.show("Task added successfully", "success");
  };

  const handleGenerate = async () => {
    if (!input) return;
    setLoading(true);
    try {
        const profile = getProfile();
        const context = formatProfileForPrompt(profile);
        const newTasks = await generateProjectTasks(input, context);
        
        // Apply current project context to generated tasks
        const tasksWithProject = newTasks.map(t => ({
            ...t,
            project: newProject.trim() || undefined
        }));

        setTasks(prev => [...prev, ...tasksWithProject]);
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

  const handleExpandTask = async (task: Task) => {
      toast.show("Generating subtasks...", "info");
      try {
          const profile = getProfile();
          const context = formatProfileForPrompt(profile);
          const subtasks = await generateSubtasks(task.title, context);
          
          const checklist = subtasks.map(st => `- [ ] ${st}`).join('\n');
          const updatedDescription = (task.description ? task.description + '\n\n' : '') + "**Subtasks:**\n" + checklist;
          
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, description: updatedDescription } : t));
          toast.show("Subtasks added to description!", "success");
      } catch (e) {
          toast.show("Failed to breakdown task.", "error");
      }
  };

  const handleUpdateTask = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editTask) return;
      setTasks(prev => prev.map(t => t.id === editTask.id ? editTask : t));
      setEditTask(null);
      toast.show("Task updated", "success");
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

  const getDateStatus = (dateStr?: string) => {
      if (!dateStr) return null;
      const date = parseISO(dateStr);
      const diff = differenceInDays(date, new Date());
      
      if (isPast(date) && !isToday(date)) return 'text-red-500';
      if (isToday(date)) return 'text-amber-500';
      if (diff <= 2) return 'text-orange-400';
      return 'text-slate-400';
  };

  const renderColumn = (colId: 'todo' | 'doing' | 'done', title: string, headerColor: string) => {
      const colTasks = filteredTasks.filter(t => t.columnId === colId);
      
      return (
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden h-full border border-slate-200 dark:border-slate-700 min-w-[300px]">
              <div className={`p-4 font-bold text-sm border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800`}>
                  <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${headerColor}`}></div>
                      <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wide">{title}</span>
                  </div>
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-mono">{colTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {colTasks.map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => setEditTask(task)}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group cursor-pointer relative"
                      >
                          {task.project && (
                              <div className="mb-2">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                                      {task.project}
                                  </span>
                              </div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                              </span>
                              {task.dueDate && (
                                  <span className={`text-[10px] font-bold flex items-center gap-1 ${getDateStatus(task.dueDate)}`}>
                                      <Icons.Calendar /> {format(parseISO(task.dueDate), 'MMM d')}
                                  </span>
                              )}
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug mb-2">{task.title}</h4>
                          {task.description && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed whitespace-pre-wrap line-clamp-3">{task.description}</div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-700/50">
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => { e.stopPropagation(); handleExpandTask(task); }} className="text-slate-300 hover:text-purple-500 p-1" title="AI Split Task">
                                      <Icons.Sparkles />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-slate-300 hover:text-red-500 p-1" title="Delete">
                                      <Icons.Trash />
                                  </button>
                              </div>
                              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                {colId !== 'todo' && (
                                    <button onClick={() => moveTask(task.id, 'backward')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                        <div className="rotate-180"><Icons.ArrowRight /></div>
                                    </button>
                                )}
                                {colId !== 'done' ? (
                                    <button onClick={() => moveTask(task.id, 'forward')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                        <Icons.ArrowRight />
                                    </button>
                                ) : (
                                    <div className="text-emerald-500 px-1"><Icons.CheckCircle /></div>
                                )}
                              </div>
                          </div>
                      </div>
                  ))}
                  {colTasks.length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl m-2 bg-slate-50/50 dark:bg-slate-800/20">
                          No tasks in this view
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
                   <Icons.Board /> Project Management
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Manage tasks, deadlines, and track project progress.</p>
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

        {/* Controls & Filter Bar */}
        <div className="flex flex-col gap-4 mb-6">
            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-1">
                <select 
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:border-blue-400"
                >
                    {uniqueProjects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select 
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:border-blue-400"
                >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <div className="flex-1"></div>
                <div className="text-xs text-slate-400 font-mono py-2">
                    Showing {filteredTasks.length} of {tasks.length} tasks
                </div>
            </div>

            {/* Creation Input */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 flex gap-4 items-center">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg hidden md:block">
                            <Icons.Sparkles />
                        </div>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Task title or 'AI: Launch strategy'..."
                            className="w-full text-sm outline-none placeholder:text-slate-400 bg-transparent p-2"
                            onKeyDown={(e) => e.key === 'Enter' && (input.startsWith('AI:') ? handleGenerate() : handleAddTask())}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 border-slate-100 dark:border-slate-700 pt-4 lg:pt-0">
                        <input 
                            type="text"
                            value={newProject}
                            onChange={(e) => setNewProject(e.target.value)}
                            placeholder="Project Name"
                            className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-700 dark:text-slate-300 w-32"
                        />
                        <select 
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
                            className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-700 dark:text-slate-300"
                        >
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                        <input 
                            type="date" 
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-700 dark:text-slate-300"
                        />
                        {input.toLowerCase().startsWith('ai:') || input.toLowerCase().startsWith('generate') ? (
                            <button 
                                onClick={handleGenerate}
                                disabled={loading || !input}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap flex-1 lg:flex-none"
                            >
                                {loading ? 'Generating...' : 'AI Generate'}
                            </button>
                        ) : (
                            <button 
                                onClick={handleAddTask}
                                disabled={!input}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap flex-1 lg:flex-none"
                            >
                                Add Task
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Board */}
        <div className="flex-1 min-h-0 flex gap-6 overflow-x-auto pb-4">
            {renderColumn('todo', 'To Do', 'bg-slate-400')}
            {renderColumn('doing', 'In Progress', 'bg-blue-500')}
            {renderColumn('done', 'Done', 'bg-emerald-500')}
        </div>

        {/* Edit Modal */}
        {editTask && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Edit Task</h3>
                        <button onClick={() => setEditTask(null)} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
                    </div>
                    <form onSubmit={handleUpdateTask} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Title</label>
                            <input 
                                type="text" 
                                value={editTask.title} 
                                onChange={(e) => setEditTask({...editTask, title: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Project</label>
                            <input 
                                type="text" 
                                value={editTask.project || ''} 
                                onChange={(e) => setEditTask({...editTask, project: e.target.value})}
                                placeholder="Project Name (Optional)"
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Priority</label>
                                <select 
                                    value={editTask.priority}
                                    onChange={(e) => setEditTask({...editTask, priority: e.target.value as any})}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                >
                                    <option>High</option><option>Medium</option><option>Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Due Date</label>
                                <input 
                                    type="date" 
                                    value={editTask.dueDate || ''} 
                                    onChange={(e) => setEditTask({...editTask, dueDate: e.target.value})}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Description</label>
                            <textarea 
                                value={editTask.description || ''} 
                                onChange={(e) => setEditTask({...editTask, description: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-32 outline-none resize-none"
                                placeholder="Add details, subtasks, or notes..."
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default TaskManager;
