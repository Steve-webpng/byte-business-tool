import React, { useState, useMemo } from 'react';
import { TOOLS } from '../services/toolRegistry';
import { Icons } from '../constants';
import { ToolDefinition } from '../types';

interface ToolLibraryProps {
  onSelectTool: (tool: ToolDefinition) => void;
}

const ToolLibrary: React.FC<ToolLibraryProps> = ({ onSelectTool }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(TOOLS.map(t => t.category));
    return ['All', ...Array.from(cats).sort()];
  }, []);

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || 
                            tool.description.toLowerCase().includes(search.toLowerCase());
      
      let matchesCategory = true;
      if (selectedCategory !== 'All') {
        matchesCategory = tool.category === selectedCategory;
      }

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const handleCreateCustomTool = () => {
    const newTool: ToolDefinition = {
        id: `custom-${Date.now()}`,
        name: search,
        description: `AI-Generated tool for ${search}`,
        category: 'Custom',
        icon: 'Sparkles',
        systemInstruction: `You are an expert AI assistant specialized in "${search}". Your goal is to provide high-quality, professional, and actionable output to help the user with this specific task.`,
        placeholder: `Enter details for ${search}...`
    };
    onSelectTool(newTool);
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">App Library</h2>
        <p className="text-slate-500">Access our comprehensive suite of {TOOLS.length}+ AI-powered business tools.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools (e.g., 'contract', 'lease', 'fitness')..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border
                ${selectedCategory === cat 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto flex-1 pb-4 pr-2">
        {filteredTools.map((tool) => {
            const IconComponent = Icons[tool.icon] || Icons.Grid;
            return (
                <div 
                    key={tool.id}
                    onClick={() => onSelectTool(tool)}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col cursor-pointer group h-full"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <IconComponent />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                            {tool.category}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2 group-hover:text-blue-700">{tool.name}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{tool.description}</p>
                </div>
            );
        })}

        {/* Empty State / Create Custom Tool */}
        {filteredTools.length === 0 && search && (
            <div 
                onClick={handleCreateCustomTool}
                className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 transition-all"
            >
                <div className="bg-white p-4 rounded-full shadow-sm text-blue-500 mb-4 animate-bounce">
                    <Icons.Sparkles />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Create "{search}"</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                    Tool not found in the registry? No problem. <br/>
                    Click here to generate a custom AI tool for <strong>{search}</strong> instantly.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ToolLibrary;