import api, { dedupedGet } from "@/config/axios";

export type UserProfile = {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  role_display: string;
  assigned_state: number | null;
  assigned_area: number | null;
  assigned_zone: number | null;
  assigned_cell: number | null;
};

export type UserProfileUpdate = {
  first_name: string;
  last_name: string;
  phone_number: string;
};

export async function getProfile(): Promise<UserProfile> {
  const response = await dedupedGet<UserProfile>("/auth/profile/");
  return response.data;
}

export async function updateProfile(
  payload: UserProfileUpdate,
): Promise<UserProfile> {
  const response = await api.patch<UserProfile>("/auth/profile/", payload);
  return response.data;
}
