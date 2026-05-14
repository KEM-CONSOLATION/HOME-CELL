export type Area = {
  id: number;
  state_name: string;
  name: string;
  created_at: string;
  state: number;
  /** Leader user id (may be omitted on some API responses). */
  area_leader?: number | null;
  /** Display name returned by the API (e.g. list/detail). */
  leader_name?: string | null;
};

export type AreaWritePayload = {
  name: string;
  state: number;
  area_leader: number;
};
