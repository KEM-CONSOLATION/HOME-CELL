/** Zone as returned by GET /api/auth/zones/ and GET /api/auth/zones/{id}/ */
export type Zone = {
  id: number;
  area_name: string;
  state_name: string;
  name: string;
  created_at: string;
  area: number;
  zonal_leader: number;
};

/** Body for POST /api/auth/zones/ and PUT /api/auth/zones/{id}/ */
export type ZoneWritePayload = {
  name: string;
  area: number;
  zonal_leader: number;
};
