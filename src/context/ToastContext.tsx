import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast floating container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none flex flex-col gap-2">
        {toasts.map((toast) => {
          let bgClass = "bg-stone-900 text-white";
          let IconComponent = Info;

          if (toast.type === "success") {
            bgClass = "bg-emerald-800 text-white shadow-emerald-950/20";
            IconComponent = CheckCircle2;
          } else if (toast.type === "error") {
            bgClass = "bg-rose-700 text-white shadow-rose-950/20";
            IconComponent = AlertCircle;
          } else if (toast.type === "warning") {
            bgClass = "bg-amber-600 text-white shadow-amber-950/20";
            IconComponent = AlertTriangle;
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border border-white/10 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${bgClass}`}
            >
              <IconComponent className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-snug flex-1 break-keep">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5 rounded transition-opacity"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
