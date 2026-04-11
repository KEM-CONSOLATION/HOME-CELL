/** State as returned by GET /api/auth/states/ and GET /api/auth/states/{id}/ */
export type State = {
  id: number;
  name: string;
  created_at: string;
  state_pastor: number;
};

/** Body for POST /api/auth/states/ and PUT /api/auth/states/{id}/ */
export type StateWritePayload = {
  name: string;
  state_pastor: number;
};
