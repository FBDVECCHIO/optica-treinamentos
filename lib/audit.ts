import { db } from "@/lib/db/mock-store";
import { AuditLog } from "@/types/database";

export interface LogAuditParams {
  action: AuditLog["action"];
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(params: LogAuditParams): Promise<AuditLog> {
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId,
    userEmail: params.userEmail,
    action: params.action,
    ipAddress: params.ip || "127.0.0.1",
    userAgent: params.userAgent || "Unknown Client",
    metadata: params.metadata || {},
    createdAt: new Date().toISOString(),
  };

  db.auditLogs.unshift(newLog);

  // Mantém no máximo 5000 logs em memória
  if (db.auditLogs.length > 5000) {
    db.auditLogs.pop();
  }

  return newLog;
}

export async function getAuditLogs(options?: {
  limit?: number;
  offset?: number;
  action?: string;
  userEmail?: string;
}): Promise<AuditLog[]> {
  let list = [...db.auditLogs];

  if (options?.action) {
    list = list.filter((item) => item.action === options.action);
  }

  if (options?.userEmail) {
    const term = options.userEmail.toLowerCase();
    list = list.filter((item) => item.userEmail?.toLowerCase().includes(term));
  }

  const offset = options?.offset || 0;
  const limit = options?.limit || 50;

  return list.slice(offset, offset + limit);
}
