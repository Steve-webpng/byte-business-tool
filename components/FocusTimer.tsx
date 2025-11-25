
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';

const FocusTimer: React.FC = () => {
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<{text: string, done: boolean}[]>([]);
  const [newTask, setNewTask] = useState('');
  
  const intervalRef = useRef<number | null>(null);

  const MODES = {
      focus: { label: 'Focus', time: 25 * 60, color: 'text-rose-500', bg: 'bg-rose-500' },
      short: { label: 'Short Break', time: 5 * 60, color: 'text-emerald-500', bg: 'bg-emerald-500' },
      long: { label: 'Long Break', time: 15 * 60, color: 'text-blue-500', bg: 'bg-blue-500' }
  };

  useEffect(() => {
      if (isRunning) {
          intervalRef.current = window.setInterval(() => {
              setTimeLeft((prev) => {
                  if (prev <= 1) {
                      if (intervalRef.current) clearInterval(intervalRef.current);
                      setIsRunning(false);
                      // Play sound here if needed
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      } else if (intervalRef.current) {
          clearInterval(intervalRef.current);
      }
      return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
      };
  }, [isRunning]);

  const changeMode = (m: 'focus' | 'short' | 'long') => {
      setMode(m);
      setIsRunning(false);
      setTimeLeft(MODES[m].time);
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
      setIsRunning(false);
      setTimeLeft(MODES[mode].time);
  };

  const addTask = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newTask.trim()) return;
      setTasks([...tasks, { text: newTask, done: false }]);
      setNewTask('');
  };

  const toggleTask = (idx: number) => {
      const newTasks = [...tasks];
      newTasks[idx].done = !newTasks[idx].done;
      setTasks(newTasks);
  };

  const deleteTask = (idx: number) => {
      setTasks(tasks.filter((_, i) => i !== idx));
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden w-full max-w-lg">
            <div className="p-8 text-center">
                <div className="flex justify-center gap-4 mb-8">
                    {Object.entries(MODES).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => changeMode(key as any)}
                            className={`px-4 py-2 rounded-full font-bold text-sm transition-all
                                ${mode === key ? `${val.bg} text-white shadow-md` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                            `}
                        >
                            {val.label}
                        </button>
                    ))}
                </div>

                <div className={`text-9xl font-bold mb-8 font-mono tracking-tighter ${MODES[mode].color}`}>
                    {formatTime(timeLeft)}
                </div>

                <div className="flex justify-center gap-6 mb-8">
                    <button 
                        onClick={toggleTimer}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl shadow-lg transition-transform hover:scale-105 active:scale-95 ${MODES[mode].bg}`}
                    >
                        {isRunning ? <div className="w-8 h-8 bg-white rounded-sm" /> : <Icons.ArrowRight />}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className="w-20 h-20 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-slate-200 text-2xl transition-colors"
                    >
                        <Icons.Loop />
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-100">
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wide mb-4 flex items-center gap-2">
                    <Icons.CheckCircle /> Focus Tasks
                </h3>
                
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {tasks.length === 0 && (
                        <p className="text-center text-slate-400 text-sm italic">Add a task to focus on...</p>
                    )}
                    {tasks.map((t, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm group">
                            <button onClick={() => toggleTask(i)} className={`flex-1 text-left flex items-center gap-3 ${t.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                                    {t.done && <div className="scale-75"><Icons.CheckCircle /></div>}
                                </div>
                                {t.text}
                            </button>
                            <button onClick={() => deleteTask(i)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icons.Trash />
                            </button>
                        </div>
                    ))}
                </div>

                <form onSubmit={addTask} className="relative">
                    <input 
                        type="text" 
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        placeholder="What are you working on?"
                        className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <button type="submit" className="absolute right-2 top-2 p-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-700">
                        <Icons.Plus />
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default FocusTimer;