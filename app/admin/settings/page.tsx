"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  FolderTree,
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Upload,
  CheckCircle2,
  Sparkles,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  getSystemSettingsAction,
  updateSystemSettingsAction,
} from "@/app/actions/admin";
import { Category, SystemSettings } from "@/types/database";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "login">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    loginHeroImageUrl: "https://images.unsplash.com/photo-1591076482161-42ce6da69f68?q=80&w=1200&auto=format&fit=crop",
    loginHeroTitle: "Capacitação Técnica de Alta Performance",
    loginHeroSubtitle: "Aumente a conversão de lentes de valor agregado, elimine erros de adaptação e garanta a satisfação do cliente da ótica.",
    updatedAt: new Date().toISOString(),
  });
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Estados do Modal de Categoria
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Estados de Configuração da Tela de Login
  const [loginHeroImage, setLoginHeroImage] = useState("");
  const [loginTitle, setLoginTitle] = useState("");
  const [loginSubtitle, setLoginSubtitle] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const loginFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [cats, sysSettings] = await Promise.all([
        getCategoriesAction(),
        getSystemSettingsAction(),
      ]);
      setCategories(cats);
      setSettings(sysSettings);
      setLoginHeroImage(sysSettings.loginHeroImageUrl || "");
      setLoginTitle(sysSettings.loginHeroTitle || "Capacitação Técnica de Alta Performance");
      setLoginSubtitle(sysSettings.loginHeroSubtitle || "Aumente a conversão de lentes de valor agregado, elimine erros de adaptação e garanta a satisfação do cliente da ótica.");
    } catch {
      showFeedback("Erro ao carregar dados de configurações.", "error");
    }
  };

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Funções de Categoria
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || "");
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showFeedback("O nome da categoria é obrigatório.", "error");
      return;
    }

    setIsSavingCategory(true);
    try {
      if (editingCategory) {
        const res = await updateCategoryAction(editingCategory.id, categoryName, categoryDescription);
        if (res.success) {
          showFeedback("Categoria atualizada com sucesso.");
          setIsCategoryModalOpen(false);
          loadAllData();
        } else {
          showFeedback(res.error || "Erro ao atualizar categoria.", "error");
        }
      } else {
        const res = await createCategoryAction(categoryName, categoryDescription);
        if (res.success) {
          showFeedback("Nova categoria cadastrada com sucesso.");
          setIsCategoryModalOpen(false);
          loadAllData();
        } else {
          showFeedback(res.error || "Erro ao criar categoria.", "error");
        }
      }
    } catch {
      showFeedback("Erro de comunicação ao salvar categoria.", "error");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) return;
    try {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        showFeedback("Categoria removida com sucesso.");
        loadAllData();
      } else {
        showFeedback(res.error || "Erro ao remover categoria.", "error");
      }
    } catch {
      showFeedback("Erro ao excluir categoria.", "error");
    }
  };

  // Upload de Imagem de Login via FileReader
  const handleLoginImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showFeedback("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLoginHeroImage(base64);
      showFeedback("Imagem carregada localmente para pré-visualização. Clique em Salvar para aplicar.");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await updateSystemSettingsAction({
        loginHeroImageUrl: loginHeroImage,
        loginHeroTitle: loginTitle,
        loginHeroSubtitle: loginSubtitle,
      });

      if (res.success) {
        showFeedback("Configurações visuais da tela de login atualizadas com sucesso!");
        if (res.settings) setSettings(res.settings);
      } else {
        showFeedback(res.error || "Erro ao atualizar configurações.", "error");
      }
    } catch {
      showFeedback("Erro ao salvar configurações do sistema.", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetDefaultBanner = () => {
    const defaultUrl = "https://images.unsplash.com/photo-1591076482161-42ce6da69f68?q=80&w=1200&auto=format&fit=crop";
    setLoginHeroImage(defaultUrl);
    setLoginTitle("Capacitação Técnica de Alta Performance");
    setLoginSubtitle("Aumente a conversão de lentes de valor agregado, elimine erros de adaptação e garanta a satisfação do cliente da ótica.");
    showFeedback("Banner redefinido para a imagem oficial de lentes ópticas. Clique em Salvar para confirmar.");
  };

  return (
    <div className="space-y-6 animate-element">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Configurações &raquo; Painel de Controle Master</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Configurações da Plataforma
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gerencie as categorias temáticas dos treinamentos e personalize os elementos visuais do sistema.
          </p>
        </div>

        {feedback && (
          <div
            className={`px-4 py-2 rounded-2xl text-xs font-medium border flex items-center gap-2 animate-element ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-white/10 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 transition-colors relative cursor-pointer flex items-center gap-2 ${
            activeTab === "categories" ? "text-violet-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categorias de Treinamentos ({categories.length})</span>
          {activeTab === "categories" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>

        <button
          id="tab-settings-login"
          onClick={() => setActiveTab("login")}
          className={`pb-3 transition-colors relative cursor-pointer flex items-center gap-2 ${
            activeTab === "login" ? "text-violet-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Personalização da Tela de Login</span>
          {activeTab === "login" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>
      </div>

      {/* ABA 1: CATEGORIAS DE TREINAMENTOS */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Classificação e Categorias</h2>
              <p className="text-xs text-zinc-400">
                Estas categorias alimentam o seletor no construtor de cursos e organizam o catálogo para os colaboradores.
              </p>
            </div>

            <button
              onClick={handleOpenAddCategory}
              className="px-4 py-2 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-violet-950 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Categoria</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-semibold uppercase tracking-wider">
                      {cat.coursesCount || 0} curso(s) vinculado(s)
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-300 hover:bg-white/5 transition-colors cursor-pointer"
                        title="Editar Categoria"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                        title="Excluir Categoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || "Sem descrição informada."}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Criada em {new Date(cat.createdAt).toLocaleDateString("pt-BR")}</span>
                  <span className="text-violet-400 font-medium">Ativa no Catálogo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 2: PERSONALIZAÇÃO DA TELA DE LOGIN */}
      {activeTab === "login" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Formulário de Upload e Controles */}
          <div className="lg:col-span-6 space-y-6 p-6 rounded-3xl bg-zinc-900/60 border border-white/10">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Banner e Identidade da Tela de Login</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Suba uma imagem para ser exibida no lado direito da tela de login oficial (/sign-in) das ópticas.
              </p>
            </div>

            {/* Upload de Imagem */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block">
                Imagem do Banner Lateral (Upload ou Link)
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="file"
                  ref={loginFileInputRef}
                  onChange={handleLoginImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => loginFileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-950 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Fazer Upload da Imagem</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaultBanner}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 block mb-1">Ou cole a URL direta da imagem:</label>
                <input
                  type="text"
                  value={loginHeroImage}
                  onChange={(e) => setLoginHeroImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Título de Destaque */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Título do Banner
              </label>
              <input
                type="text"
                value={loginTitle}
                onChange={(e) => setLoginTitle(e.target.value)}
                placeholder="Ex: Capacitação Técnica de Alta Performance"
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Subtítulo / Descrição */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Subtítulo do Banner
              </label>
              <textarea
                rows={3}
                value={loginSubtitle}
                onChange={(e) => setLoginSubtitle(e.target.value)}
                placeholder="Ex: Aumente a conversão de lentes de valor agregado..."
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 leading-relaxed"
              />
            </div>

            {/* Botão de Salvar */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? "Salvando Alterações..." : "Salvar e Publicar no Login"}</span>
              </button>
            </div>
          </div>

          {/* Coluna Direita: Live Mockup da Tela de Login */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Pré-visualização em Tempo Real (Mockup)</span>
              <span className="text-violet-400">Área Direita de /sign-in</span>
            </div>

            {/* Card Mockup de Alta Fidelidade */}
            <div className="relative h-[480px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-zinc-950">
              {loginHeroImage ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                  style={{ backgroundImage: `url(${loginHeroImage})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 via-zinc-950 to-black flex items-center justify-center text-zinc-600">
                  Nenhuma imagem carregada
                </div>
              )}

              {/* Degradê Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

              {/* Conteúdo Sobreposto */}
              <div className="absolute top-8 left-8 right-8">
                <div className="inline-block px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] text-violet-300 font-semibold mb-2">
                  Linha Gold Comfort & Smartplay
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                  {loginTitle || "Capacitação Técnica de Alta Performance"}
                </h3>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  {loginSubtitle || "Aumente a conversão de lentes de valor agregado, elimine erros de adaptação e garanta a satisfação do cliente da ótica."}
                </p>
              </div>

              {/* Depoimento Glassmorphism na parte inferior */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center font-bold text-white text-xs">
                    CS
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Dra. Camila Soares</div>
                    <div className="text-[10px] text-zinc-400">@camila.optometria</div>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-300 italic">
                  &ldquo;O treinamento transformou a forma como prescrevemos multifocais. Taxa de adaptação de 98%!&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CRIAR / EDITAR CATEGORIA */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-element">
          <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-violet-400" />
                <span>{editingCategory ? "Editar Categoria" : "Nova Categoria de Treinamento"}</span>
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Lentes Multifocais"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Descrição / Objetivos Pedagógicos</label>
                <textarea
                  rows={3}
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Descreva quais produtos e conteúdos pertencem a esta categoria..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-950 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingCategory ? "Salvando..." : "Salvar Categoria"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
