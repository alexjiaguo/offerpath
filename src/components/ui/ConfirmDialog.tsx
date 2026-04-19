"use client";

import { BsExclamationTriangle, BsX } from 'react-icons/bs';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-fade-in" onClick={onCancel} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-2xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <BsExclamationTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h3>
            </div>
            <button onClick={onCancel} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all">
              <BsX className="w-4 h-4" />
            </button>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-white/[0.06]">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                variant === "danger"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
