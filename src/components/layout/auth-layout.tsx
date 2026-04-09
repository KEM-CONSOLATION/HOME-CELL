"use client";

import { ShieldCheck } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 text-foreground p-6">
      <div className="relative w-full max-w-[440px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="h-32 w-32 flex items-center justify-center transition-transform hover:scale-105 duration-500">
            <img
              src="/logo.png"
              className="h-full w-full object-contain"
              alt="Logo"
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-6 text-slate-900 italic">
            HOME-CELL
          </h1>
          <p className="text-muted-foreground mt-2 text-center text-sm font-medium">
            Digitalizing Salvation Ministries Home Fellowship
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-10 rounded-[40px]">
          {children}
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
          <img
            src="/logo.png"
            className="h-12 object-contain"
            alt="Salvation Ministries"
          />
        </div>
      </div>
    </div>
  );
}
