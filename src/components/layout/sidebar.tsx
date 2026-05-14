"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  CalendarCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  FileText,
  LayoutGrid,
  MapPinned,
  Layers,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Role } from "@/types/models";
import { StateSwitcher } from "./state-switcher";
import { LogoutModal } from "./logout-modal";

/** Sidebar entry keys — order is defined per role below. */
type NavKey =
  | "areas"
  | "zones"
  | "fellowship"
  | "dashboard"
  | "attendance"
  | "members"
  | "converts"
  | "compliance"
  | "reports"
  | "communications";

type NavItemDef = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const NAV: Record<NavKey, NavItemDef> = {
  dashboard: { title: "Dashboard", href: "/app", icon: LayoutDashboard },
  areas: { title: "Areas", href: "/app/areas", icon: MapPinned },
  zones: { title: "Zones", href: "/app/zones", icon: Layers },
  fellowship: {
    title: "Fellowship Cells",
    href: "/app/cells",
    icon: LayoutGrid,
  },
  attendance: {
    title: "Attendance",
    href: "/app/attendance",
    icon: CalendarCheck,
  },
  members: { title: "Members", href: "/app/members", icon: Users },
  converts: { title: "New Converts", href: "/app/converts", icon: UserPlus },
  compliance: {
    title: "Compliance",
    href: "/app/compliance",
    icon: ShieldCheck,
  },
  reports: { title: "Reports", href: "/app/reports", icon: FileText },
  communications: {
    title: "Communications",
    href: "/app/chat",
    icon: MessageSquare,
  },
};

/**
 * Backend roles only: STATE_LEADER, AREA_LEADER, ZONAL_LEADER, CELL_LEADER.
 * Higher roles get more structure tabs (Areas → Zones → Fellowship), then ops.
 */
const SIDEBAR_ORDER_BY_ROLE: Record<Role, NavKey[]> = {
  CELL_LEADER: [
    "dashboard",
    "attendance",
    "members",
    "converts",
    "compliance",
    "reports",
    "communications",
  ],
  ZONAL_LEADER: [
    "dashboard",
    "attendance",
    "members",
    "converts",
    "fellowship",
    "compliance",
    "reports",
    "communications",
  ],
  AREA_LEADER: [
    "dashboard",
    "attendance",
    "members",
    "converts",
    "zones",
    "fellowship",
    "compliance",
    "reports",
    "communications",
  ],
  STATE_LEADER: [
    "dashboard",
    "attendance",
    "members",
    "converts",
    "areas",
    "zones",
    "fellowship",
    "compliance",
    "reports",
    "communications",
  ],
};

function navItemsForRole(role: Role | undefined): NavItemDef[] {
  if (!role) return [];
  const keys = SIDEBAR_ORDER_BY_ROLE[role];
  if (!keys?.length) return [];
  return keys.map((k) => NAV[k]).filter(Boolean);
}

export function Sidebar({
  mobile,
  onCloseMobile,
}: {
  mobile?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, resetAuth } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navScrollRef = useRef<HTMLDivElement | null>(null);
  const [showBottomScrollHint, setShowBottomScrollHint] = useState(false);

  const handleLogout = () => {
    resetAuth();
    router.push("/");
  };

  const filteredNavItems = useMemo(
    () => navItemsForRole(user?.role),
    [user?.role],
  );

  const isCollapsed = mobile ? false : collapsed;

  const updateScrollHint = useCallback(() => {
    const node = navScrollRef.current;
    if (!node) {
      setShowBottomScrollHint(false);
      return;
    }
    const canScroll = node.scrollHeight - node.clientHeight > 4;
    const atBottom =
      node.scrollTop + node.clientHeight >= node.scrollHeight - 4;
    setShowBottomScrollHint(canScroll && !atBottom);
  }, []);

  useEffect(() => {
    const node = navScrollRef.current;
    if (!node) return;
    const rafId = window.requestAnimationFrame(updateScrollHint);

    node.addEventListener("scroll", updateScrollHint, { passive: true });
    window.addEventListener("resize", updateScrollHint);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateScrollHint())
        : null;

    if (observer) observer.observe(node);

    return () => {
      window.cancelAnimationFrame(rafId);
      node.removeEventListener("scroll", updateScrollHint);
      window.removeEventListener("resize", updateScrollHint);
      observer?.disconnect();
    };
  }, [updateScrollHint, filteredNavItems.length, isCollapsed, mobile]);

  return (
    <div
      className={cn(
        "relative flex h-dvh flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {mobile && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="cursor-pointer absolute right-3 top-3 h-10 w-10 rounded-xl border bg-background hover:bg-accent transition-colors flex items-center justify-center"
          aria-label="Close sidebar"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
      )}
      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
      <div
        className={cn(
          "flex items-center h-40 px-6",
          isCollapsed && "justify-center px-0",
        )}
      >
        <Link href="/app" className="w-full">
          <div
            className={cn(
              "relative transition-all duration-300",
              isCollapsed ? "h-14 w-14" : "h-40 w-full",
            )}
          >
            <Image
              src="/logo.png"
              alt="Salvation Ministries Logo"
              fill
              sizes={isCollapsed ? "56px" : "256px"}
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      <StateSwitcher collapsed={isCollapsed} />

      <div className="relative flex-1 min-h-0">
        <div
          ref={navScrollRef}
          className="h-full overflow-y-auto px-3 py-2 space-y-1"
        >
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/95"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
                  isCollapsed && "justify-center px-0",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    !isActive && "group-hover:scale-110",
                    isActive && "scale-105",
                  )}
                />
                {!isCollapsed && (
                  <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.title}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        {showBottomScrollHint && !isCollapsed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-1">
            <div className="rounded-xl bg-linear-to-t from-card via-card/85 to-transparent pt-7 pb-1 flex items-center justify-center gap-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
              Scroll for more
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-4 border-t space-y-2">
        {!isCollapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Settings
            </p>
          </div>
        )}
        <Link
          href="/app/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
            isCollapsed && "justify-center px-0",
          )}
        >
          <Settings className="h-5 w-5" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={cn(
            "cursor-pointer w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10",
            isCollapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {!mobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}
