"use client";

import { useState } from "react";
import { ChevronDown, Check, Globe, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_STATES } from "@/data/mock-data";
import { useStore } from "@/store";

export function StateSwitcher({ collapsed }: { collapsed: boolean }) {
  const { user, setUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentState =
    MOCK_STATES.find((s) => s.id === user?.unitId) || MOCK_STATES[0];

  const handleSelect = (state: (typeof MOCK_STATES)[0]) => {
    if (user) {
      setUser({
        ...user,
        unitId: state.id,
        unitName: state.name,
      });
    }
    setIsOpen(false);
  };

  if (collapsed) {
    return (
      <div className="flex justify-center py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold border-2 border-primary/20">
          {currentState.code}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "cursor-pointer w-full flex items-center justify-between p-3 rounded-2xl border bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 transition-all hover:border-primary/50 group",
          isOpen && "ring-2 ring-primary/20 border-primary",
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shrink-0">
            {currentState.code}
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Selected Region
            </span>
            <span className="text-sm font-bold truncate mt-1">
              {currentState.name}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-4 right-4 top-full mt-2 z-30 bg-card border rounded-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b mb-1">
              Switch States
            </div>
            <div className="max-h-[250px] overflow-y-auto space-y-1">
              {MOCK_STATES.map((state) => (
                <button
                  key={state.id}
                  onClick={() => handleSelect(state)}
                  className={cn(
                    "cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-accent",
                    state.id === currentState.id
                      ? "bg-primary/5 text-primary font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        state.id === currentState.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      {state.code}
                    </div>
                    {state.name}
                  </div>
                  {state.id === currentState.id && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t px-2">
              <button className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-primary hover:bg-primary/5 transition-colors">
                <Globe className="h-4 w-4" />
                Global View (All States)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
