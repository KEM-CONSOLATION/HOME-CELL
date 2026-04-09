"use client";

import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50/50 text-foreground">
      <aside className="shrink-0">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
