import api from "@/config/axios";
import type { Cell, CellWritePayload } from "@/types/cell";

const BASE = "/auth/cells/";

export async function listCells(): Promise<Cell[]> {
  const { data } = await api.get<Cell[]>(BASE);
  return data;
}

export async function getCell(id: number | string): Promise<Cell> {
  const { data } = await api.get<Cell>(`${BASE}${id}/`);
  return data;
}

export async function createCell(body: CellWritePayload): Promise<Cell> {
  const { data } = await api.post<Cell>(BASE, body);
  return data;
}

export async function updateCell(
  id: number | string,
  body: CellWritePayload,
): Promise<Cell> {
  const { data } = await api.put<Cell>(`${BASE}${id}/`, body);
  return data;
}

export async function deleteCell(id: number | string): Promise<void> {
  await api.delete(`${BASE}${id}/`);
}
