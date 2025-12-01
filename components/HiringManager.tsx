
import React, { useState } from 'react';
import { Icons } from '../constants';
import { Candidate, JobPosting } from '../types';

// Mock Data
const MOCK_JOBS: JobPosting[] = [
    { id: 1, title: 'Senior React Developer', department: 'Engineering', location: 'Remote', type: 'Full-time', status: 'Open', description: '...' },
    { id: 2, title: 'Growth Marketer', department: 'Marketing', location: 'New York', type: 'Full-time', status: 'Open', description: '...' }
];

const MOCK_CANDIDATES: Candidate[] = [
    { id: 1, job_id: 1, name: 'Alice Smith', email: 'alice@example.com', stage: 'Screening', fit_score: 8.5 },
    { id: 2, job_id: 1, name: 'Bob Jones', email: 'bob@example.com', stage: 'Applied', fit_score: 0 },
];

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

const HiringManager: React.FC = () => {
    const [jobs, setJobs] = useState(MOCK_JOBS);
    const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
    const [selectedJob, setSelectedJob] = useState<number>(1);

    const filteredCandidates = candidates.filter(c => c.job_id === selectedJob);

    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Icons.UserPlus /> Hiring ATS
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Track jobs and candidates.</p>
                </div>
                <button className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-sm">
                    <Icons.Plus /> Post Job
                </button>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Jobs List */}
                <div className="w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">Positions</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {jobs.map(job => (
                            <button
                                key={job.id}
                                onClick={() => setSelectedJob(job.id!)}
                                className={`w-full text-left p-3 rounded-lg text-sm ${selectedJob === job.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300'}`}
                            >
                                <div>{job.title}</div>
                                <div className="text-xs font-normal opacity-70">{job.department}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pipeline */}
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-4 h-full min-w-max pb-4">
                        {STAGES.map(stage => (
                            <div key={stage} className="w-72 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 h-full">
                                <div className="p-3 font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-xl">
                                    {stage} <span className="text-slate-400 ml-1 text-xs">{filteredCandidates.filter(c => c.stage === stage).length}</span>
                                </div>
                                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                                    {filteredCandidates.filter(c => c.stage === stage).map(c => (
                                        <div key={c.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-300">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{c.name}</div>
                                            <div className="text-xs text-slate-500">{c.email}</div>
                                            {c.fit_score ? (
                                                <div className="mt-2 flex items-center gap-1">
                                                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">AI Score: {c.fit_score}</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HiringManager;
