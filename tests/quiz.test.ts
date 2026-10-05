import { describe, it, expect } from "vitest";
import { evaluateDissertativeAnswer } from "../lib/quiz/semantic-scorer";

describe("Avaliador Semântico de Respostas Dissertativas", () => {
  it("deve atribuir pontuação proporcional baseada nas palavras-chave da rubrica técnica", () => {
    const rubric = ["adaptação", "campo de visão", "conforto", "distorção"];
    const answer =
      "As lentes Gold Comfort facilitam a rápida adaptação do paciente porque expandem o campo de visão e garantem extremo conforto, minimizando a distorção lateral.";

    const result = evaluateDissertativeAnswer(answer, rubric, 10);
    expect(result.score).toBe(10);
    expect(result.matchedKeywords.length).toBe(4);
    expect(result.missingKeywords.length).toBe(0);
  });

  it("deve reconhecer palavras sem acento e calcular pontuação parcial", () => {
    const rubric = ["antirreflexo", "garantia", "durabilidade"];
    const answer = "O tratamento tem alta durabilidade e garantia estendida de fábrica.";

    const result = evaluateDissertativeAnswer(answer, rubric, 10);
    expect(result.matchedKeywords).toContain("durabilidade");
    expect(result.matchedKeywords).toContain("garantia");
    expect(result.missingKeywords).toContain("antirreflexo");
    expect(result.score).toBeCloseTo(6.7, 1);
  });
});
