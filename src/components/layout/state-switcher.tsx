"use client";

import { useRef, useState } from "react";
import { ChevronDown, Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { listStates } from "@/lib/states-api";
import type { State } from "@/types/state";

function stateInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "—";
}

export function StateSwitcher({ collapsed }: { collapsed: boolean }) {
  const { user, setUser } = useStore();
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetchedStates, setHasFetchedStates] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isFetchingRef = useRef(false);

  const ensureStatesLoaded = () => {
    if (hasFetchedStates || isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    void listStates()
      .then((rows) => {
        setStates([...rows].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => setStates([]))
      .finally(() => {
        setHasFetchedStates(true);
        setLoading(false);
        isFetchingRef.current = false;
      });
  };

  const currentState =
    states.find((s) => String(s.id) === user?.unitId) ?? states[0];

  const handleSelect = (state: State) => {
    if (user) {
      setUser({
        ...user,
        unitId: String(state.id),
        unitName: state.name,
      });
    }
    setIsOpen(false);
  };

  const badge = currentState
    ? stateInitials(currentState.name)
    : user?.unitName
      ? stateInitials(user.unitName)
      : "—";

  const label = currentState?.name ?? user?.unitName ?? "Select region";

  if (collapsed) {
    return (
      <div className="flex justify-center py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold border-2 border-primary/20 text-xs">
          {badge}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 relative">
      <button
        type="button"
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) ensureStatesLoaded();
        }}
        disabled={loading}
        className={cn(
          "cursor-pointer w-full flex items-center justify-between p-3 rounded-2xl border bg-white/50 backdrop-blur-sm dark:bg-zinc-900/50 transition-all hover:border-primary/50 group",
          loading && "opacity-80 cursor-default",
          isOpen && "ring-2 ring-primary/20 border-primary",
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shrink-0 text-xs">
            {loading ? "…" : badge}
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Selected Region
            </span>
            <span className="text-sm font-bold truncate mt-1">
              {loading ? "Loading..." : label}
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
            aria-hidden
          />
          <div className="absolute left-4 right-4 top-full mt-2 z-30 bg-card border rounded-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b mb-1">
              Switch States
            </div>
            {loading ? (
              <div className="px-3 py-5 text-sm text-muted-foreground">
                Loading states...
              </div>
            ) : states.length === 0 ? (
              <div className="px-3 py-5 text-sm text-muted-foreground">
                No states available.
              </div>
            ) : (
              <div className="max-h-[250px] overflow-y-auto space-y-1">
                {states.map((state) => (
                  <button
                    type="button"
                    key={state.id}
                    onClick={() => handleSelect(state)}
                    className={cn(
                      "cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-accent",
                      String(state.id) === user?.unitId
                        ? "bg-primary/5 text-primary font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold",
                          String(state.id) === user?.unitId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                        )}
                      >
                        {stateInitials(state.name)}
                      </div>
                      {state.name}
                    </div>
                    {String(state.id) === user?.unitId && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2 pt-2 border-t px-2">
              <button
                type="button"
                className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
              >
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
