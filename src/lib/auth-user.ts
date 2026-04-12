import type { User } from "@/types/models";

/** Login JSON from backend (shape may vary). */
type LoginResponse = {
  access?: string;
  refresh?: string;
  user?: Record<string, unknown>;
  role?: string;
};

/**
 * Maps API login payload to the `User` shape the app stores.
 * Backend may put `role` on the root; `user` may use first_name/last_name and numeric id.
 */
export function userFromLoginResponse(data: LoginResponse): User | null {
  const u = data.user;
  if (!u || typeof u !== "object") return null;

  const roleRaw = String(data.role ?? u.role ?? "MEMBER");
  const first = String(u.first_name ?? "").trim();
  const last = String(u.last_name ?? "").trim();
  const email = String(u.email ?? "");
  const name =
    [first, last].filter(Boolean).join(" ") || email || "User";

  return {
    id: String(u.id ?? ""),
    name,
    email,
    role: roleRaw as User["role"],
    unitId: String(u.unit_id ?? u.unitId ?? ""),
    unitName: String(u.unit_name ?? u.unitName ?? "Region"),
    avatar: typeof u.avatar === "string" ? u.avatar : undefined,
  };
}
