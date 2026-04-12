"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
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
  Landmark,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { useState } from "react";
import { StateSwitcher } from "./state-switcher";
import { LogoutModal } from "./logout-modal";

const navItems = [
  {
    title: "Dashboard",
    href: "/app",
    icon: LayoutDashboard,
    roles: [
      "MEMBER",
      "CELL_LEADER",
      "ZONAL_LEADER",
      "AREA_LEADER",
      "STATE_LEADER",
      "STATE_PASTOR",
      "ADMIN",
    ],
  },
  {
    title: "Attendance",
    href: "/app/attendance",
    icon: CalendarCheck,
    roles: [
      "MEMBER",
      "CELL_LEADER",
      "ZONAL_LEADER",
      "AREA_LEADER",
      "STATE_LEADER",
      "STATE_PASTOR",
      "ADMIN",
    ],
  },
  {
    title: "Members",
    href: "/app/members",
    icon: Users,
    roles: [
      "MEMBER",
      "CELL_LEADER",
      "ZONAL_LEADER",
      "AREA_LEADER",
      "STATE_LEADER",
      "STATE_PASTOR",
      "ADMIN",
    ],
  },
  {
    title: "New Converts",
    href: "/app/converts",
    icon: UserPlus,
    roles: [
      "MEMBER",
      "CELL_LEADER",
      "ZONAL_LEADER",
      "AREA_LEADER",
      "STATE_LEADER",
      "STATE_PASTOR",
      "ADMIN",
    ],
  },
  {
    title: "States",
    href: "/app/states",
    icon: Landmark,
    roles: ["STATE_LEADER", "STATE_PASTOR", "ADMIN"],
  },
  {
    title: "Areas",
    href: "/app/areas",
    icon: MapPinned,
    roles: [
      "ZONAL_LEADER",
      "AREA_LEADER",
      "STATE_LEADER",
      "STATE_PASTOR",
      "ADMIN",
    ],
  },
  {
    title: "Zones",
    href: "/app/zones",
    icon: Layers,
    roles: [
      "ZONAL_LEADER",
      "AREA_LEADER",
      "STATE_LEADER",
      "STATE_PASTOR",
      "ADMIN",
    ],
  },
  {
    title: "Fellowship Cells",
    href: "/app/cells",
    icon: LayoutGrid,
    roles: [
      "ZONAL_LEADER",
      "AREA_LEADER",
      "STATE_LEADER",
      "STATE_PASTOR",
      "ADMIN",
    ],
  },
  {
    title: "Compliance",
    href: "/app/compliance",
    icon: ShieldCheck,
    roles: [
      "ZONAL_LEADER",
      "AREA_LEADER",
      "STATE_LEADER",
      "STATE_PASTOR",
      "ADMIN",
    ],
  },
  {
    title: "Reports",
    href: "/app/reports",
    icon: FileText,
    roles: [
      "ZONAL_LEADER",
      "AREA_LEADER",
      "STATE_LEADER",
      "STATE_PASTOR",
      "ADMIN",
    ],
  },
  {
    title: "Communications",
    href: "/app/chat",
    icon: MessageSquare,
    roles: ["STATE_LEADER", "STATE_PASTOR", "ADMIN"],
  },
  {
    title: "Analytics",
    href: "/app/analytics",
    icon: BarChart3,
    roles: ["STATE_PASTOR", "ADMIN"],
  },
];

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

  const handleLogout = () => {
    resetAuth();
    router.push("/");
  };

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const isCollapsed = mobile ? false : collapsed;

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

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
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
              <item.icon
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
