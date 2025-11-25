import React from 'react';
import ContentGenerator from './ContentGenerator';
import MarketResearch from './MarketResearch';
import DataAnalyzer from './DataAnalyzer';
import LiveSupport from './LiveSupport';

const MissionControl: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
        <div className="mb-4 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Mission Control</h2>
                <p className="text-slate-500 text-sm">All-in-one unified workspace for business operations.</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                MULTIMODAL MODE ACTIVE
            </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto pb-4">
            {/* Top Left: Research */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[400px] flex flex-col">
                <MarketResearch isWidget={true} />
            </div>

            {/* Top Right: Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[400px] flex flex-col">
                <ContentGenerator isWidget={true} />
            </div>

            {/* Bottom Left: Data */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[400px] flex flex-col">
                <DataAnalyzer isWidget={true} />
            </div>

            {/* Bottom Right: Coach */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[400px] flex flex-col justify-center">
                <LiveSupport isWidget={true} />
            </div>
        </div>
    </div>
  );
};

export default MissionControl;