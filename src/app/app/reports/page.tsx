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
  FileText,
  Download,
  Filter,
  Calendar,
  BarChart,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportsPage() {
  const { user } = useStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (type: string) => {
    setIsExporting(true);
    setTimeout(() => {
      toast.success(`Report exported as ${type}!`, {
        description: "Your file is ready and downloading.",
      });
      setIsExporting(false);
    }, 1500);
  };

  const reportPacks = [
    {
      title: "Weekly Soul Winning Summary",
      desc: "Consolidated list of all new converts winning across the unit.",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Cell Attendance Audit",
      desc: "Detailed breakdown of meeting compliance and physical attendance.",
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Financial Remittance Report",
      desc: "Tracking offerings and financial obligations from all cells.",
      icon: BarChart,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const recentReports = [
    {
      id: 1,
      name: "March 2024 Monthly Review",
      type: "PDF",
      size: "2.4 MB",
      date: "Apr 02, 2024",
    },
    {
      id: 2,
      name: "Week 12 Attendance Data",
      type: "XLSX",
      size: "1.1 MB",
      date: "Mar 28, 2024",
    },
    {
      id: 3,
      name: "First Quarter Growth Analysis",
      type: "PDF",
      size: "5.8 MB",
      date: "Mar 20, 2024",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Documentation
          </h1>
          <p className="text-muted-foreground mt-1">
            Access and generate intelligence reports for {user?.unitName}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-11 px-6 rounded-xl border font-bold text-sm bg-white hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Report Generation Section */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="border-b border-slate-50 pb-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Available Report Packs
                  </CardTitle>
                  <CardDescription>
                    Select a category to generate a new live report.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportPacks.map((pack, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-2xl border border-slate-50 hover:border-primary/20 hover:bg-slate-50/50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center",
                        pack.bg,
                        pack.color,
                      )}
                    >
                      <pack.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{pack.title}</h4>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {pack.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-black uppercase tracking-widest">
                      Generate
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none bg-white">
            <CardHeader>
              <CardTitle className="text-xl">Custom Report Builder</CardTitle>
              <CardDescription>
                Manually select parameters to build a custom dataset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Date Range
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select className="w-full h-12 pl-12 pr-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium appearance-none">
                      <option>Last 7 Days</option>
                      <option>This Month</option>
                      <option>Quarter to Date</option>
                      <option>All Time</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Data Depth
                  </label>
                  <select className="w-full h-12 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium appearance-none">
                    <option>Summary View</option>
                    <option>Detailed Audit</option>
                    <option>Member Specific</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:translate-y-[-2px] active:translate-y-0 transition-all">
                    Process Request
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History / Downloads */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none bg-white">
            <CardHeader className="pb-4 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Downloads</CardTitle>
                <FileDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">
                          {report.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                          {report.type} • {report.size}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExport(report.type)}
                      className={cn(
                        "h-8 w-8 flex items-center justify-center rounded-lg border hover:bg-white transition-colors",
                        isExporting && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 text-xs font-black uppercase tracking-widest text-primary hover:underline">
                View Complete History
              </button>
            </CardContent>
          </Card>

          <Card className="border-none bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute right-[-10%] bottom-[-10%] h-40 w-40 bg-primary/20 rounded-full blur-[60px]" />
            <CardContent className="pt-8 space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Scheduled Reporting</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Get automated weekly summaries delivered to your email every
                  Sunday night.
                </p>
              </div>
              <button className="w-full h-11 bg-white text-slate-900 font-bold rounded-xl text-sm transition-transform active:scale-95 mt-2">
                Enable Auto-Scheduler
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
