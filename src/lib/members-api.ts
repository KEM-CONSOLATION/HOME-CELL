import api, { dedupedGet } from "@/config/axios";
import type { MemberRecord, MemberWrite } from "@/types/models";

const BASE = "/auth/members/";

export async function listMembers(): Promise<MemberRecord[]> {
  const { data } = await dedupedGet<MemberRecord[]>(BASE);
  return data;
}

export async function getMember(id: number | string): Promise<MemberRecord> {
  const { data } = await dedupedGet<MemberRecord>(`${BASE}${id}/`);
  return data;
}

export async function createMember(body: MemberWrite): Promise<MemberRecord> {
  const { data } = await api.post<MemberRecord>(BASE, body);
  return data;
}

export async function updateMember(
  id: number | string,
  body: MemberWrite,
): Promise<MemberRecord> {
  const { data } = await api.put<MemberRecord>(`${BASE}${id}/`, body);
  return data;
}

export async function patchMember(
  id: number | string,
  body: Partial<MemberWrite>,
): Promise<MemberRecord> {
  const { data } = await api.patch<MemberRecord>(`${BASE}${id}/`, body);
  return data;
}

export async function deleteMember(id: number | string): Promise<void> {
  await api.delete(`${BASE}${id}/`);
}

export async function promoteMember(
  id: number | string,
  body: MemberWrite,
): Promise<MemberRecord> {
  const { data } = await api.post<MemberRecord>(`${BASE}${id}/promote/`, body);
  return data;
}

export function memberRecordToWrite(member: MemberRecord): MemberWrite {
  return {
    first_name: member.first_name,
    last_name: member.last_name ?? "",
    zone: undefined,
    cell: member.cell,
    status: member.status === "CELL_LEADER" ? "MEMBER" : member.status,
    phone_number: member.phone_number,
    residential_address: member.residential_address,
    nok_name: member.nok_name,
    nok_phone: member.nok_phone,
    date_joined: member.date_joined,
    salvation_date: member.salvation_date ?? undefined,
    how_won: member.how_won,
    follow_up_officer: member.follow_up_officer,
    integration_status: member.integration_status,
    initial_notes: member.initial_notes,
  };
}
