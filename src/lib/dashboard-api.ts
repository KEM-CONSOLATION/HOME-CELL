import { dedupedGet } from "@/config/axios";
import {
  dashboardFromLoginResponse,
  type LoginResponse,
} from "@/lib/auth-user";
import type { DashboardSnapshot } from "@/types/models";

export async function getDashboardStats(): Promise<DashboardSnapshot | null> {
  const response = await dedupedGet<LoginResponse>("/auth/dashboard/stats/");
  return dashboardFromLoginResponse(response.data);
}
