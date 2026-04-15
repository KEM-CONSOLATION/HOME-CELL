export type Cell = {
  id: number;
  name: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  zone?: number;
  zone_name?: string;
  cell_leader?: number | null;
};

export type CellWritePayload = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  zone: number;
  cell_leader: number | null;
};
