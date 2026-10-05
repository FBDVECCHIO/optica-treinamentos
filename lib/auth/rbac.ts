import { UserRole } from "@/types/database";

export function canAccessAdmin(role: UserRole | string | undefined): boolean {
  if (!role) return false;
  return role === "master" || role === "manager";
}

export function canManageRoles(role: UserRole | string | undefined): boolean {
  return role === "master";
}

export function canViewAuditLogs(role: UserRole | string | undefined): boolean {
  return role === "master";
}
