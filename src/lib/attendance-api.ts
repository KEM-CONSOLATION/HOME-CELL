import api, { dedupedGet } from "@/config/axios";
import type { AttendanceRecord, AttendanceWrite } from "@/types/models";
import { normalizePaginatedList, type PaginatedList } from "@/lib/pagination";

const BASE = "/auth/attendance/";

export async function listAttendance(): Promise<AttendanceRecord[]> {
  const page = await listAttendancePage(1);
  return page.items;
}

export async function listAttendancePage(
  page = 1,
): Promise<PaginatedList<AttendanceRecord>> {
  const { data } = await dedupedGet<unknown>(BASE, {
    params: page > 1 ? { page } : undefined,
  });
  return normalizePaginatedList<AttendanceRecord>(data);
}

export async function getAttendance(
  id: number | string,
): Promise<AttendanceRecord> {
  const { data } = await dedupedGet<AttendanceRecord>(`${BASE}${id}/`);
  return data;
}

export async function createAttendance(
  body: AttendanceWrite,
): Promise<AttendanceRecord> {
  const { data } = await api.post<AttendanceRecord>(BASE, body);
  return data;
}

export async function updateAttendance(
  id: number | string,
  body: AttendanceWrite,
): Promise<AttendanceRecord> {
  const { data } = await api.put<AttendanceRecord>(`${BASE}${id}/`, body);
  return data;
}

export async function patchAttendance(
  id: number | string,
  body: Partial<AttendanceWrite>,
): Promise<AttendanceRecord> {
  const { data } = await api.patch<AttendanceRecord>(`${BASE}${id}/`, body);
  return data;
}

export async function deleteAttendance(id: number | string): Promise<void> {
  await api.delete(`${BASE}${id}/`);
}
