export type Role =
  | "MEMBER"
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

export type MemberStatus = "MEMBER" | "NEW_CONVERT" | "WORKER" | "CELL_LEADER";

export type MemberWriteStatus = "MEMBER" | "NEW_CONVERT" | "WORKER";

export type IntegrationStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "INTEGRATED"
  | "COMPLETED";

export interface MemberRecord {
  id: number;
  first_name: string;
  last_name: string | null;
  zone_name: string | null;
  cell: number;
  cell_name: string;
  status: MemberStatus;
  status_display: string;
  phone_number: string;
  residential_address: string;
  nok_name: string;
  nok_phone: string;
  date_joined: string;
  salvation_date: string | null;
  how_won: string;
  how_won_display: string;
  follow_up_officer: number | null;
  follow_up_officer_name: string | null;
  integration_status: IntegrationStatus;
  integration_status_display: string;
  initial_notes: string;
}

export interface MemberWrite {
  first_name: string;
  last_name?: string;
  zone?: number;
  cell: number;
  status: MemberWriteStatus;
  phone_number: string;
  residential_address?: string;
  nok_name?: string;
  nok_phone?: string;
  date_joined?: string;
  salvation_date?: string;
  how_won?: string;
  follow_up_officer?: number | null;
  integration_status?: IntegrationStatus;
  initial_notes?: string;
}

export type ConvertRecord = MemberRecord;

export interface AttendanceRecord {
  id: number;
  cell: number;
  cell_name: string;
  date: string;
  total_present: number;
  first_timers: number;
  new_converts: number;
  members_present: number[];
  member_details: AttendanceMemberDetail[];
  created_at: string;
}

export interface AttendanceMemberDetail {
  id: number;
  first_name: string;
  last_name: string;
  zone_name: string;
  cell: number;
  cell_name: string;
  status: "MEMBER" | "WORKER" | "CELL_LEADER" | "NEW_CONVERT";
  status_display: string;
  phone_number: string;
  residential_address: string;
  nok_name: string;
  nok_phone: string;
  date_joined: string;
  salvation_date: string;
  how_won: string;
  how_won_display: string;
  follow_up_officer: number | null;
  follow_up_officer_name: string;
  integration_status: IntegrationStatus;
  integration_status_display: string;
  initial_notes: string;
}

export interface AttendanceWrite {
  cell: number;
  date: string;
  members_present: number[];
  first_timers: number;
  new_converts: number;
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

export interface DashboardStatsSnapshot {
  totalMembers: number;
  newConverts: number;
  attendanceRate: string;
  retention: string;
}

export interface DashboardConvertStatsSnapshot {
  pending: number;
  inProgress: number;
  integrated: number;
}

export interface DashboardGraphPoint {
  date: string;
  value: number;
}

export interface DashboardActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface DashboardSnapshot {
  stats: DashboardStatsSnapshot;
  convertStats: DashboardConvertStatsSnapshot;
  graphData: DashboardGraphPoint[];
  activityFeed: DashboardActivityItem[];
}
