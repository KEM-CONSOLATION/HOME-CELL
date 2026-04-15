"use client";

import { LogOut, X, AlertTriangle } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[400px] bg-card border rounded-lg p-8 animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="cursor-pointer absolute right-6 top-6 h-10 w-10 flex items-center justify-center rounded-2xl border bg-background hover:bg-accent transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-rose-500/10 rounded-lg flex items-center justify-center mb-6 ring-8 ring-rose-500/5">
            <AlertTriangle className="h-10 w-10 text-rose-500" />
          </div>

          <h3 className="text-2xl font-bold tracking-tight">Sign Out?</h3>
          <p className="text-muted-foreground mt-2 px-4 italic underline-offset-4 decoration-rose-500/30">
            Are you sure you want to end your current session? You&apos;ll need
            to log back in to access the dashboard.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-10">
          <button
            onClick={onClose}
            className="cursor-pointer h-14 rounded-2xl border font-bold text-sm hover:bg-accent transition-all active:scale-95"
          >
            Stay Signed In
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="h-14 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
