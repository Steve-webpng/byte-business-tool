import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';
import { Icons } from '../constants';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300); // Animation duration
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const typeStyles = {
    success: { icon: Icons.CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    error: { icon: Icons.X, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    info: { icon: Icons.InformationCircle, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  };

  const { icon: Icon, color, bg, border } = typeStyles[toast.type];

  return (
    <div
      className={`
        flex items-start gap-4 p-4 rounded-xl shadow-lg border w-full max-w-sm transition-all duration-300 transform
        ${bg} ${border}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      style={{ animation: 'toast-in 0.3s ease-out forwards' }}
    >
      <div className={`flex-shrink-0 w-6 h-6 ${color}`}>
        <Icon />
      </div>
      <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
        {toast.message}
      </div>
      <button onClick={handleDismiss} className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <Icons.X />
      </button>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;
