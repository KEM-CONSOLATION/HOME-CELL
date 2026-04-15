import api, { dedupedGet } from "@/config/axios";
import type { RecentReportRecord, ReportType } from "@/types/models";

type RecentReportApiItem = {
  id?: number;
  report_type?: unknown;
  name?: unknown;
  file_format?: unknown;
  timestamp?: unknown;
};

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeReportType(value: unknown): ReportType {
  return toStringValue(value).toUpperCase() === "CONVERTS"
    ? "CONVERTS"
    : "ATTENDANCE";
}

function toIsoDate(input: Date): string {
  const year = input.getFullYear();
  const month = `${input.getMonth() + 1}`.padStart(2, "0");
  const day = `${input.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDays(input: Date, days: number): Date {
  const date = new Date(input);
  date.setDate(date.getDate() + days);
  return date;
}

export function resolveDateRange(range: string): {
  dateFrom?: string;
  dateTo?: string;
} {
  const today = new Date();

  if (range === "Last 7 Days") {
    return {
      dateFrom: toIsoDate(shiftDays(today, -7)),
      dateTo: toIsoDate(today),
    };
  }

  if (range === "This Month") {
    return {
      dateFrom: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      dateTo: toIsoDate(today),
    };
  }

  if (range === "Quarter to Date") {
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
    return {
      dateFrom: toIsoDate(new Date(today.getFullYear(), quarterStartMonth, 1)),
      dateTo: toIsoDate(today),
    };
  }

  return {};
}

export async function listRecentReports(): Promise<RecentReportRecord[]> {
  const { data } = await dedupedGet<unknown>("/auth/reports/recent/");
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      const report = item as RecentReportApiItem;
      const id =
        typeof report.id === "number" && Number.isFinite(report.id)
          ? report.id
          : null;
      const name = toStringValue(report.name);
      if (id == null || !name) return null;

      return {
        id,
        reportType: normalizeReportType(report.report_type),
        name,
        fileFormat: toStringValue(report.file_format, "XLSX"),
        timestamp: toStringValue(report.timestamp),
      };
    })
    .filter((item): item is RecentReportRecord => item !== null);
}

export async function generateReportExcel(input: {
  reportType: ReportType;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Blob> {
  const payload: Record<string, string> = {
    report_type: input.reportType,
  };

  if (input.dateFrom) payload.date_from = input.dateFrom;
  if (input.dateTo) payload.date_to = input.dateTo;

  const response = await api.post<Blob>("/auth/reports/generate/", payload, {
    responseType: "blob",
  });
  return response.data;
}
