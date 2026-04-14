import api, { dedupedGet } from "@/config/axios";
import type { State, StateWritePayload } from "@/types/state";

const BASE = "/auth/states/";

export async function listStates(): Promise<State[]> {
  const { data } = await dedupedGet<State[]>(BASE);
  return data;
}

export async function getState(id: number): Promise<State> {
  const { data } = await dedupedGet<State>(`${BASE}${id}/`);
  return data;
}

export async function createState(body: StateWritePayload): Promise<State> {
  const { data } = await api.post<State>(BASE, body);
  return data;
}

export async function updateState(
  id: number,
  body: StateWritePayload,
): Promise<State> {
  const { data } = await api.put<State>(`${BASE}${id}/`, body);
  return data;
}

export async function patchState(
  id: number,
  body: Partial<StateWritePayload>,
): Promise<State> {
  const { data } = await api.patch<State>(`${BASE}${id}/`, body);
  return data;
}

export async function deleteState(id: number): Promise<void> {
  await api.delete(`${BASE}${id}/`);
}
