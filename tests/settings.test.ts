import { describe, it, expect } from "vitest";
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  getSystemSettingsAction,
  updateSystemSettingsAction,
} from "@/app/actions/admin";

describe("Gestão de Categorias e Configurações Visuais do Sistema", () => {
  let createdCatId = "";

  it("deve listar categorias pré-configuradas", async () => {
    const categories = await getCategoriesAction();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((c) => c.name === "Lentes Multifocais")).toBe(true);
  });

  it("deve cadastrar uma nova categoria com sucesso", async () => {
    const res = await createCategoryAction(
      "Design de Armações & Estilo",
      "Formatos de rosto, pontes, plaquetas e ergonomia facial."
    );
    expect(res.success).toBe(true);
    expect(res.category).toBeDefined();
    expect(res.category?.name).toBe("Design de Armações & Estilo");
    createdCatId = res.category!.id;
  });

  it("deve atualizar os dados da categoria", async () => {
    expect(createdCatId).not.toBe("");
    const res = await updateCategoryAction(
      createdCatId,
      "Design de Armações & Visagismo Óptico",
      "Visagismo e harmonia visual para consultores de óptica."
    );
    expect(res.success).toBe(true);
    expect(res.category?.name).toBe("Design de Armações & Visagismo Óptico");
  });

  it("deve excluir a categoria criada", async () => {
    const res = await deleteCategoryAction(createdCatId);
    expect(res.success).toBe(true);

    const categories = await getCategoriesAction();
    expect(categories.some((c) => c.id === createdCatId)).toBe(false);
  });

  it("deve ler e atualizar as configurações da tela de login", async () => {
    const initial = await getSystemSettingsAction();
    expect(initial.loginHeroImageUrl).toBeDefined();

    const updateRes = await updateSystemSettingsAction({
      loginHeroImageUrl: "https://images.unsplash.com/custom-test-image.jpg",
      loginHeroTitle: "Treinamento Exclusivo Rede Óptica 2026",
    });

    expect(updateRes.success).toBe(true);
    expect(updateRes.settings?.loginHeroImageUrl).toBe("https://images.unsplash.com/custom-test-image.jpg");
    expect(updateRes.settings?.loginHeroTitle).toBe("Treinamento Exclusivo Rede Óptica 2026");
  });
});
