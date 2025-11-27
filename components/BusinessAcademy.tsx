
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { Course, Lesson } from '../types';
import { generateCourseSyllabus, generateLessonContent } from '../services/geminiService';
import { saveItem, getSavedItems } from '../services/supabaseService';
import { useToast } from './ToastContainer';
import MarkdownRenderer from './MarkdownRenderer';

const BusinessAcademy: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(false);
    const [lessonLoading, setLessonLoading] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizSelected, setQuizSelected] = useState<number | null>(null);
    const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
    const toast = useToast();

    useEffect(() => {
        loadSavedCourses();
    }, []);

    const loadSavedCourses = async () => {
        const items = await getSavedItems();
        const courseItems = items.filter(i => i.tool_type === 'Course');
        const loadedCourses: Course[] = courseItems.map(i => JSON.parse(i.content));
        setCourses(loadedCourses);
    };

    const handleCreateCourse = async () => {
        if(!topic.trim()) return;
        setLoading(true);
        try {
            const newCourse = await generateCourseSyllabus(topic);
            setCourses(prev => [newCourse, ...prev]);
            setActiveCourse(newCourse);
            setTopic('');
            
            // Save initial syllabus
            await saveItem('Course', newCourse.title, JSON.stringify(newCourse));
            toast.show("Course generated!", "success");
        } catch (e) {
            toast.show("Failed to generate course.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLesson = async (lesson: Lesson) => {
        if (!activeCourse) return;
        setActiveLesson(lesson);
        setShowQuiz(false);
        setQuizResult(null);
        setQuizSelected(null);

        if (!lesson.content) {
            setLessonLoading(true);
            try {
                const data = await generateLessonContent(activeCourse.title, lesson.title);
                
                // Update local state with new content
                const updatedLesson = { ...lesson, content: data.content, quiz: data.quiz };
                setActiveLesson(updatedLesson);
                
                // Update course state
                const updatedCourse = {
                    ...activeCourse,
                    modules: activeCourse.modules.map(m => ({
                        ...m,
                        lessons: m.lessons.map(l => l.id === lesson.id ? updatedLesson : l)
                    }))
                };
                setActiveCourse(updatedCourse);
                setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
                
                // Persist update
                await saveItem('Course', updatedCourse.title, JSON.stringify(updatedCourse));
            } catch (e) {
                toast.show("Failed to load lesson content.", "error");
            } finally {
                setLessonLoading(false);
            }
        }
    };

    const handleQuizSubmit = () => {
        if (quizSelected === null || !activeLesson?.quiz) return;
        const isCorrect = quizSelected === activeLesson.quiz.correctAnswer;
        setQuizResult(isCorrect ? 'correct' : 'incorrect');
        
        if (isCorrect && !activeLesson.isCompleted && activeCourse) {
            // Mark lesson as completed
            const updatedLesson = { ...activeLesson, isCompleted: true };
            setActiveLesson(updatedLesson);
            
            const updatedCourse = {
                ...activeCourse,
                completedLessons: activeCourse.completedLessons + 1,
                modules: activeCourse.modules.map(m => ({
                    ...m,
                    lessons: m.lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l)
                }))
            };
            
            setActiveCourse(updatedCourse);
            setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
            
            // Save progress (in real app update the existing item, here simplify by saving new version or relying on local state)
            saveItem('Course', updatedCourse.title, JSON.stringify(updatedCourse));
            toast.show("Lesson Completed!", "success");
        }
    };

    const getProgress = (course: Course) => {
        if (course.totalLessons === 0) return 0;
        return Math.round((course.completedLessons / course.totalLessons) * 100);
    };

    return (
        <div className="h-full flex flex-col max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Icons.AcademicCap /> Business Academy
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">AI-generated courses to master any skill.</p>
                </div>
                {activeCourse && (
                    <button onClick={() => { setActiveCourse(null); setActiveLesson(null); }} className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1">
                        <Icons.ArrowLeft /> Back to Courses
                    </button>
                )}
            </div>

            {!activeCourse ? (
                <div className="flex-1 flex flex-col gap-8">
                    {/* Generator */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                        <h3 className="text-2xl font-bold mb-4">What do you want to learn today?</h3>
                        <div className="flex gap-2 max-w-2xl">
                            <input 
                                type="text" 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., 'Digital Marketing', 'Python Basics', 'Leadership 101'..."
                                className="flex-1 px-4 py-3 rounded-lg text-slate-800 outline-none shadow-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateCourse()}
                            />
                            <button 
                                onClick={handleCreateCourse}
                                disabled={loading || !topic}
                                className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-70"
                            >
                                {loading ? 'Creating Syllabus...' : 'Generate Course'}
                            </button>
                        </div>
                    </div>

                    {/* Course List */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">Your Library</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map(course => (
                                <div 
                                    key={course.id} 
                                    onClick={() => setActiveCourse(course)}
                                    className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                            <Icons.BookOpen />
                                        </div>
                                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-300">
                                            {getProgress(course)}%
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{course.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{course.description}</p>
                                </div>
                            ))}
                            {courses.length === 0 && (
                                <div className="col-span-full text-center p-12 text-slate-400 italic border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                    No courses yet. Generate one above!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                    {/* Sidebar: Syllabus */}
                    <div className="lg:w-80 flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{activeCourse.title}</h3>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{width: `${getProgress(activeCourse)}%`}}></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {activeCourse.modules.map((mod, i) => (
                                <div key={i} className="mb-4">
                                    <h4 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Module {i+1}: {mod.title}</h4>
                                    <div className="space-y-1">
                                        {mod.lessons.map((lesson, j) => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => handleSelectLesson(lesson)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors
                                                    ${activeLesson?.id === lesson.id 
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' 
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${lesson.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {lesson.isCompleted && <div className="scale-75"><Icons.CheckCircle /></div>}
                                                </div>
                                                <span className="truncate">{lesson.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 overflow-y-auto">
                        {activeLesson ? (
                            lessonLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                    <p>Writing lesson content...</p>
                                </div>
                            ) : (
                                <div className="max-w-3xl mx-auto">
                                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                                        {activeLesson.title}
                                    </h2>
                                    
                                    {activeLesson.content && <MarkdownRenderer content={activeLesson.content} />}
                                    
                                    {activeLesson.quiz && (
                                        <div className="mt-12 pt-8 border-t-2 border-slate-100 dark:border-slate-700">
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                                <Icons.AcademicCap /> Knowledge Check
                                            </h3>
                                            
                                            {!showQuiz && !activeLesson.isCompleted ? (
                                                <button 
                                                    onClick={() => setShowQuiz(true)}
                                                    className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    Take Quiz to Complete Lesson
                                                </button>
                                            ) : (
                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <p className="font-bold text-lg mb-4">{activeLesson.quiz.question}</p>
                                                    <div className="space-y-3 mb-6">
                                                        {activeLesson.quiz.options.map((opt, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => !quizResult && setQuizSelected(idx)}
                                                                disabled={!!quizResult}
                                                                className={`w-full text-left p-4 rounded-lg border transition-all
                                                                    ${quizSelected === idx ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'}
                                                                    ${quizResult && idx === activeLesson.quiz!.correctAnswer ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''}
                                                                    ${quizResult === 'incorrect' && quizSelected === idx ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                                                                `}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    
                                                    {!quizResult ? (
                                                        <button 
                                                            onClick={handleQuizSubmit}
                                                            disabled={quizSelected === null}
                                                            className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                                        >
                                                            Submit Answer
                                                        </button>
                                                    ) : (
                                                        <div className={`p-4 rounded-lg font-bold text-center ${quizResult === 'correct' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                            {quizResult === 'correct' ? 'Correct! Lesson Completed.' : 'Incorrect. Review the content and try again.'}
                                                            {quizResult === 'incorrect' && (
                                                                <button onClick={() => { setQuizResult(null); setQuizSelected(null); }} className="ml-4 underline text-sm">Retry</button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {activeLesson.isCompleted && !showQuiz && (
                                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg font-bold flex items-center gap-2">
                                                    <Icons.CheckCircle /> Lesson Completed
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                    <Icons.BookOpen />
                                </div>
                                <p>Select a lesson from the syllabus to start learning.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessAcademy;
