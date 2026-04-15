"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  LayoutDashboard,
  Users,
  LayoutGrid,
  UserPlus,
  FileText,
  CalendarCheck,
  BarChart3,
  MessageSquare,
  Settings,
  ShieldCheck,
  History,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listCells } from "@/lib/cells-api";
import type { Cell } from "@/types/cell";
import { getDeletedCellIds } from "@/lib/cell-deletions";
import { cn } from "@/lib/utils";

type SearchHit = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  group: string;
  icon: LucideIcon;
};

const NAV_HITS: Omit<SearchHit, "id">[] = [
  {
    title: "Dashboard",
    subtitle: "Overview and quick actions",
    href: "/app",
    group: "Navigation",
    icon: LayoutDashboard,
  },
  {
    title: "Activity",
    subtitle: "Audit and timeline",
    href: "/app/activity",
    group: "Navigation",
    icon: History,
  },
  {
    title: "Attendance",
    subtitle: "Records and submissions",
    href: "/app/attendance",
    group: "Navigation",
    icon: CalendarCheck,
  },
  {
    title: "Members",
    subtitle: "Directory",
    href: "/app/members",
    group: "Navigation",
    icon: Users,
  },
  {
    title: "New Converts",
    subtitle: "Follow-up list",
    href: "/app/converts",
    group: "Navigation",
    icon: UserPlus,
  },
  {
    title: "Fellowship Cells",
    subtitle: "Cell directory",
    href: "/app/cells",
    group: "Navigation",
    icon: LayoutGrid,
  },
  {
    title: "Reports",
    subtitle: "Analytics and exports",
    href: "/app/reports",
    group: "Navigation",
    icon: FileText,
  },
  {
    title: "Compliance",
    subtitle: "Policies and audits",
    href: "/app/compliance",
    group: "Navigation",
    icon: ShieldCheck,
  },
  {
    title: "Analytics",
    subtitle: "Charts and trends",
    href: "/app/analytics",
    group: "Navigation",
    icon: BarChart3,
  },
  {
    title: "Communications",
    subtitle: "Broadcasts and messages",
    href: "/app/chat",
    group: "Navigation",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    subtitle: "Account and preferences",
    href: "/app/settings",
    group: "Navigation",
    icon: Settings,
  },
];

function cellsToSearchHits(cells: Cell[]): SearchHit[] {
  const dc = new Set(getDeletedCellIds());
  return cells
    .filter((c) => !dc.has(String(c.id)))
    .map((c) => ({
      id: `cell-${c.id}`,
      title: c.name,
      subtitle: `Cell #${c.id}`,
      href: `/app/cells/${c.id}`,
      group: "Cells",
      icon: LayoutGrid,
    }));
}

function matchesQuery(hit: SearchHit, q: string): boolean {
  if (!q) return false;
  const hay = `${hit.title} ${hit.subtitle ?? ""} ${hit.group}`.toLowerCase();
  return q.split(/\s+/).every((word) => hay.includes(word));
}

export function GlobalSearch() {
  const router = useRouter();
  const inputId = "global-search-input";
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [cells, setCells] = useState<Cell[]>([]);
  const [hasLoadedCells, setHasLoadedCells] = useState(false);
  const [loadingCells, setLoadingCells] = useState(false);
  const isFetchingCellsRef = useRef(false);

  const ensureCellsLoaded = useCallback(() => {
    if (hasLoadedCells || isFetchingCellsRef.current) return;
    isFetchingCellsRef.current = true;
    setLoadingCells(true);
    void listCells()
      .then(setCells)
      .catch(() => setCells([]))
      .finally(() => {
        setHasLoadedCells(true);
        setLoadingCells(false);
        isFetchingCellsRef.current = false;
      });
  }, [hasLoadedCells]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const nav: SearchHit[] = NAV_HITS.map((n, i) => ({
      ...n,
      id: `nav-${i}`,
    }));
    const index = [...nav, ...cellsToSearchHits(cells)];
    return index.filter((h) => matchesQuery(h, q)).slice(0, 12);
  }, [query, cells]);

  const showPanel = open && query.trim().length > 0;

  const safeIndex =
    results.length === 0
      ? 0
      : Math.min(active, Math.max(0, results.length - 1));

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
      inputRef.current?.blur();
    },
    [router],
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showPanel || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[safeIndex];
      if (hit) go(hit.href);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full",
        "md:max-w-[min(40vw,28rem)] lg:max-w-[min(40vw,32rem)]",
      )}
    >
      <label htmlFor={inputId} className="sr-only">
        Global search
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="global-search-results"
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Search for members, cells, or reports..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
            if (e.target.value.trim().length > 0) ensureCellsLoaded();
          }}
          onFocus={() => {
            setOpen(true);
            if (query.trim().length > 0) ensureCellsLoaded();
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "h-11 w-full rounded-xl border border-primary/20 bg-background pl-11 pr-20 text-sm shadow-sm",
            "placeholder:text-muted-foreground/80",
            "transition-[box-shadow,border-color] duration-200",
            "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15",
            "hover:border-primary/30",
          )}
        />
        <kbd
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded-md border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex"
          aria-hidden
        >
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(24rem,70vh)] overflow-auto rounded-2xl border bg-popover p-2 shadow-xl",
            "animate-in fade-in slide-in-from-top-2 duration-200",
          )}
        >
          {loadingCells ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Loading search index...
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matches for &quot;{query.trim()}&quot;. Try another name,
              phone, or page.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {results.map((hit, i) => {
                const Icon = hit.icon;
                const selected = i === safeIndex;
                return (
                  <li key={hit.id} role="option" aria-selected={selected}>
                    <Link
                      href={hit.href}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => go(hit.href)}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "bg-primary/10 text-foreground"
                          : "hover:bg-muted/80",
                      )}
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {hit.title}
                        </p>
                        {hit.subtitle ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {hit.subtitle}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary/80">
                          {hit.group}
                        </p>
                      </div>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="border-t px-3 py-2 text-[10px] text-muted-foreground">
            <span className="font-medium">↑↓</span> to move ·{" "}
            <span className="font-medium">Enter</span> to open ·{" "}
            <span className="font-medium">Esc</span> to close
          </p>
        </div>
      )}
    </div>
  );
}
