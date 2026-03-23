import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="text-emerald-500 shrink-0" size={20} />,
    error: <AlertCircle className="text-red-500 shrink-0" size={20} />,
    info: <Info className="text-blue-500 shrink-0" size={20} />
  };

  const styles = {
    success: 'bg-white border-emerald-100 shadow-emerald-100/50',
    error: 'bg-white border-red-100 shadow-red-100/50',
    info: 'bg-white border-blue-100 shadow-blue-100/50'
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      layout
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border ${styles[type]} w-full max-w-sm backdrop-blur-sm`}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium text-slate-800 leading-tight py-0.5">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-0.5">
        <X size={16} />
      </button>
    </motion.div>
  );
};