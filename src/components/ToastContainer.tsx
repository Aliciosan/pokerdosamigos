import { useEffect, useState } from 'react';
import { FaCheckCircle, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';

interface ToastProps {
  message: string;
  type: 'info' | 'success' | 'alert';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    info: 'border-blue-500',
    success: 'border-green-500',
    alert: 'border-red-500'
  };

  const icons = {
    info: <FaInfoCircle className="text-blue-400" />,
    success: <FaCheckCircle className="text-green-400" />,
    alert: <FaExclamationCircle className="text-red-400" />
  };

  return (
    <div className={`bg-slate-800 border-l-4 ${colors[type]} text-white p-4 rounded shadow-2xl flex items-center gap-3 animate-fade min-w-[300px]`}>
      {icons[type]}
      <div className="text-sm font-semibold">{message}</div>
    </div>
  );
};

interface ContainerProps {
  toasts: { id: number; message: string; type: 'info'|'success'|'alert' }[];
  removeToast: (id: number) => void;
}

export default function ToastContainer({ toasts, removeToast }: ContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        </div>
      ))}
    </div>
  );
}