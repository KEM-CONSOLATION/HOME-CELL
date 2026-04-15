import api, { dedupedGet } from "@/config/axios";
import type { Area, AreaWritePayload } from "@/types/area";
import { normalizePaginatedList, type PaginatedList } from "@/lib/pagination";

const BASE = "/auth/areas/";

export async function listAreas(): Promise<Area[]> {
  const items: Area[] = [];
  let page = 1;

  while (true) {
    const response = await listAreasPage(page);
    items.push(...response.items);
    if (!response.next) break;
    page += 1;
    if (page > 200) break;
  }

  return items;
}

export async function listAreasPage(page = 1): Promise<PaginatedList<Area>> {
  const { data } = await dedupedGet<unknown>(BASE, {
    params: page > 1 ? { page } : undefined,
  });
  return normalizePaginatedList<Area>(data);
}

export async function getArea(id: number): Promise<Area> {
  const { data } = await dedupedGet<Area>(`${BASE}${id}/`);
  return data;
}

export async function createArea(body: AreaWritePayload): Promise<Area> {
  const { data } = await api.post<Area>(BASE, body);
  return data;
}

export async function updateArea(
  id: number,
  body: AreaWritePayload,
): Promise<Area> {
  const { data } = await api.put<Area>(`${BASE}${id}/`, body);
  return data;
}

export async function patchArea(
  id: number,
  body: Partial<AreaWritePayload>,
): Promise<Area> {
  const { data } = await api.patch<Area>(`${BASE}${id}/`, body);
  return data;
}

export async function deleteArea(id: number): Promise<void> {
  await api.delete(`${BASE}${id}/`);
}
