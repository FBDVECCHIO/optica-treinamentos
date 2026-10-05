import { describe, it, expect } from "vitest";
import { createDatabaseSnapshot } from "../scripts/backup.mjs";

describe("Rotina Automática de Backup da Plataforma", () => {
  it("deve gerar snapshot íntegro em JSON com checksum SHA-256 e tabelas essenciais", async () => {
    const backup = await createDatabaseSnapshot();
    expect(backup).toBeDefined();
    expect(backup.fileName).toMatch(/^backup_/);
    expect(backup.checksumSha256).toHaveLength(64);
    expect(backup.tables).toContain("courses");
    expect(backup.tables).toContain("profiles");
    expect(backup.tables).toContain("audit_logs");
  });
});
