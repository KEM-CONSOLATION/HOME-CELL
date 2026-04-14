import type { User } from "@/types/models";
import type { DashboardSnapshot } from "@/types/models";

/** Login JSON from backend (shape may vary). */
export type LoginResponse = {
  access?: string;
  refresh?: string;
  user?: Record<string, unknown>;
  role?: string;
  dashboard?: {
    stats?: Record<string, unknown>;
    convert_stats?: Record<string, unknown>;
    graph_data?: unknown[];
    activity_feed?: unknown[];
  };
  dashStats?: Record<string, unknown>;
  convert_stats?: Record<string, unknown>;
  graph_data?: unknown[];
  activity_feed?: unknown[];
};

/**
 * Maps API login payload to the `User` shape the app stores.
 * Backend may put `role` on the root; `user` may use first_name/last_name and numeric id.
 */
export function userFromLoginResponse(data: LoginResponse): User | null {
  const u = data.user;
  if (!u || typeof u !== "object") return null;

  const roleRaw = String(data.role ?? u.role ?? "MEMBER");
  const first = String(u.first_name ?? "").trim();
  const last = String(u.last_name ?? "").trim();
  const email = String(u.email ?? "");
  const name = [first, last].filter(Boolean).join(" ") || email || "User";

  return {
    id: String(u.id ?? ""),
    name,
    email,
    role: roleRaw as User["role"],
    unitId: String(u.unit_id ?? u.unitId ?? ""),
    unitName: String(u.unit_name ?? u.unitName ?? "Region"),
    avatar: typeof u.avatar === "string" ? u.avatar : undefined,
  };
}

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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function dashboardFromLoginResponse(
  data: LoginResponse,
): DashboardSnapshot | null {
  const nestedDashboard = asRecord(data.dashboard);
  const rawStats = asRecord(data.dashStats) ?? asRecord(nestedDashboard?.stats);
  const rawConvert =
    asRecord(nestedDashboard?.convert_stats) ?? asRecord(data.convert_stats);
  const rawGraph =
    (Array.isArray(nestedDashboard?.graph_data)
      ? nestedDashboard.graph_data
      : null) ?? data.graph_data;
  const rawActivity =
    (Array.isArray(nestedDashboard?.activity_feed)
      ? nestedDashboard.activity_feed
      : null) ?? data.activity_feed;

  if (!rawStats || !Array.isArray(rawGraph) || !Array.isArray(rawActivity)) {
    return null;
  }

  const stats = {
    totalMembers: toNumber(rawStats.total_members),
    newConverts: toNumber(rawStats.new_converts),
    attendanceRate: toStringValue(
      rawStats.attendance_rate ?? rawStats["attendance-rate"],
      "0%",
    ),
    retention: toStringValue(rawStats.retention, "0%"),
  };

  const convertStats = {
    pending:
      rawConvert && typeof rawConvert === "object"
        ? toNumber(rawConvert.pending)
        : 0,
    inProgress:
      rawConvert && typeof rawConvert === "object"
        ? toNumber(rawConvert.in_progress)
        : 0,
    integrated:
      rawConvert && typeof rawConvert === "object"
        ? toNumber(rawConvert.integrated)
        : 0,
  };

  const graphData = rawGraph
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      return {
        date: toStringValue(item.date),
        value: toNumber(item.number),
      };
    })
    .filter((item): item is DashboardSnapshot["graphData"][number] => {
      return Boolean(item?.date);
    });

  const activityFeed = rawActivity
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      return {
        id: String(item.id ?? ""),
        type: toStringValue(item.type, "SYSTEM"),
        message: toStringValue(item.message),
        timestamp: toStringValue(item.timestamp),
      };
    })
    .filter((item): item is DashboardSnapshot["activityFeed"][number] => {
      return Boolean(item?.id && item.message);
    });

  return {
    stats,
    convertStats,
    graphData,
    activityFeed,
  };
}
