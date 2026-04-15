import type { ConvertRecord } from "@/types/models";
import { dedupedGet } from "@/config/axios";
import { normalizePaginatedList, type PaginatedList } from "@/lib/pagination";

const BASE = "/auth/converts/";

export async function listConverts(): Promise<ConvertRecord[]> {
  const page = await listConvertsPage(1);
  return page.items;
}

export async function listConvertsPage(
  page = 1,
): Promise<PaginatedList<ConvertRecord>> {
  const { data } = await dedupedGet<unknown>(BASE, {
    params: page > 1 ? { page } : undefined,
  });
  return normalizePaginatedList<ConvertRecord>(data);
}
