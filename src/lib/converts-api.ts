import type { ConvertRecord } from "@/types/models";
import { dedupedGet } from "@/config/axios";

const BASE = "/auth/converts/";

function normalizeConvertsResponse(payload: unknown): ConvertRecord[] {
  if (Array.isArray(payload)) return payload as ConvertRecord[];

  if (payload && typeof payload === "object") {
    const obj = payload as {
      results?: unknown;
      data?: unknown;
      items?: unknown;
    };

    if (Array.isArray(obj.results)) return obj.results as ConvertRecord[];
    if (Array.isArray(obj.data)) return obj.data as ConvertRecord[];
    if (Array.isArray(obj.items)) return obj.items as ConvertRecord[];
  }

  return [];
}

export async function listConverts(): Promise<ConvertRecord[]> {
  const { data } = await dedupedGet<unknown>(BASE);
  return normalizeConvertsResponse(data);
}
