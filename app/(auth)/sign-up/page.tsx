"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignUpPage } from "@/components/ui/sign-up";
import { GoogleAuthModal } from "@/components/ui/google-auth-modal";
import { registerAction, loginWithGoogleAction } from "@/app/actions/auth";

export default function SignUpRoute() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignUp = async (data: Record<string, string>) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await registerAction({
        name: data.name,
        whatsapp: data.whatsapp,
        cpf: data.cpf,
        email: data.email,
        address: data.address,
        storeName: data.storeName,
        storeCnpj: data.storeCnpj,
        roleId: data.roleId,
        password: data.password,
        avatarUrl: data.avatarUrl,
      });

      if (!res.success) {
        setError(res.error || "Não foi possível concluir o cadastro.");
        setLoading(false);
      } else {
        setSuccess("Cadastro realizado com sucesso! E-mail de confirmação enviado via Resend. Redirecionando...");
        setTimeout(() => {
          router.push(res.redirectUrl || "/dashboard");
        }, 1500);
      }
    } catch {
      setError("Erro inesperado durante a comunicação com o servidor.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setGoogleModalOpen(true);
  };

  const handleGoogleConfirm = async (email: string, name: string) => {
    setError(null);
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogleAction({ email, name });
      if (!res.success) {
        setError(res.error || "Falha ao credenciar com Google.");
        setGoogleLoading(false);
        setGoogleModalOpen(false);
      } else {
        setGoogleModalOpen(false);
        router.push(res.redirectUrl || "/dashboard");
      }
    } catch {
      setError("Erro de comunicação ao validar conta Google.");
      setGoogleLoading(false);
      setGoogleModalOpen(false);
    }
  };

  const handleNavigateToLogin = () => {
    router.push("/sign-in");
  };

  return (
    <>
      <SignUpPage
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleSignUp}
        onNavigateToLogin={handleNavigateToLogin}
        errorMessage={error}
        successMessage={success}
        isLoading={loading}
      />

      <GoogleAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onConfirm={handleGoogleConfirm}
        isLoading={googleLoading}
      />
    </>
  );
}
