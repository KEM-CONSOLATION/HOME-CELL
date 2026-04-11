import api from "@/config/axios";
import type { Area, AreaWritePayload } from "@/types/area";

const BASE = "/auth/areas/";

export async function listAreas(): Promise<Area[]> {
  const { data } = await api.get<Area[]>(BASE);
  return data;
}

export async function getArea(id: number): Promise<Area> {
  const { data } = await api.get<Area>(`${BASE}${id}/`);
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
