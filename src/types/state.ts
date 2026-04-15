export type State = {
  id: number;
  name: string;
  created_at: string;
  state_pastor: number;
};

export type StateWritePayload = {
  name: string;
  state_pastor: number;
};
