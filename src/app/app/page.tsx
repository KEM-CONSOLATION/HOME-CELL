"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  TrendingUp,
  UserPlus,
  CalendarCheck,
  Clock,
  ChevronRight,
  Target,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BibleQuoteRotator } from "@/components/dashboard/bible-quote-rotator";
import type { DashboardActivityItem } from "@/types/models";
import {
  dashboardFromLoginResponse,
  type LoginResponse,
} from "@/lib/auth-user";
import { useEffect } from "react";
import { getDashboardStats } from "@/lib/dashboard-api";

function formatRelativeTime(isoDate: string): string {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) return "Just now";

  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(diffMs / 60_000));
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function mapActivityStyle(item: DashboardActivityItem) {
  if (item.type === "ATTENDANCE_SUBMITTED") {
    return {
      icon: CalendarCheck,
      bg: "bg-emerald-100",
      color: "text-emerald-600",
    };
  }
  if (item.type === "MEMBER_ADDED") {
    return { icon: UserPlus, bg: "bg-purple-100", color: "text-purple-600" };
  }
  return { icon: Target, bg: "bg-blue-100", color: "text-blue-600" };
}

export default function DashboardPage() {
  const { user, dashboard, loginResponse, setDashboard } = useStore();
  const fallbackDashboard =
    (loginResponse
      ? dashboardFromLoginResponse(loginResponse as LoginResponse)
      : null) ?? dashboard;
  const dashboardData = dashboard ?? fallbackDashboard;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const latestDashboard = await getDashboardStats();
        if (!cancelled && latestDashboard) {
          setDashboard(latestDashboard);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setDashboard]);

  const stats = [
    {
      title: "Total Members",
      value: dashboardData
        ? dashboardData.stats.totalMembers.toLocaleString()
        : "--",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "New Converts",
      value: dashboardData
        ? dashboardData.stats.newConverts.toLocaleString()
        : "--",
      icon: UserPlus,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Attendance Rate",
      value: dashboardData ? dashboardData.stats.attendanceRate : "--",
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Retention",
      value: dashboardData ? dashboardData.stats.retention : "--",
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const chartData = dashboardData?.graphData ?? [];
  const hasChartData = chartData.length > 0;
  const activityFeed = dashboardData?.activityFeed ?? [];

  const maxY = Math.max(...chartData.map((d) => d.value), 1);
  const minY = 0;
  const padding = { top: 16, right: 16, bottom: 28, left: 36 };
  const w = 900;
  const h = 240;
  const innerW = w - padding.left - padding.right;
  const innerH = h - padding.top - padding.bottom;

  const points = chartData.map((d, i) => {
    const x =
      padding.left +
      (chartData.length === 1
        ? innerW / 2
        : (i / (chartData.length - 1)) * innerW);
    const y =
      padding.top + (1 - (d.value - minY) / (maxY - minY || 1)) * innerH;
    return { x, y, d };
  });

  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time intelligence for {user?.unitName} administrative unit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild size="lg">
            <Link href="/app/attendance/new">
              <Plus />
              Submit Attendance
            </Link>
          </Button>
        </div>
      </div>

      <BibleQuoteRotator />

      {dashboardData ? (
        <Card className="border-none bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-bold text-slate-700">Convert Pipeline</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">
                Pending: {dashboardData.convertStats.pending}
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                In Progress: {dashboardData.convertStats.inProgress}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                Integrated: {dashboardData.convertStats.integrated}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={cn(
              "relative overflow-hidden group border-none bg-white transition-all duration-300 hover:-translate-y-1",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                {stat.title}
              </CardTitle>
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  stat.bg,
                  stat.color,
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                  current snapshot
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-none bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Participation</CardTitle>
                <CardDescription>
                  Visualizing weekly engagement across all cells.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase">
                    Current Week
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {hasChartData ? (
              <div className="w-full">
                <svg
                  viewBox={`0 0 ${w} ${h}`}
                  className="h-[260px] w-full"
                  role="img"
                  aria-label="Attendance line chart"
                  preserveAspectRatio="none"
                >
                  {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                    const y = padding.top + t * innerH;
                    const v = Math.round(maxY * (1 - t));
                    return (
                      <g key={t}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={w - padding.right}
                          y2={y}
                          stroke="rgba(15,23,42,0.08)"
                          strokeWidth="1"
                        />
                        <text
                          x={padding.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="12"
                          fill="rgba(15,23,42,0.55)"
                        >
                          {v}
                        </text>
                      </g>
                    );
                  })}

                  <path
                    d={lineD}
                    fill="none"
                    stroke="var(--brand-blue)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {points.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={5}
                        fill="#ffffff"
                        stroke="var(--brand-blue)"
                        strokeWidth="3"
                      />
                      <title>{`${new Date(p.d.date).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "2-digit",
                        },
                      )} • ${p.d.value}`}</title>
                    </g>
                  ))}

                  {points.map((p, i) => (
                    <text
                      key={i}
                      x={p.x}
                      y={h - 8}
                      textAnchor="middle"
                      fontSize="12"
                      fill="rgba(15,23,42,0.55)"
                    >
                      {new Date(p.d.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "2-digit",
                      })}
                    </text>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="h-[260px] grid place-items-center text-sm text-muted-foreground">
                No attendance graph data available.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none bg-slate-900 text-white relative overflow-hidden h-full">
            <div className="absolute right-[-20%] top-[-20%] h-64 w-64 bg-primary/20 rounded-full blur-[80px]" />
            <CardHeader className="relative z-10 border-b border-white/5 pb-6">
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription className="text-slate-400">
                Common leadership tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-6 space-y-3">
              {[
                {
                  label: "Register Member",
                  icon: UserPlus,
                  href: "/app/members/new",
                },
                { label: "Send Broadcast", icon: Target, href: "/app/chat" },
                {
                  label: "View Compliance",
                  icon: Clock,
                  href: "/app/compliance",
                },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold">{link.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-12 border-none bg-white">
          <CardHeader className="border-b border-slate-50 pb-6 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Global Activity Feed</CardTitle>
                <CardDescription>
                  Recent events across all cells in your network.
                </CardDescription>
              </div>
              <Link
                href="/app/activity"
                className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
              >
                View Full Audit
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              {activityFeed.length > 0 ? (
                activityFeed.map((act) => {
                  const style = mapActivityStyle(act);
                  const Icon = style.icon;
                  return (
                    <div
                      key={act.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                            style.bg,
                            style.color,
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            {act.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              {formatRelativeTime(act.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="cursor-pointer h-9 w-9 rounded-xl hover:bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No activity feed data available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
