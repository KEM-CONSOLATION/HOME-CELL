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
  unitId: string;
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
