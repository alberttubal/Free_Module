import React, { useEffect } from "react";

export type ToastMessage = {
  id: string;
  title?: string;
  description?: string;
  type?: "success" | "error" | "info";
};

type ToastProps = {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
};

export const Toasts: React.FC<ToastProps> = ({ messages, onRemove }) => {
  useEffect(() => {
    const timers = messages.map((m) =>
      setTimeout(() => {
        onRemove(m.id);
      }, 5000)
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, [messages, onRemove]);

  if (!messages.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {messages.map((m) => (
        <div key={m.id} className="w-80 rounded-lg border p-3 shadow-lg bg-white">
          <div className="flex items-start justify-between">
            <div>
              {m.title && <div className="font-semibold">{m.title}</div>}
              {m.description && <div className="text-sm text-gray-600">{m.description}</div>}
            </div>
            <button className="ml-4 text-sm text-gray-400" onClick={() => onRemove(m.id)} aria-label="Dismiss">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toasts;
