"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/dashboard-cards";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Map,
  Activity,
  Award,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const { user } = useStore();

  const growthData = [
    { label: "Jan", value: 45 },
    { label: "Feb", value: 52 },
    { label: "Mar", value: 38 },
    { label: "Apr", value: 65 },
    { label: "May", value: 48 },
    { label: "Jun", value: 72 },
  ];

  const highlights = [
    {
      title: "Retention Rate",
      value: "84%",
      trend: "+2.4%",
      up: true,
      desc: "Converts integrated",
    },
    {
      title: "Avg. Attendance",
      value: "92%",
      trend: "+1.1%",
      up: true,
      desc: "Last 4 weeks",
    },
    {
      title: "Soul Winning",
      value: "156",
      trend: "-5%",
      up: false,
      desc: "New converts this month",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Growth Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Data-driven insights and performance metrics for {user?.unitName}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 px-4 rounded-xl border bg-white flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Last 6 Months
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {highlights.map((item, i) => (
          <Card key={i} className="border-none bg-white">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {item.title}
                  </p>
                  <h3 className="text-3xl font-bold mt-1">{item.value}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.desc}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-black",
                    item.up
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600",
                  )}
                >
                  {item.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {item.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Soul Winning Trends — SVG line chart matching dashboard style */}
        <Card className="lg:col-span-8 border-none bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Soul Winning Trends</CardTitle>
                <CardDescription>
                  Monthly new convert registration volume.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Current Year
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {(() => {
              const w = 900,
                h = 240;
              const padding = { top: 16, right: 16, bottom: 28, left: 36 };
              const innerW = w - padding.left - padding.right;
              const innerH = h - padding.top - padding.bottom;
              const maxY = Math.max(...growthData.map((d) => d.value), 1);
              const minY = 0;

              const points = growthData.map((d, i) => {
                const x =
                  padding.left +
                  (growthData.length === 1
                    ? innerW / 2
                    : (i / (growthData.length - 1)) * innerW);
                const y =
                  padding.top +
                  (1 - (d.value - minY) / (maxY - minY || 1)) * innerH;
                return { x, y, d };
              });

              const lineD = points
                .map(
                  (p, i) =>
                    `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
                )
                .join(" ");

              return (
                <div className="w-full">
                  <svg
                    viewBox={`0 0 ${w} ${h}`}
                    className="h-[260px] w-full"
                    role="img"
                    aria-label="Soul winning line chart"
                    preserveAspectRatio="none"
                  >
                    {/* grid lines */}
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

                    {/* line */}
                    <path
                      d={lineD}
                      fill="none"
                      stroke="var(--brand-blue)"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {/* data points */}
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
                        <title>
                          {p.d.label} • {p.d.value} souls
                        </title>
                      </g>
                    ))}

                    {/* x-axis labels */}
                    {points.map((p, i) => (
                      <text
                        key={i}
                        x={p.x}
                        y={h - 8}
                        textAnchor="middle"
                        fontSize="12"
                        fill="rgba(15,23,42,0.55)"
                      >
                        {p.d.label.toUpperCase()}
                      </text>
                    ))}
                  </svg>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Sector Distribution */}
        <Card className="lg:col-span-4 border-none bg-white">
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
            <CardDescription>Member distribution by status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Baptized Members", value: 75, color: "bg-blue-500" },
              { label: "Trained Workers", value: 45, color: "bg-emerald-500" },
              { label: "New Believers", value: 30, color: "bg-amber-500" },
              { label: "Leaders", value: 15, color: "bg-primary" },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.value}%` }}
                    className={cn(
                      "h-full transition-all duration-1000",
                      item.color,
                    )}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performing Cells */}
        <Card className="lg:col-span-12 border-none bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leadership Leaderboard</CardTitle>
                <CardDescription>
                  Top performing units based on attendance and winning.
                </CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  name: "Grace Cell 1",
                  lead: "Alice Johnson",
                  score: "98.2",
                  rank: 1,
                },
                {
                  name: "Truth Cell 4",
                  lead: "Bob Smith",
                  score: "94.5",
                  rank: 2,
                },
                {
                  name: "Victory Area",
                  lead: "Charlie Brown",
                  score: "91.0",
                  rank: 3,
                },
                {
                  name: "Zion Bridge",
                  lead: "Diana Prince",
                  score: "88.7",
                  rank: 4,
                },
              ].map((unit, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-slate-50 flex items-center justify-between group hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm",
                        unit.rank === 1
                          ? "bg-amber-100 text-amber-600"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {unit.rank === 1 ? (
                        <Award className="h-5 w-5" />
                      ) : (
                        unit.rank
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{unit.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {unit.lead}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary">{unit.score}</p>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                      Growth Index
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
