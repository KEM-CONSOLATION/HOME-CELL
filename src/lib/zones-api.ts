import api, { dedupedGet } from "@/config/axios";
import type { Zone, ZoneWritePayload } from "@/types/zone";

const BASE = "/auth/zones/";

export async function listZones(): Promise<Zone[]> {
  const { data } = await dedupedGet<Zone[]>(BASE);
  return data;
}

export async function getZone(id: number): Promise<Zone> {
  const { data } = await dedupedGet<Zone>(`${BASE}${id}/`);
  return data;
}

export async function createZone(body: ZoneWritePayload): Promise<Zone> {
  const { data } = await api.post<Zone>(BASE, body);
  return data;
}

export async function updateZone(
  id: number,
  body: ZoneWritePayload,
): Promise<Zone> {
  const { data } = await api.put<Zone>(`${BASE}${id}/`, body);
  return data;
}

export async function patchZone(
  id: number,
  body: Partial<ZoneWritePayload>,
): Promise<Zone> {
  const { data } = await api.patch<Zone>(`${BASE}${id}/`, body);
  return data;
}

export async function deleteZone(id: number): Promise<void> {
  await api.delete(`${BASE}${id}/`);
}
