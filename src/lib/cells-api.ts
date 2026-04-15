import api, { dedupedGet } from "@/config/axios";
import type { Cell, CellWritePayload } from "@/types/cell";
import { normalizePaginatedList, type PaginatedList } from "@/lib/pagination";

const BASE = "/auth/cells/";

export async function listCells(): Promise<Cell[]> {
  const items: Cell[] = [];
  let page = 1;

  while (true) {
    const response = await listCellsPage(page);
    items.push(...response.items);
    if (!response.next) break;
    page += 1;
    if (page > 200) break;
  }

  return items;
}

export async function listCellsPage(page = 1): Promise<PaginatedList<Cell>> {
  const { data } = await dedupedGet<unknown>(BASE, {
    params: page > 1 ? { page } : undefined,
  });
  return normalizePaginatedList<Cell>(data);
}

export async function getCell(id: number | string): Promise<Cell> {
  const { data } = await dedupedGet<Cell>(`${BASE}${id}/`);
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
