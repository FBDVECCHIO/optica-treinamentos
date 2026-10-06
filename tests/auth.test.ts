import { describe, it, expect, vi } from "vitest";
import { db } from "@/lib/db/mock-store";
import { updatePasswordAction } from "@/app/actions/auth";

describe("Fluxo de Autenticação e Redefinição de Senha", () => {
  it("deve conter o perfil do Administrador Master fbdv1202@gmail.com pré-configurado", () => {
    const profile = db.profiles.find((p) => p.email.toLowerCase() === "fbdv1202@gmail.com");
    expect(profile).toBeDefined();
    expect(profile?.accessLevel).toBe("master");
    expect(profile?.roleTitle).toBe("ADMINISTRADOR MASTER");
    expect(db.userCredentials["fbdv1202@gmail.com"]).toBe("@180414Fs");
  });

  it("deve permitir redefinição de senha e persistir a nova senha para o usuário", async () => {
    const newPass = "NovaSenhaForte2026!";
    const res = await updatePasswordAction("fbdv1202@gmail.com", newPass);

    expect(res.success).toBe(true);
    expect(db.userCredentials["fbdv1202@gmail.com"]).toBe(newPass);

    // Restaura a senha padrão do usuário
    db.userCredentials["fbdv1202@gmail.com"] = "@180414Fs";
  });

  it("deve provisionar perfil Master se um e-mail admin redefinir senha e não existir previamente", async () => {
    const testAdmin = "novo.gestor.master@optica.com.br";
    const res = await updatePasswordAction(testAdmin, "SenhaMaster123!");

    expect(res.success).toBe(true);
    expect(db.userCredentials[testAdmin]).toBe("SenhaMaster123!");

    const created = db.profiles.find((p) => p.email.toLowerCase() === testAdmin);
    expect(created).toBeDefined();
    expect(created?.accessLevel).toBe("master");
  });
});
