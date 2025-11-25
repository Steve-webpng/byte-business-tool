import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-body text-slate-800 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Table Styling
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-6 border border-slate-200 rounded-lg shadow-sm">
              <table className="w-full text-left border-collapse bg-white text-sm" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-slate-50 text-slate-700 border-b border-slate-200" {...props} />,
          tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-100" {...props} />,
          tr: ({node, ...props}) => <tr className="hover:bg-slate-50/50 transition-colors" {...props} />,
          th: ({node, ...props}) => <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500" {...props} />,
          td: ({node, ...props}) => <td className="p-4 text-slate-700 whitespace-pre-wrap" {...props} />,

          // Typography
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-100" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 mt-5 mb-2 text-blue-900" {...props} />,
          h4: ({node, ...props}) => <h4 className="font-bold text-slate-700 mt-4 mb-2" {...props} />,
          
          // Lists
          ul: ({node, ...props}) => <ul className="list-disc list-outside my-4 pl-5 space-y-1 text-slate-700" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside my-4 pl-5 space-y-1 text-slate-700" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,

          // Text formatting
          p: ({node, ...props}) => <p className="mb-4 text-slate-700" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
          em: ({node, ...props}) => <em className="italic text-slate-600" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-6 italic text-slate-600 bg-slate-50 rounded-r-lg" {...props} />
          ),
          hr: ({node, ...props}) => <hr className="my-8 border-slate-200" {...props} />,
          code: ({node, ...props}) => <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;