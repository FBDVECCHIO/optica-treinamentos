"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Building2, User, Phone, FileText, Mail, MapPin, Briefcase } from "lucide-react";
import { GoogleIcon, GlassInputWrapper } from "./sign-in";
import { maskCPF, maskPhone, maskCNPJ, isValidCPF, isValidCNPJ } from "@/lib/utils/masks";

export interface SignUpPageProps {
  onSignUp?: (data: Record<string, string>) => void;
  onGoogleSignUp?: () => void;
  onNavigateToLogin?: () => void;
  availableRoles?: { id: string; title: string }[];
  errorMessage?: string | null;
  successMessage?: string | null;
  isLoading?: boolean;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onSignUp,
  onGoogleSignUp,
  onNavigateToLogin,
  availableRoles = [
    { id: "role_consultor", title: "CONSULTOR ÓPTICO / VENDEDOR" },
    { id: "role_gerente", title: "GERENTE DE LOJA" },
    { id: "role_optometrista", title: "OPTOMETRISTA / TÉCNICO ÓPTICO" },
    { id: "role_montador", title: "MONTADOR / LABORATÓRIO" },
  ],
  errorMessage,
  successMessage,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeCnpj, setStoreCnpj] = useState("");
  const [roleId, setRoleId] = useState(availableRoles[0]?.id || "");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Manipuladores com conversão para MAIÚSCULAS em tempo real
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value.toUpperCase());
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value.toUpperCase());
  };

  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreName(e.target.value.toUpperCase());
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(maskCPF(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(maskPhone(e.target.value));
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreCnpj(maskCNPJ(e.target.value));
  };

  // Cálculo de força da senha
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: "Fraca", color: "bg-red-500", width: "w-1/3" };
    if (score === 3) return { label: "Média", color: "bg-yellow-500", width: "w-2/3" };
    return { label: "Forte", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    // Validação matemática de CPF e CNPJ
    if (!isValidCPF(cpf)) {
      setFormError("O CPF informado possui dígitos verificadores inválidos.");
      return;
    }

    if (!isValidCNPJ(storeCnpj)) {
      setFormError("O CNPJ da loja informado possui dígitos verificadores inválidos.");
      return;
    }

    if (password.length < 6) {
      setFormError("A senha deve possuir no mínimo 6 caracteres.");
      return;
    }

    onSignUp?.({
      name,
      whatsapp,
      cpf,
      email: email.trim().toLowerCase(),
      address,
      storeName,
      storeCnpj,
      roleId,
      password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#09090b] text-[#fafafa] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-violet-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-emerald-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="w-full max-w-2xl bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl z-10 my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-3">
            <span>Credenciamento de Colaborador Óptico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Criar Cadastro de Treinamento
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto">
            Preencha seus dados para vincular seu perfil à sua loja de óptica e liberar seus cursos.
          </p>
        </div>

        {(errorMessage || formError) && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs animate-element">
            {errorMessage || formError}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs animate-element">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-violet-400" />
                Nome Completo (em maiúsculas)
              </label>
              <GlassInputWrapper>
                <input
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="EX: MARIA DA SILVA SANTOS"
                  className="w-full bg-transparent text-sm p-3.5 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600 uppercase"
                />
              </GlassInputWrapper>
            </div>

            {/* CPF */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-violet-400" />
                CPF
              </label>
              <GlassInputWrapper>
                <input
                  name="cpf"
                  type="text"
                  required
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full bg-transparent text-sm p-3.5 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600"
                />
              </GlassInputWrapper>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-violet-400" />
                WhatsApp Celular
              </label>
              <GlassInputWrapper>
                <input
                  name="whatsapp"
                  type="text"
                  required
                  value={whatsapp}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full bg-transparent text-sm p-3.5 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600"
                />
              </GlassInputWrapper>
            </div>

            {/* E-mail */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-violet-400" />
                E-mail para Validação e Acesso
              </label>
              <GlassInputWrapper>
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com.br"
                  className="w-full bg-transparent text-sm p-3.5 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600"
                />
              </GlassInputWrapper>
            </div>

            {/* Endereço */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-violet-400" />
                Endereço Residencial
              </label>
              <GlassInputWrapper>
                <input
                  name="address"
                  type="text"
                  required
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="EX: RUA DAS FLORES, 150 - BAIRRO - CIDADE/UF"
                  className="w-full bg-transparent text-sm p-3.5 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600 uppercase"
                />
              </GlassInputWrapper>
            </div>

            {/* Loja de Cadastro (Nome Fantasia) */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-violet-400" />
                Nome da Óptica / Loja
              </label>
              <GlassInputWrapper>
                <input
                  name="storeName"
                  type="text"
                  required
                  value={storeName}
                  onChange={handleStoreNameChange}
                  placeholder="EX: ÓPTICA SRL MATRIZ"
                  className="w-full bg-transparent text-sm p-3.5 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600 uppercase"
                />
              </GlassInputWrapper>
            </div>

            {/* CNPJ da Loja */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-violet-400" />
                CNPJ da Loja
              </label>
              <GlassInputWrapper>
                <input
                  name="storeCnpj"
                  type="text"
                  required
                  value={storeCnpj}
                  onChange={handleCnpjChange}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="w-full bg-transparent text-sm p-3.5 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600"
                />
              </GlassInputWrapper>
            </div>

            {/* Cargo / Função */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                Cargo / Função na Loja
              </label>
              <GlassInputWrapper>
                <select
                  name="roleId"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full bg-[#18181b] text-sm p-3.5 rounded-2xl focus:outline-none text-white cursor-pointer border-none"
                >
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id} className="bg-zinc-900 text-white">
                      {role.title}
                    </option>
                  ))}
                </select>
              </GlassInputWrapper>
            </div>

            {/* Definição de Senha */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400 mb-1 flex items-center justify-between">
                <span>Definição de Senha</span>
                {strength.label && (
                  <span className="text-[11px] text-zinc-400">
                    Força: <span className="font-semibold text-white">{strength.label}</span>
                  </span>
                )}
              </label>
              <GlassInputWrapper>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-transparent text-sm p-3.5 pr-12 rounded-2xl focus:outline-none text-white placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center p-1 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </GlassInputWrapper>

              {/* Barra de força da senha */}
              {password && (
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-violet-600 hover:bg-violet-500 py-4 font-medium text-white transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 mt-6 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Concluir Cadastro e Validar E-mail"
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-6">
          <span className="w-full border-t border-white/10"></span>
          <span className="px-4 text-xs text-zinc-500 bg-zinc-900 absolute">Ou cadastre-se via</span>
        </div>

        <button
          type="button"
          onClick={onGoogleSignUp}
          className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-2xl py-3 hover:bg-white/5 transition-colors text-sm font-medium text-zinc-200 cursor-pointer"
        >
          <GoogleIcon />
          Cadastrar com Google
        </button>

        <div className="text-center mt-6 text-xs text-zinc-400">
          Já possui conta ativa?{" "}
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToLogin?.();
            }}
            className="text-violet-400 hover:underline transition-colors font-medium ml-1"
          >
            Fazer Login
          </a>
        </div>
      </div>
    </div>
  );
};
