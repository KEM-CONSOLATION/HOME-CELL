"use client";

import { useStore } from "@/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from "@/components/ui/dashboard-cards";
import {
  History,
  Search,
  Filter,
  Download,
  UserPlus,
  CalendarCheck,
  Settings,
  ShieldAlert,
  MessageSquare,
  Clock,
  ArrowRight,
  Database,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ActivityAuditPage() {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const auditLogs = [
    {
      id: 1,
      user: "Alice Johnson",
      role: "Cell Leader",
      action: "Registered a new convert",
      target: "Frank Castle",
      time: "12 mins ago",
      category: "Fellowship",
      icon: UserPlus,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      id: 2,
      user: "Victory Cell",
      role: "Cell Unit",
      action: "Submitted weekly report",
      target: "Week 14",
      time: "45 mins ago",
      category: "Compliance",
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: 3,
      user: "System",
      role: "System Auto",
      action: "Broadcast to unit members",
      target: "Mid-week Service Reminder",
      time: "2 hours ago",
      category: "Communication",
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: 4,
      user: "Zion Bridge",
      role: "Area Unit",
      action: "Bulk added 3 new members",
      target: "New Member Class",
      time: "5 hours ago",
      category: "Membership",
      icon: Database,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      id: 5,
      user: "Admin",
      role: "System Admin",
      action: "Updated 2FA settings for",
      target: "John Doe",
      time: "Yesterday",
      category: "Security",
      icon: ShieldAlert,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      id: 6,
      user: "Grace Cell 1",
      role: "Cell Unit",
      action: "Established new fellowship",
      target: "Center G-4",
      time: "2 days ago",
      category: "Fellowship",
      icon: Settings,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
  ];

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Global Activity Audit
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive immutable log of every operation within{" "}
            {user?.unitName}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="cursor-pointer h-11 px-6 rounded-xl border bg-white font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Audit Trial
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="text-lg">Filter Audit</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  Log Category
                </p>
                <div className="space-y-1">
                  {[
                    "Fellowship",
                    "Membership",
                    "Communication",
                    "Security",
                    "System",
                  ].map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer group transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/5"
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 mb-4">
                  Date Constraint
                </p>
                <select className="w-full h-11 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-xs appearance-none">
                  <option>Today Only</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Custom Range</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-slate-900 text-white p-6 relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-10%] h-32 w-32 bg-primary/20 rounded-full blur-[40px]" />
            <div className="relative z-10 flex flex-col gap-3">
              <History className="h-8 w-8 text-primary" />
              <h4 className="font-bold">Security Integrity</h4>
              <p className="text-xs text-slate-400">
                Audit logs are immutable and cannot be deleted or modified by
                any user role.
              </p>
            </div>
          </Card>
        </div>

        {/* Audit Feed */}
        <div className="lg:col-span-9 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search audit trail by user, action, or target..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-xl border bg-slate-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-6 rounded-lg border border-slate-50 hover:bg-slate-50/50 transition-all group flex items-start justify-between gap-6"
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100",
                          log.bg,
                          log.color,
                        )}
                      >
                        <log.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-white border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500">
                            {log.category}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="text-[10px] font-bold uppercase">
                              {log.time}
                            </span>
                          </div>
                        </div>
                        <p className="text-lg font-medium text-slate-700 leading-snug">
                          <span className="font-bold text-slate-900 underline decoration-primary/20 decoration-2 underline-offset-4 cursor-pointer hover:text-primary transition-colors">
                            {log.user}
                          </span>{" "}
                          {log.action.toLowerCase()}{" "}
                          <span className="font-bold text-slate-900 border-b border-dashed border-slate-300">
                            {log.target}
                          </span>
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-slate-300" />
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Executor Rank: {log.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <button className="cursor-pointer h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-primary/20 transition-all">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <div className="text-[9px] font-black text-slate-300 uppercase select-none">
                        ID-{log.id.toString().padStart(5, "0")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 py-6 text-center border-t border-dashed border-slate-100">
                <p className="text-xs font-bold text-muted-foreground">
                  End of current trail. Load more historical data.
                </p>
                <button className="cursor-pointer mt-4 px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:scale-105 transition-transform">
                  Load archive for March 2024
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
