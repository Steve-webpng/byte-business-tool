import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-body text-slate-800 dark:text-slate-300 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Table Styling
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-6 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
              <table className="w-full text-left border-collapse bg-white dark:bg-slate-800 text-sm" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700" {...props} />,
          tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-100 dark:divide-slate-700" {...props} />,
          tr: ({node, ...props}) => <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors" {...props} />,
          th: ({node, ...props}) => <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400" {...props} />,
          td: ({node, ...props}) => <td className="p-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap" {...props} />,

          // Typography
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-6 mb-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-5 mb-2 text-blue-900 dark:text-blue-400" {...props} />,
          h4: ({node, ...props}) => <h4 className="font-bold text-slate-700 dark:text-slate-300 mt-4 mb-2" {...props} />,
          
          // Lists
          ul: ({node, ...props}) => <ul className="list-disc list-outside my-4 pl-5 space-y-1 text-slate-700 dark:text-slate-300" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside my-4 pl-5 space-y-1 text-slate-700 dark:text-slate-300" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,

          // Text formatting
          p: ({node, ...props}) => <p className="mb-4 text-slate-700 dark:text-slate-300" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-slate-100" {...props} />,
          em: ({node, ...props}) => <em className="italic text-slate-600 dark:text-slate-400" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-6 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-r-lg" {...props} />
          ),
          hr: ({node, ...props}) => <hr className="my-8 border-slate-200 dark:border-slate-700" {...props} />,
          code: ({node, ...props}) => <code className="bg-slate-100 dark:bg-slate-900 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200 dark:border-slate-700" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
