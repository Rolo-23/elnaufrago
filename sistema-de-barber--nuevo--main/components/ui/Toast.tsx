import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import ReactDOM from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const Toast: React.FC<{ message: ToastMessage; onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    // Toasts with actions don't auto-dismiss
    if (message.action) return;

    const timer = setTimeout(() => {
      onDismiss(message.id);
    }, 5000); // Increased duration to 5s
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  const baseClasses = 'mt-2 p-4 w-full max-w-sm rounded-lg shadow-lg flex items-center justify-between text-white';
  const typeClasses = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  const handleActionClick = () => {
    if (message.action) {
      message.action.onClick();
    }
    onDismiss(message.id);
  }

  return (
    <div className={`${baseClasses} ${typeClasses[message.type]}`}>
      <span className="flex-grow pr-2">{message.message}</span>
      <div className="flex items-center">
        {message.action && (
          <button 
            onClick={handleActionClick} 
            className="font-bold text-sm bg-white/20 hover:bg-white/30 py-1 px-3 rounded-md mr-2 whitespace-nowrap"
          >
            {message.action.label}
          </button>
        )}
        <button onClick={() => onDismiss(message.id)} className="p-1 rounded-full hover:bg-white/20 font-bold leading-none text-xl">
          &times;
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', action?: ToastAction) => {
    const newToast = { id: Date.now(), message, type, action };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    (window as any).showToast = showToast;
    return () => { delete (window as any).showToast };
  }, [showToast]);

  return ReactDOM.createPortal(
    <div className="fixed top-4 right-4 z-[100]">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast} onDismiss={dismissToast} />
      ))}
    </div>,
    document.body
  );
};

export const useToast = () => {
    const showToast = useCallback((message: string, type: ToastType = 'info', action?: ToastAction) => {
        if((window as any).showToast) {
            (window as any).showToast(message, type, action);
        }
    }, []);
    return { showToast };
};