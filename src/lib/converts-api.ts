import type { ConvertRecord } from "@/types/models";
import { listMembers } from "@/lib/members-api";

export async function listConverts(): Promise<ConvertRecord[]> {
  const rows = await listMembers();
  return rows.filter((row) => row.status === "NEW_CONVERT");
}
