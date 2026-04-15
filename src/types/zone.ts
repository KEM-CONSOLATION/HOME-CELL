export type Zone = {
  id: number;
  area_name: string;
  state_name: string;
  name: string;
  created_at: string;
  area: number;
  zonal_leader: number;
};

export type ZoneWritePayload = {
  name: string;
  area: number;
  zonal_leader: number;
};
