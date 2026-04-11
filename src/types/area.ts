/** Area as returned by GET /api/auth/areas/ and GET /api/auth/areas/{id}/ */
export type Area = {
  id: number;
  state_name: string;
  name: string;
  created_at: string;
  state: number;
  area_leader: number;
};

/** Body for POST /api/auth/areas/ and PUT /api/auth/areas/{id}/ */
export type AreaWritePayload = {
  name: string;
  state: number;
  area_leader: number;
};
