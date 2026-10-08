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
  Store as StoreIcon,
  Building2,
  Users,
  AlertTriangle,
  Power,
  CreditCard,
  Calendar,
  Check,
  Phone,
  MapPin,
  Copy,
  MessageSquare,
} from "lucide-react";
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  getSystemSettingsAction,
  updateSystemSettingsAction,
  getStoresWithStatsAction,
  createStoreAction,
  updateStoreAction,
  toggleStoreStatusAction,
  deleteStoreAction,
  StoreWithStats,
} from "@/app/actions/admin";
import { Category, SystemSettings, SubscriptionStatus, BillingCycle } from "@/types/database";

const PLAN_PRESETS = [
  {
    name: "Essencial Balcão (5 Licenças)",
    limit: 5,
    value: 290,
    cycle: "monthly" as BillingCycle,
    tag: "1 Loja Individual",
  },
  {
    name: "Performance Pro (15 Licenças)",
    limit: 15,
    value: 690,
    cycle: "monthly" as BillingCycle,
    tag: "Médio Porte / Equipes",
  },
  {
    name: "Rede Master Expansão (50 Licenças)",
    limit: 50,
    value: 1890,
    cycle: "monthly" as BillingCycle,
    tag: "Redes e Franquias",
  },
  {
    name: "Parceiro Trade SRL (100 Licenças)",
    limit: 100,
    value: 0,
    cycle: "trade_partner" as BillingCycle,
    tag: "Patrocínio da Indústria",
  },
  {
    name: "Degustação Inicial (Trial - 15 dias)",
    limit: 5,
    value: 0,
    cycle: "monthly" as BillingCycle,
    tag: "Teste Gratuito",
  },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "login" | "stores">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<StoreWithStats[]>([]);
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

  // Estados da Gestão de Lojas & Planos
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreWithStats | null>(null);
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [isTogglingStoreId, setIsTogglingStoreId] = useState<string | null>(null);
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);

  const handleCopyStoreInvite = (storeId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/convite/${storeId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedStoreId(storeId);
    setTimeout(() => setCopiedStoreId(null), 3000);
  };

  const [storeForm, setStoreForm] = useState({
    name: "",
    cnpj: "",
    address: "",
    phone: "",
    planName: "Essencial Balcão (5 Licenças)",
    subscriptionStatus: "active" as SubscriptionStatus,
    userLimit: 5,
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    monthlyValue: 290,
    billingCycle: "monthly" as BillingCycle,
    notes: "",
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [cats, sysSettings, storesData] = await Promise.all([
        getCategoriesAction(),
        getSystemSettingsAction(),
        getStoresWithStatsAction(),
      ]);
      setCategories(cats);
      setSettings(sysSettings);
      setStores(storesData);
      setLoginHeroImage(sysSettings.loginHeroImageUrl || "");
      setLoginTitle(sysSettings.loginHeroTitle || "Capacitação Técnica de Alta Performance");
      setLoginSubtitle(sysSettings.loginHeroSubtitle || "Aumente a conversão de lentes de valor agregado, elimine erros de adaptação e garanta a satisfação do cliente da ótica.");
    } catch {
      showFeedback("Erro ao carregar dados de configurações.", "error");
    }
  };

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
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

  // Upload de Imagem de Login com Compressão Automática via Canvas (evita payload excessivo)
  const handleLoginImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showFeedback("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).", "error");
      return;
    }

    try {
      showFeedback("Processando e otimizando imagem...", "success");
      const compressedBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxDimension = 1440;
            let width = img.width;
            let height = img.height;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(event.target?.result as string);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL("image/jpeg", 0.85);
            resolve(optimized);
          };
          img.onerror = () => reject(new Error("Falha ao carregar arquivo de imagem."));
        };
        reader.onerror = () => reject(new Error("Erro ao ler arquivo."));
      });

      setLoginHeroImage(compressedBase64);
      localStorage.setItem("optica_login_hero_image_draft", compressedBase64);
      showFeedback("Imagem otimizada com sucesso! Clique em 'Salvar e Publicar no Login' para aplicar.");
    } catch {
      showFeedback("Erro ao processar imagem. Tente uma imagem diferente.", "error");
    }
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
        showFeedback("Configurações visuais da tela de login atualizadas e salvas em disco!");
        if (res.settings) {
          setSettings(res.settings);
          localStorage.setItem("optica_login_hero_image", res.settings.loginHeroImageUrl || "");
        }
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

  // Funções de Gestão de Lojas & Planos
  const handleOpenAddStore = () => {
    setEditingStore(null);
    setStoreForm({
      name: "",
      cnpj: "",
      address: "",
      phone: "",
      planName: "Essencial Balcão (5 Licenças)",
      subscriptionStatus: "active",
      userLimit: 5,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      monthlyValue: 290,
      billingCycle: "monthly",
      notes: "",
    });
    setIsStoreModalOpen(true);
  };

  const handleOpenEditStore = (store: StoreWithStats) => {
    setEditingStore(store);
    setStoreForm({
      name: store.name || "",
      cnpj: store.cnpj || "",
      address: store.address || "",
      phone: store.phone || "",
      planName: store.planName || "Essencial Balcão (5 Licenças)",
      subscriptionStatus: store.subscriptionStatus || "active",
      userLimit: store.userLimit || 10,
      validUntil: store.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      monthlyValue: store.monthlyValue !== undefined ? store.monthlyValue : 290,
      billingCycle: store.billingCycle || "monthly",
      notes: store.notes || "",
    });
    setIsStoreModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof PLAN_PRESETS[0]) => {
    setStoreForm((prev) => ({
      ...prev,
      planName: preset.name,
      userLimit: preset.limit,
      monthlyValue: preset.value,
      billingCycle: preset.cycle,
    }));
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeForm.name.trim() || !storeForm.cnpj.trim()) {
      showFeedback("Nome da Ótica e CNPJ são campos obrigatórios.", "error");
      return;
    }

    setIsSavingStore(true);
    try {
      if (editingStore) {
        const res = await updateStoreAction(editingStore.id, {
          name: storeForm.name,
          cnpj: storeForm.cnpj,
          address: storeForm.address,
          phone: storeForm.phone,
          planName: storeForm.planName,
          subscriptionStatus: storeForm.subscriptionStatus,
          userLimit: Number(storeForm.userLimit),
          validUntil: storeForm.validUntil,
          monthlyValue: Number(storeForm.monthlyValue),
          billingCycle: storeForm.billingCycle,
          notes: storeForm.notes,
        });

        if (res.success) {
          showFeedback(`Contrato da loja "${storeForm.name}" atualizado com sucesso!`);
          setIsStoreModalOpen(false);
          await loadAllData();
        } else {
          showFeedback(res.error || "Erro ao atualizar loja.", "error");
        }
      } else {
        const res = await createStoreAction({
          name: storeForm.name,
          cnpj: storeForm.cnpj,
          address: storeForm.address,
          phone: storeForm.phone,
          planName: storeForm.planName,
          subscriptionStatus: storeForm.subscriptionStatus,
          userLimit: Number(storeForm.userLimit),
          validUntil: storeForm.validUntil,
          monthlyValue: Number(storeForm.monthlyValue),
          billingCycle: storeForm.billingCycle,
          notes: storeForm.notes,
        });

        if (res.success) {
          showFeedback(`Ótica "${storeForm.name}" cadastrada com sucesso!`);
          setIsStoreModalOpen(false);
          await loadAllData();
        } else {
          showFeedback(res.error || "Erro ao cadastrar ótica.", "error");
        }
      }
    } catch {
      showFeedback("Erro ao processar contrato de loja.", "error");
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleToggleStoreStatus = async (store: StoreWithStats) => {
    const nextStatus: SubscriptionStatus =
      store.subscriptionStatus === "active" || store.subscriptionStatus === "trial"
        ? "suspended"
        : "active";

    const actionLabel = nextStatus === "suspended" ? "suspender" : "reativar";
    if (
      !confirm(
        `Deseja realmente ${actionLabel} a assinatura da ótica "${store.name}"? ${
          nextStatus === "suspended"
            ? "\nOs colaboradores desta unidade não conseguirão fazer login até a regularização."
            : "\nO acesso de todos os colaboradores será liberado imediatamente."
        }`
      )
    ) {
      return;
    }

    setIsTogglingStoreId(store.id);
    try {
      const res = await toggleStoreStatusAction(store.id, nextStatus);
      if (res.success) {
        showFeedback(
          nextStatus === "suspended"
            ? `Assinatura de "${store.name}" suspensa com sucesso.`
            : `Assinatura de "${store.name}" reativada com sucesso!`
        );
        await loadAllData();
      } else {
        showFeedback(res.error || "Erro ao alterar status da loja.", "error");
      }
    } catch {
      showFeedback("Erro de comunicação ao alterar status.", "error");
    } finally {
      setIsTogglingStoreId(null);
    }
  };

  const handleDeleteStore = async (store: StoreWithStats) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir a unidade "${store.name}"?\nEsta ação é irreversível.`
      )
    ) {
      return;
    }

    try {
      const res = await deleteStoreAction(store.id);
      if (res.success) {
        showFeedback(`Loja "${store.name}" removida do sistema.`);
        await loadAllData();
      } else {
        showFeedback(res.error || "Erro ao excluir loja.", "error");
      }
    } catch {
      showFeedback("Erro ao excluir loja.", "error");
    }
  };

  // Cálculos de Métricas da Rede de Lojas
  const totalStores = stores.length;
  const activeStores = stores.filter(
    (s) => s.subscriptionStatus === "active" || s.subscriptionStatus === "trial"
  ).length;
  const suspendedStores = stores.filter(
    (s) => s.subscriptionStatus === "suspended" || s.subscriptionStatus === "canceled"
  ).length;
  const totalSeats = stores.reduce((acc, s) => acc + (s.userLimit || 0), 0);
  const totalOccupiedSeats = stores.reduce((acc, s) => acc + (s.activeUsersCount || 0), 0);
  const networkOccupancyRate = totalSeats > 0 ? Math.round((totalOccupiedSeats / totalSeats) * 100) : 0;

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
          id="tab-settings-stores"
          onClick={() => setActiveTab("stores")}
          className={`pb-3 transition-colors relative cursor-pointer flex items-center gap-2 ${
            activeTab === "stores" ? "text-violet-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>Lojas, Planos & Assinaturas ({stores.length})</span>
          {activeTab === "stores" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>

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

      {/* ABA: LOJAS, PLANOS & ASSINATURAS (MULTI-TENANCY & COTAS) */}
      {activeTab === "stores" && (
        <div className="space-y-6">
          {/* Cards de Métricas de Contratos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Óticas Parceiras</span>
                <Building2 className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalStores}</div>
              <p className="text-[11px] text-zinc-500">Unidades cadastradas no ecossistema</p>
            </div>

            <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Contratos Ativos</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{activeStores}</div>
              <p className="text-[11px] text-zinc-500">Operações regulares com acesso liberado</p>
            </div>

            <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Lojas Suspensas</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400">{suspendedStores}</div>
              <p className="text-[11px] text-zinc-500">Acesso bloqueado por inadimplência/expiradas</p>
            </div>

            <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Taxa de Licenças em Uso</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                <span>{totalOccupiedSeats}</span>
                <span className="text-xs text-zinc-400 font-normal">/ {totalSeats} assentos ({networkOccupancyRate}%)</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-sky-400 rounded-full"
                  style={{ width: `${Math.min(100, networkOccupancyRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Barra de Ações & Título */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white">Governança de Óticas & Cotas de Assentos (Seat Limits)</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Controle contratos, defina o limite de colaboradores por unidade e suspenda acessos com 1 clique.
              </p>
            </div>

            <button
              id="btn-add-store"
              onClick={handleOpenAddStore}
              className="px-4 py-2 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-violet-950 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Nova Ótica & Plano</span>
            </button>
          </div>

          {/* Tabela de Lojas & Assinaturas */}
          <div className="rounded-3xl bg-zinc-900/60 border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-white/5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Ótica / CNPJ</th>
                    <th className="py-3 px-4">Plano & Ciclo</th>
                    <th className="py-3 px-4">Consumo de Assentos</th>
                    <th className="py-3 px-4">Status da Assinatura</th>
                    <th className="py-3 px-4">Validade</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stores.map((store) => {
                    const isFull = store.activeUsersCount >= (store.userLimit || 10);
                    const isSuspended = store.subscriptionStatus === "suspended" || store.subscriptionStatus === "canceled";

                    return (
                      <tr key={store.id} className="hover:bg-white/5 transition-colors">
                        {/* Nome & CNPJ */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{store.name}</span>
                            {isSuspended && (
                              <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded font-medium">
                                Bloqueada
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-3 mt-0.5">
                            <span className="font-mono">CNPJ: {store.cnpj}</span>
                            {store.phone && (
                              <span className="flex items-center gap-1 text-zinc-500">
                                <Phone className="w-3 h-3" />
                                {store.phone}
                              </span>
                            )}
                          </div>
                          {store.address && (
                            <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{store.address}</span>
                            </div>
                          )}
                        </td>

                        {/* Plano Contratado */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white">{store.planName || "Plano Padrão"}</div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                            <CreditCard className="w-3 h-3 text-violet-400" />
                            <span>
                              {store.billingCycle === "trade_partner"
                                ? "Patrocínio Trade SRL"
                                : store.monthlyValue
                                ? `R$ ${store.monthlyValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / mês`
                                : "Isento"}
                            </span>
                          </div>
                        </td>

                        {/* Ocupação de Licenças (Seat Limit) */}
                        <td className="py-3.5 px-4 min-w-[180px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-semibold text-white">
                              {store.activeUsersCount} de {store.userLimit || 10} alunos
                            </span>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                isFull
                                  ? "bg-rose-500/20 text-rose-300"
                                  : store.usagePercent > 70
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-emerald-500/20 text-emerald-300"
                              }`}
                            >
                              {store.usagePercent}%
                            </span>
                          </div>

                          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFull
                                  ? "bg-rose-500"
                                  : store.usagePercent > 70
                                  ? "bg-amber-400"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, store.usagePercent)}%` }}
                            />
                          </div>

                          <div className="text-[10px] text-zinc-500 mt-1">
                            {isFull ? (
                              <span className="text-rose-400 font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Cota esgotada (Upgrade necessário)
                              </span>
                            ) : (
                              <span>{store.availableSeats} vaga(s) disponível(is)</span>
                            )}
                          </div>
                        </td>

                        {/* Status da Assinatura */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              store.subscriptionStatus === "active"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : store.subscriptionStatus === "trial"
                                ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                                : store.subscriptionStatus === "suspended"
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                store.subscriptionStatus === "active"
                                  ? "bg-emerald-400"
                                  : store.subscriptionStatus === "trial"
                                  ? "bg-sky-400"
                                  : store.subscriptionStatus === "suspended"
                                  ? "bg-rose-400"
                                  : "bg-zinc-400"
                              }`}
                            />
                            {store.subscriptionStatus === "active"
                              ? "Ativa"
                              : store.subscriptionStatus === "trial"
                              ? "Degustação (Trial)"
                              : store.subscriptionStatus === "suspended"
                              ? "Suspensa"
                              : "Cancelada"}
                          </span>
                        </td>

                        {/* Validade */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            <span>
                              {store.validUntil
                                ? new Date(store.validUntil).toLocaleDateString("pt-BR")
                                : "Vitalício"}
                            </span>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyStoreInvite(store.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                              title={
                                copiedStoreId === store.id
                                  ? "Link de convite copiado!"
                                  : "Copiar link de convite exclusivo da loja"
                              }
                            >
                              {copiedStoreId === store.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                `Olá equipe da ${store.name}! Segue o link de acesso aos treinamentos oficiais da nossa ótica: ${
                                  typeof window !== "undefined" ? window.location.origin : ""
                                }/convite/${store.id}. Acesse para iniciar seus módulos!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                              title="Compartilhar convite no grupo do WhatsApp da equipe"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => handleToggleStoreStatus(store)}
                              disabled={isTogglingStoreId === store.id}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isSuspended
                                  ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                  : "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              }`}
                              title={
                                isSuspended
                                  ? "Reativar Assinatura da Loja"
                                  : "Suspender Assinatura / Bloquear Acesso"
                              }
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenEditStore(store)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="Editar Contrato / Ajustar Limites"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteStore(store)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                              title="Excluir Loja"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: CATEGORIAS DE TREINAMENTOS */}
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

      {/* MODAL PARA CRIAR / EDITAR ÓTICA E PLANO */}
      {isStoreModalOpen && (
        <div
          id="modal-store-container"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-element overflow-y-auto"
        >
          <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-8">
            <div className="p-6 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <StoreIcon className="w-4 h-4 text-violet-400" />
                <span>
                  {editingStore
                    ? `Editar Contrato: ${editingStore.name}`
                    : "Cadastrar Nova Ótica & Plano de Acesso"}
                </span>
              </h3>
              <button
                onClick={() => setIsStoreModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form id="modal-store-form" onSubmit={handleSaveStore} className="p-6 space-y-5 text-xs">
              {/* Presets Rápidos de Planos */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Planos Pré-configurados (Clique para preencher):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PLAN_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        storeForm.planName === preset.name
                          ? "bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-950"
                          : "bg-black/40 border-white/10 text-zinc-300 hover:border-violet-500/50"
                      }`}
                    >
                      <div className="font-semibold text-[11px] truncate">{preset.name.split(" ")[0]}</div>
                      <div className="text-[10px] text-zinc-400">{preset.limit} vagas</div>
                      <div className="text-[10px] text-violet-300 font-mono mt-0.5">
                        {preset.value > 0 ? `R$ ${preset.value}/mês` : "Patrocinado"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Linha 1: Nome da Loja & CNPJ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Nome da Ótica / Razão Social *</label>
                  <input
                    id="input-store-name"
                    type="text"
                    required
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                    placeholder="Ex: Ótica Bella Vista Centro"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">CNPJ da Unidade *</label>
                  <input
                    id="input-store-cnpj"
                    type="text"
                    required
                    value={storeForm.cnpj}
                    onChange={(e) => setStoreForm({ ...storeForm, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              {/* Linha 2: Telefone & Endereço */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Endereço / Cidade / UF</label>
                  <input
                    type="text"
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    placeholder="Av. Paulista, 1000 - São Paulo/SP"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Linha 3: Nome do Plano & Limite de Assentos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-zinc-300 block mb-1 font-semibold">Plano Contratado</label>
                  <input
                    type="text"
                    required
                    value={storeForm.planName}
                    onChange={(e) => setStoreForm({ ...storeForm, planName: e.target.value })}
                    placeholder="Ex: Essencial Balcão (5 Licenças)"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">
                    Cota de Colaboradores (Assentos) *
                  </label>
                  <input
                    id="input-store-user-limit"
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={storeForm.userLimit}
                    onChange={(e) => setStoreForm({ ...storeForm, userLimit: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Linha 4: Status, Ciclo, Valor e Validade */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Status do Contrato</label>
                  <select
                    value={storeForm.subscriptionStatus}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, subscriptionStatus: e.target.value as SubscriptionStatus })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="active">Ativa (Acesso Liberado)</option>
                    <option value="trial">Degustação (Trial)</option>
                    <option value="suspended">Suspensa (Bloqueada)</option>
                    <option value="canceled">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Ciclo de Cobrança</label>
                  <select
                    value={storeForm.billingCycle}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, billingCycle: e.target.value as BillingCycle })
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="annual">Anual</option>
                    <option value="trade_partner">Patrocínio SRL</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Valor Mensal (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={storeForm.monthlyValue}
                    onChange={(e) => setStoreForm({ ...storeForm, monthlyValue: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Validade do Contrato</label>
                  <input
                    type="date"
                    value={storeForm.validUntil}
                    onChange={(e) => setStoreForm({ ...storeForm, validUntil: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Observações / Acordos Contratuais</label>
                <textarea
                  rows={2}
                  value={storeForm.notes}
                  onChange={(e) => setStoreForm({ ...storeForm, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o contrato, gerente responsável ou cláusulas..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500 leading-relaxed"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-store"
                  type="submit"
                  disabled={isSavingStore}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-950 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingStore ? "Salvando Contrato..." : "Salvar Ótica & Contrato"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
