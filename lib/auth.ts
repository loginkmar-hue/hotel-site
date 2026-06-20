import { cookies } from "next/headers";

export const ADMIN_COOKIE = "hotel_admin";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function isAdminAuthed(): boolean {
  const c = cookies().get(ADMIN_COOKIE);
  return !!c && c.value === getAdminPassword();
}
