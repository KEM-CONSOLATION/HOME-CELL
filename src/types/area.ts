export type Area = {
  id: number;
  state_name: string;
  name: string;
  created_at: string;
  state: number;
  area_leader: number;
};

export type AreaWritePayload = {
  name: string;
  state: number;
  area_leader: number;
};
