import { describe, it, expect } from "vitest";
import { db } from "@/lib/db/mock-store";
import {
  createCourseAction,
  updateCourseAction,
  saveCourseStructureAction,
  getCourseFullDetailsAction,
  deleteCourseAction,
} from "@/app/actions/admin";

describe("Gestão e Estruturação Completa de Treinamentos", () => {
  let createdCourseId = "";

  it("deve criar um novo treinamento completo com metadados e certificação", async () => {
    const res = await createCourseAction({
      title: "Treinamento de Lentes Antirreflexo Premium",
      description: "Capacitação técnica e comercial em tratamentos antirreflexo de alto desempenho.",
      category: "Tratamentos & Tecnologia",
      estimatedDurationMin: 90,
      certificateEnabled: true,
      minScoreToPass: 75,
      isPublished: true,
      pdfAttachmentName: "Apostila Antirreflexo Premium.pdf",
      pdfAttachmentUrl: "/antirreflexo_guia.pdf",
    });

    expect(res.success).toBe(true);
    expect(res.course).toBeDefined();
    expect(res.course?.title).toBe("Treinamento de Lentes Antirreflexo Premium");
    expect(res.course?.certificateEnabled).toBe(true);
    expect(res.course?.minScoreToPass).toBe(75);

    createdCourseId = res.course!.id;
  });

  it("deve estruturar módulos, videoaulas e avaliação para o treinamento criado", async () => {
    expect(createdCourseId).not.toBe("");

    const structRes = await saveCourseStructureAction(createdCourseId, {
      modules: [
        {
          title: "Módulo 1: Propriedades Físicas e Químicas",
          description: "Entenda a aplicação de camadas e transmissão luminosa.",
          orderIndex: 1,
          lessons: [
            {
              title: "Aula 1: A física do tratamento antirreflexo",
              videoProvider: "youtube",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              durationSeconds: 900,
              orderIndex: 1,
            },
            {
              title: "Aula 2: Durabilidade e facilidade de limpeza",
              videoProvider: "vimeo",
              videoUrl: "https://vimeo.com/123456789",
              durationSeconds: 700,
              orderIndex: 2,
            },
          ],
        },
      ],
      quiz: {
        title: "Avaliação Oficial de Antirreflexo",
        minScoreToPass: 75,
        questions: [
          {
            questionText: "Qual a função da camada hidrorrepelente no antirreflexo?",
            type: "multiple_choice",
            points: 50,
            orderIndex: 1,
            options: [
              { id: "A", text: "Diminuir a espessura da lente" },
              { id: "B", text: "Facilitar a limpeza e repelir água e poeira" },
              { id: "C", text: "Apenas alterar a tonalidade de reflexo" },
              { id: "D", text: "Substituir o grau da lente" },
            ],
            correctAnswer: "B",
          },
        ],
      },
    });

    expect(structRes.success).toBe(true);

    // Validar se os dados foram persistidos
    const fullDetails = await getCourseFullDetailsAction(createdCourseId);
    expect(fullDetails.course).not.toBeNull();
    expect(fullDetails.course?.modulesCount).toBe(1);
    expect(fullDetails.course?.lessonsCount).toBe(2);
    expect(fullDetails.modules.length).toBe(1);
    expect(fullDetails.modules[0].lessons?.length).toBe(2);
    expect(fullDetails.quiz).not.toBeNull();
    expect(fullDetails.quiz?.questions?.length).toBe(1);
  });

  it("deve atualizar os metadados do curso com sucesso", async () => {
    const updateRes = await updateCourseAction(createdCourseId, {
      title: "Treinamento Antirreflexo Premium (Edição 2026)",
      estimatedDurationMin: 120,
    });

    expect(updateRes.success).toBe(true);
    expect(updateRes.course?.title).toBe("Treinamento Antirreflexo Premium (Edição 2026)");
    expect(updateRes.course?.estimatedDurationMin).toBe(120);
  });

  it("deve excluir o treinamento e suas dependências com segurança", async () => {
    const delRes = await deleteCourseAction(createdCourseId);
    expect(delRes.success).toBe(true);

    const check = db.courses.find((c) => c.id === createdCourseId);
    expect(check).toBeUndefined();
    const modulesCheck = db.modules.filter((m) => m.courseId === createdCourseId);
    expect(modulesCheck.length).toBe(0);
  });
});
