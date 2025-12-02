

import React, { useState, useEffect, useMemo } from 'react';
import { Task } from '../types';
import { generateProjectTasks, prioritizeTasks, generateSubtasks } from '../services/geminiService';
import { getProfile, formatProfileForPrompt, getUsers } from '../services/settingsService';
import { saveTask, deleteTask as deleteServiceTask } from '../services/supabaseService';
import { Icons } from '../constants';
import { useToast } from './ToastContainer';
import { format, isPast, isToday, parseISO, differenceInDays } from 'date-fns';

interface TaskManagerProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    refreshTasks: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks, refreshTasks }) => {
  const [input, setInput] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('Medium');
  const [newDate, setNewDate] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newTags, setNewTags] = useState('');
  
  // Filters
  const [filterProject, setFilterProject] = useState('All Projects');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterTag, setFilterTag] = useState('All Tags');

  const [loading, setLoading] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTagInput, setEditTagInput] = useState('');
  const toast = useToast();
  const users = getUsers();

  // Get unique projects & tags
  const uniqueProjects = useMemo(() => {
      const projects = new Set(tasks.map(t => t.project).filter(Boolean));
      return ['All Projects', ...Array.from(projects).sort()];
  }, [tasks]);

  const uniqueTags = useMemo(() => {
      const tags = new Set<string>();
      tasks.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
      return ['All Tags', ...Array.from(tags).sort()];
  }, [tasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
      return tasks.filter(t => {
          const matchProject = filterProject === 'All Projects' || t.project === filterProject;
          const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
          const matchTag = filterTag === 'All Tags' || t.tags?.includes(filterTag);
          return matchProject && matchPriority && matchTag;
      });
  }, [tasks, filterProject, filterPriority, filterTag]);

  const handleAddTask = async () => {
      if (!input.trim()) return;
      const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
      const newTask: Task = {
          id: `task-${Date.now()}`,
          title: input,
          priority: newPriority,
          dueDate: newDate || undefined,
          columnId: 'todo',
          project: newProject.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined
      };
      await saveTask(newTask);
      await refreshTasks();
      setInput('');
      setNewTags('');
      toast.show("Task added successfully", "success");
  };

  const handleGenerate = async () => {
    if (!input) return;
    setLoading(true);
    try {
        const profile = getProfile();
        const context = formatProfileForPrompt(profile);
        const newTasks = await generateProjectTasks(input, context);
        
        // Save generated tasks
        for (const t of newTasks) {
            await saveTask({
                ...t,
                project: newProject.trim() || undefined
            });
        }

        await refreshTasks();
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
          
          for (const t of updatedTasks) {
              await saveTask(t);
          }
          await refreshTasks();
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
          
          await saveTask({ ...task, description: updatedDescription });
          await refreshTasks();
          toast.show("Subtasks added to description!", "success");
      } catch (e) {
          toast.show("Failed to breakdown task.", "error");
      }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editTask) return;
      // Process tags
      const processedTags = editTagInput.split(',').map(t => t.trim()).filter(Boolean);
      const updated = { ...editTask, tags: processedTags };
      
      await saveTask(updated);
      await refreshTasks();
      setEditTask(null);
      toast.show("Task updated", "success");
  };

  const openEditModal = (task: Task) => {
      setEditTask(task);
      setEditTagInput(task.tags?.join(', ') || '');
  }

  const moveTask = async (task: Task, direction: 'forward' | 'backward') => {
      let newCol = task.columnId;
      if (direction === 'forward') {
          if (task.columnId === 'todo') newCol = 'doing';
          else if (task.columnId === 'doing') newCol = 'done';
      } else {
          if (task.columnId === 'done') newCol = 'doing';
          else if (task.columnId === 'doing') newCol = 'todo';
      }
      const updated = { ...task, columnId: newCol };
      
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      
      await saveTask(updated);
      await refreshTasks();
  };

  const deleteTask = async (taskId: string) => {
      // Optimistic delete
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      await deleteServiceTask(taskId);
      await refreshTasks();
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

  const getAssignee = (id?: string) => users.find(u => u.id === id);

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
                  {colTasks.map(task => {
                      const assignee = getAssignee(task.assignee_id);
                      return (
                      <div 
                        key={task.id} 
                        onClick={() => openEditModal(task)}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group cursor-pointer relative"
                      >
                          <div className="flex flex-wrap gap-1 mb-2">
                              {task.project && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                                      {task.project}
                                  </span>
                              )}
                              {task.tags && task.tags.map(tag => (
                                  <span key={tag} className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                      #{tag}
                                  </span>
                              ))}
                          </div>
                          
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
                              <div className="flex items-center gap-2">
                                  {assignee ? (
                                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-white dark:border-slate-700 shadow-sm" title={assignee.name}>
                                          {assignee.avatar || assignee.name.charAt(0)}
                                      </div>
                                  ) : (
                                      <div className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600 border-dashed flex items-center justify-center text-slate-300">
                                          <Icons.User />
                                      </div>
                                  )}
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                      <button onClick={(e) => { e.stopPropagation(); handleExpandTask(task); }} className="text-slate-300 hover:text-purple-500 p-1" title="AI Split Task">
                                          <Icons.Sparkles />
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-slate-300 hover:text-red-500 p-1" title="Delete">
                                          <Icons.Trash />
                                      </button>
                                  </div>
                              </div>
                              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                {colId !== 'todo' && (
                                    <button onClick={() => moveTask(task, 'backward')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                        <div className="rotate-180"><Icons.ArrowRight /></div>
                                    </button>
                                )}
                                {colId !== 'done' ? (
                                    <button onClick={() => moveTask(task, 'forward')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                        <Icons.ArrowRight />
                                    </button>
                                ) : (
                                    <div className="text-emerald-500 px-1"><Icons.CheckCircle /></div>
                                )}
                              </div>
                          </div>
                      </div>
                  )})}
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
                <p className="text-slate-500 dark:text-slate-400">Manage tasks, deadlines, and team assignments.</p>
            </div>
            <div className="flex gap-2">
                 <button 
                    onClick={handlePrioritize}
                    disabled={loading || tasks.length === 0}
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                    <Icons.Scale /> AI Prioritize
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
                <select 
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:border-blue-400"
                >
                    {uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
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
                            placeholder="Project"
                            className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-slate-700 dark:text-slate-300 w-24"
                        />
                        <input 
                            type="text"
                            value={newTags}
                            onChange={(e) => setNewTags(e.target.value)}
                            placeholder="Tags (comma sep)"
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
                        {input.toLowerCase().startsWith('AI:') || input.toLowerCase().startsWith('generate') ? (
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
                <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
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
                        <div className="grid grid-cols-2 gap-4">
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
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tags</label>
                                <input 
                                    type="text" 
                                    value={editTagInput}
                                    onChange={(e) => setEditTagInput(e.target.value)}
                                    placeholder="e.g. urgent, marketing"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                />
                            </div>
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
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Assignee</label>
                            <select 
                                value={editTask.assignee_id || ''}
                                onChange={(e) => setEditTask({...editTask, assignee_id: e.target.value || undefined})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                            >
                                <option value="">Unassigned</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
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
