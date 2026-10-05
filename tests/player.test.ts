import { describe, it, expect } from "vitest";
import { calculateCourseProgress, formatDuration } from "../lib/utils/progress";

describe("Cálculo de Progresso do Curso e Formatação", () => {
  it("deve calcular porcentagem correta de conclusão", () => {
    expect(calculateCourseProgress(10, 5)).toBe(50);
    expect(calculateCourseProgress(4, 1)).toBe(25);
    expect(calculateCourseProgress(0, 0)).toBe(0);
    expect(calculateCourseProgress(6, 6)).toBe(100);
  });

  it("deve formatar duração de segundos para minutos de forma legível", () => {
    expect(formatDuration(720)).toBe("12 min");
    expect(formatDuration(90)).toBe("1m 30s");
  });
});
