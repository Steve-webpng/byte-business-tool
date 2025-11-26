import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Icons } from '../constants';
import { Expense } from '../types';
import { getExpenses, saveExpense, deleteExpense } from '../services/supabaseService';
import { useToast } from './ToastContainer';
import { format, parseISO } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const ExpenseTracker: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    // Form state
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const refreshExpenses = async () => {
        setLoading(true);
        const data = await getExpenses();
        setExpenses(data);
        setLoading(false);
    };

    useEffect(() => {
        refreshExpenses();
    }, []);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountNum = parseFloat(amount);
        if (!date || !category.trim() || !amount || isNaN(amountNum) || !description.trim()) {
            toast.show("Please fill out all fields correctly.", "error");
            return;
        }

        const newExpense: Omit<Expense, 'id' | 'created_at'> = {
            date,
            category: category.trim(),
            amount: amountNum,
            description: description.trim(),
        };

        const result = await saveExpense(newExpense);
        if (result) {
            toast.show("Expense added successfully!", "success");
            await refreshExpenses();
            // Reset form
            setCategory('');
            setAmount('');
            setDescription('');
        } else {
            toast.show("Failed to add expense.", "error");
        }
    };

    const handleDeleteExpense = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            const success = await deleteExpense(id);
            if (success) {
                toast.show("Expense deleted.", "info");
                await refreshExpenses();
            } else {
                toast.show("Failed to delete expense.", "error");
            }
        }
    };

    const chartData = useMemo(() => {
        const categoryTotals = expenses.reduce((acc: Record<string, number>, expense) => {
            const cat = expense.category || 'Uncategorized';
            const currentAmount = acc[cat] || 0;
            acc[cat] = currentAmount + Number(expense.amount);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => Number(b.value) - Number(a.value));
    }, [expenses]);

    const totalSpent = useMemo(() => {
        return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    }, [expenses]);
    
    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Expense Tracker</h2>
                <p className="text-slate-500 dark:text-slate-400">Log and visualize your business spending.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left: Form & List */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Form */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Add New Expense</h3>
                        <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-300" />
                            <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (e.g., Marketing, Software)" className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900" />
                            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount ($)" className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900" />
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900" />
                            <button type="submit" className="md:col-span-2 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">Add Expense</button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col flex-1 min-h-0">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 p-6 border-b border-slate-100 dark:border-slate-700">Recent Expenses</h3>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading && <p className="text-center text-slate-400 p-8">Loading...</p>}
                            {!loading && expenses.length === 0 && <p className="text-center text-slate-400 p-8">No expenses logged yet.</p>}
                            {expenses.map(exp => (
                                <div key={exp.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 group">
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{exp.description}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{format(parseISO(exp.date), 'MMM d, yyyy')} • {exp.category}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">${exp.amount.toFixed(2)}</p>
                                        <button onClick={() => handleDeleteExpense(exp.id!)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Spending Breakdown</h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius="80%"
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: number) => `$${value.toFixed(2)}`} 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                                        border: '1px solid #ccc',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseTracker;