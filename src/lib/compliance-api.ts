import { dedupedGet } from "@/config/axios";
import type {
  ComplianceSnapshot,
  ComplianceUnitSnapshot,
  ComplianceUnitStatus,
} from "@/types/models";

type ComplianceApiResponse = {
  metrics?: Record<string, unknown>;
  unit_directory?: unknown[];
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeStatus(value: unknown): ComplianceUnitStatus {
  const status = toStringValue(value).toUpperCase();
  if (status === "COMPLIANT" || status === "OVERDUE") return status;
  return "PENDING";
}

function normalizeUnit(item: unknown): ComplianceUnitSnapshot | null {
  if (!item || typeof item !== "object") return null;

  const unit = item as Record<string, unknown>;
  const id = unit.id != null ? String(unit.id) : "";
  const name = toStringValue(unit.name);
  if (!name) return null;

  return {
    id: id || name,
    name,
    leader: toStringValue(unit.leader, "Unassigned"),
    status: normalizeStatus(unit.status),
    overdueLevel: toNumber(unit.overdue_level),
    lastSubmission: toStringValue(unit.last_submission, "-"),
    discipline: Math.max(0, Math.min(100, toNumber(unit.discipline))),
  };
}

export async function getComplianceSnapshot(): Promise<ComplianceSnapshot> {
  const { data } = await dedupedGet<ComplianceApiResponse>(
    "/auth/dashboard/compliance/",
  );
  const metrics = data?.metrics ?? {};

  const unitDirectoryRaw = Array.isArray(data?.unit_directory)
    ? data.unit_directory
    : [];

  return {
    metrics: {
      overallCompliance: toStringValue(metrics.overall_compliance, "0%"),
      reportsReceived: toStringValue(metrics.reports_received, "0/0"),
      pendingToday: toNumber(metrics.pending_today),
      overdueReports: toNumber(metrics.overdue_reports),
    },
    unitDirectory: unitDirectoryRaw
      .map(normalizeUnit)
      .filter((item): item is ComplianceUnitSnapshot => item !== null),
  };
}
