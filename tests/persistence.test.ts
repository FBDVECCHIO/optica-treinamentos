import { describe, it, expect } from "vitest";
import { db } from "@/lib/db/mock-store";
import { deleteCourseAction } from "@/app/actions/admin";

describe("Persistência em Disco Anti-Reset (F5 / CTRL+F5)", () => {
  it("deve persistir a exclusão de um curso e não restaurá-lo após reload do disco", async () => {
    // Cria um curso temporário para teste
    const tempCourseId = "course_test_temp_999";
    db.courses.push({
      id: tempCourseId,
      title: "Curso Teste Persistência",
      slug: "curso-teste-persistencia",
      description: "Curso de teste para persistência em disco",
      thumbnailUrl: "/test.jpg",
      isPublished: true,
      estimatedDurationMin: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.saveToDisk();

    // Valida que foi salvo
    expect(db.courses.some((c) => c.id === tempCourseId)).toBe(true);

    // Executa a ação de exclusão
    const res = await deleteCourseAction(tempCourseId);
    expect(res.success).toBe(true);
    expect(db.courses.some((c) => c.id === tempCourseId)).toBe(false);

    // Simula reload do disco chamando loadFromDisk()
    const loaded = db.loadFromDisk();
    expect(loaded).toBe(true);
    expect(db.courses.some((c) => c.id === tempCourseId)).toBe(false);
  });
});
