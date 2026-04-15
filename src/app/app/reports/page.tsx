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
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileDown,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import {
  generateReportExcel,
  listRecentReports,
  resolveDateRange,
} from "@/lib/reports-api";
import type { RecentReportRecord, ReportType } from "@/types/models";

export default function ReportsPage() {
  const { user } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [reportType, setReportType] = useState<ReportType>("ATTENDANCE");
  const [recentReports, setRecentReports] = useState<RecentReportRecord[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [recentLoadError, setRecentLoadError] = useState(false);

  const reportTypeLabel =
    reportType === "ATTENDANCE" ? "Attendance" : "Converts";

  function formatTimestamp(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Unknown time";
    return parsed.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function refreshRecentReports() {
    try {
      setIsLoadingRecent(true);
      const items = await listRecentReports();
      setRecentReports(items);
      setRecentLoadError(false);
    } catch (error) {
      console.error("Failed to fetch recent reports:", error);
      setRecentLoadError(true);
    } finally {
      setIsLoadingRecent(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void refreshRecentReports();
  }, []);

  async function handleGenerate(selectedType: ReportType) {
    try {
      setIsGenerating(true);
      const { dateFrom, dateTo } = resolveDateRange(dateRange);
      const blob = await generateReportExcel({
        reportType: selectedType,
        dateFrom,
        dateTo,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const rangeSuffix =
        dateFrom && dateTo ? `${dateFrom}_to_${dateTo}` : "full";
      link.href = url;
      link.setAttribute(
        "download",
        `${selectedType.toLowerCase()}_${rangeSuffix}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report generated successfully", {
        description: `${selectedType} report downloaded as Excel.`,
      });

      await refreshRecentReports();
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Report generation failed", {
        description: "Please check your selections and try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const reportPacks = useMemo(
    () => [
      {
        title: "Attendance Audit",
        desc: "Detailed breakdown of meeting compliance and physical attendance.",
        icon: CheckCircle2,
        color: "text-blue-600",
        bg: "bg-blue-50",
        reportType: "ATTENDANCE" as ReportType,
      },
      {
        title: "Converts Follow-Up Summary",
        desc: "Consolidated view of convert inflow and follow-up progress.",
        icon: TrendingUp,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        reportType: "CONVERTS" as ReportType,
      },
    ],
    [],
  );

  const reportTypeOptions = [
    { value: "ATTENDANCE", label: "Attendance" },
    { value: "CONVERTS", label: "Converts" },
  ];

  const dateRangeOptions = [
    { value: "Last 7 Days", label: "Last 7 Days" },
    { value: "This Month", label: "This Month" },
    { value: "Quarter to Date", label: "Quarter to Date" },
    { value: "All Time", label: "All Time" },
  ];

  const rangePreview = resolveDateRange(dateRange);

  const totalDownloads = recentReports.length;

  const reportInfoText =
    rangePreview.dateFrom && rangePreview.dateTo
      ? `${rangePreview.dateFrom} to ${rangePreview.dateTo}`
      : "Default backend range";

  const handleRefreshHistory = () => {
    void refreshRecentReports();
  };

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
          <button className="cursor-pointer h-11 px-6 rounded-xl border font-bold text-sm bg-white hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
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
                  onClick={() => void handleGenerate(pack.reportType)}
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
                      {isGenerating ? "Generating" : "Generate"}
                    </span>
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
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
                    {mounted ? (
                      <Combobox
                        value={dateRange}
                        onChange={setDateRange}
                        placeholder="Select date range"
                        searchPlaceholder="Search ranges..."
                        options={dateRangeOptions}
                      />
                    ) : (
                      <div className="h-10 rounded-lg border bg-background" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                    Report Type
                  </label>
                  {mounted ? (
                    <Combobox
                      value={reportType}
                      onChange={(value) =>
                        setReportType((value as ReportType) || "ATTENDANCE")
                      }
                      placeholder="Select report type"
                      searchPlaceholder="Search report types..."
                      options={reportTypeOptions}
                    />
                  ) : (
                    <div className="h-10 rounded-lg border bg-background" />
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => void handleGenerate(reportType)}
                    disabled={isGenerating}
                    className={cn(
                      "cursor-pointer w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:translate-y-[-2px] active:translate-y-0 transition-all",
                      isGenerating && "opacity-60 cursor-not-allowed",
                    )}
                  >
                    {isGenerating ? "Generating..." : "Generate Excel"}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Generating{" "}
                <span className="font-semibold">{reportTypeLabel}</span> for{" "}
                <span className="font-semibold">{reportInfoText}</span>.
              </p>
            </CardContent>
          </Card>
        </div>

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
                {isLoadingRecent ? (
                  <div className="py-8 text-sm text-muted-foreground text-center">
                    Loading recent reports...
                  </div>
                ) : recentLoadError ? (
                  <div className="py-8 text-sm text-rose-600 text-center">
                    Failed to load recent history.
                  </div>
                ) : recentReports.length === 0 ? (
                  <div className="py-8 text-sm text-muted-foreground text-center">
                    No recent downloads yet.
                  </div>
                ) : (
                  recentReports.map((report) => (
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
                            {report.fileFormat} •{" "}
                            {formatTimestamp(report.timestamp)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => void handleGenerate(report.reportType)}
                        disabled={isGenerating}
                        className={cn(
                          "cursor-pointer h-8 w-8 flex items-center justify-center rounded-lg border hover:bg-white transition-colors",
                          isGenerating && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={handleRefreshHistory}
                className="cursor-pointer w-full mt-6 py-3 text-xs font-black uppercase tracking-widest text-primary hover:underline"
              >
                Refresh History ({totalDownloads})
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
              <button className="cursor-pointer w-full h-11 bg-white text-slate-900 font-bold rounded-xl text-sm transition-transform active:scale-95 mt-2">
                Enable Auto-Scheduler
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
