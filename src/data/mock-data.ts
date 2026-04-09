export type Role =
  | "CELL_LEADER"
  | "ZONAL_LEADER"
  | "AREA_LEADER"
  | "STATE_LEADER"
  | "STATE_PASTOR"
  | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitId: string; // The ID of the Cell, Zone, Area etc they manage
  unitName: string;
  avatar?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: "NEW_CONVERT" | "MEMBER" | "WORKER" | "LEADER";
  cellId: string;
  joinedAt: string;
}

export interface AttendanceRecord {
  id: string;
  cellId: string;
  date: string;
  presentMemberIds: string[];
  firstTimers: number;
  newConverts: number;
  totalAttendance: number;
  submittedBy: string;
  submittedAt: string;
}

export interface NewConvert {
  id: string;
  name: string;
  phone: string;
  address: string;
  registeredAt: string;
  assignedCellId?: string;
  followUpStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  followUpNotes?: string;
}

export const MOCK_STATES = [
  { id: "crs-1", name: "Cross River State", code: "CRS" },
  { id: "aks-1", name: "Akwa Ibom State", code: "AKS" },
  { id: "rivers-1", name: "Rivers State", code: "RS" },
  { id: "lagos-1", name: "Lagos State", code: "LS" },
];

export const MOCK_USER: User = {
  id: "u1",
  name: "John Doe",
  email: "john@smc.org",
  role: "STATE_PASTOR",
  unitId: "crs-1",
  unitName: "Cross River State",
  avatar: "https://github.com/shadcn.png",
};

export const MOCK_CELLS = [
  { id: "cell-1", name: "Grace Cell", zoneId: "zone-1" },
  { id: "cell-2", name: "Mercy Cell", zoneId: "zone-1" },
  { id: "cell-3", name: "Faith Cell", zoneId: "zone-2" },
];

export const MOCK_ZONES = [
  { id: "zone-1", name: "Zone A", areaId: "area-1" },
  { id: "zone-2", name: "Zone B", areaId: "area-1" },
];

export const MOCK_AREAS = [
  { id: "area-1", name: "Calabar Metropolis", stateId: "crs-1" },
];

export const MOCK_MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Alice Johnson",
    phone: "08012345678",
    address: "123 Main St, Calabar",
    status: "WORKER",
    cellId: "cell-1",
    joinedAt: "2023-01-15",
  },
  {
    id: "m2",
    name: "Bob Smith",
    phone: "08087654321",
    address: "456 Oak Rd, Calabar",
    status: "MEMBER",
    cellId: "cell-1",
    joinedAt: "2023-05-20",
  },
  {
    id: "m3",
    name: "Charlie Brown",
    phone: "07011223344",
    address: "789 Pine Ave, Calabar",
    status: "NEW_CONVERT",
    cellId: "cell-2",
    joinedAt: "2024-03-01",
  },
  {
    id: "m4",
    name: "Diana Prince",
    phone: "09055667788",
    address: "321 Elm Blvd, Calabar",
    status: "LEADER",
    cellId: "cell-2",
    joinedAt: "2022-11-10",
  },
  {
    id: "m5",
    name: "Ethan Hunt",
    phone: "08122334455",
    address: "555 Mission St, Calabar",
    status: "MEMBER",
    cellId: "cell-3",
    joinedAt: "2024-01-05",
  },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-1",
    cellId: "cell-1",
    date: "2024-03-31",
    presentMemberIds: ["m1", "m2"],
    firstTimers: 2,
    newConverts: 1,
    totalAttendance: 5,
    submittedBy: "u2",
    submittedAt: "2024-03-31T19:00:00Z",
  },
  {
    id: "att-2",
    cellId: "cell-2",
    date: "2024-03-31",
    presentMemberIds: ["m3", "m4"],
    firstTimers: 0,
    newConverts: 0,
    totalAttendance: 2,
    submittedBy: "u3",
    submittedAt: "2024-03-31T18:30:00Z",
  },
];

export const MOCK_NEW_CONVERTS: NewConvert[] = [
  {
    id: "nc1",
    name: "Frank Castle",
    phone: "08100000001",
    address: "10 Vigilante Way",
    registeredAt: "2024-04-01T10:00:00Z",
    assignedCellId: "cell-1",
    followUpStatus: "IN_PROGRESS",
    followUpNotes: "Called once, he promised to attend this week.",
  },
  {
    id: "nc2",
    name: "Gwen Stacy",
    phone: "08100000002",
    address: "20 Spider St",
    registeredAt: "2024-04-02T11:00:00Z",
    followUpStatus: "PENDING",
  },
];
