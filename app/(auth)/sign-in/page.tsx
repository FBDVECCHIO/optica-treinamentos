"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { GoogleAuthModal } from "@/components/ui/google-auth-modal";
import { loginAction, loginWithGoogleAction } from "@/app/actions/auth";
import { getSystemSettingsAction } from "@/app/actions/admin";
import { SystemSettings } from "@/types/database";

const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    name: "Dra. Camila Soares",
    handle: "@camila.optometria",
    text: "O treinamento da Linha Gold Comfort transformou a forma como prescrevemos multifocais. A taxa de adaptação nas lojas subiu para 98%!",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
    name: "Rodrigo Almeida",
    handle: "@rodrigo.gerente.optica",
    text: "O acompanhamento por loja e os quizzes de fixação facilitaram o nivelamento da nossa equipe comercial em tempo recorde.",
  },
];

export default function SignInRoute() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    getSystemSettingsAction()
      .then((data) => setSystemSettings(data))
      .catch(() => {});
  }, []);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginAction(formData);

      if (!res.success) {
        setError(res.error || "Falha na autenticação. Verifique os dados informados.");
        setLoading(false);
      } else {
        router.push(res.redirectUrl || "/dashboard");
      }
    } catch {
      setError("Erro de conexão ao servidor. Tente novamente.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleModalOpen(true);
  };

  const handleGoogleConfirm = async (email: string, name: string) => {
    setError(null);
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogleAction({ email, name });
      if (!res.success) {
        setError(res.error || "Falha na autenticação Google.");
        setGoogleLoading(false);
        setGoogleModalOpen(false);
      } else {
        setGoogleModalOpen(false);
        router.push(res.redirectUrl || "/dashboard");
      }
    } catch {
      setError("Erro ao autenticar com Google.");
      setGoogleLoading(false);
      setGoogleModalOpen(false);
    }
  };

  const handleResetPassword = () => {
    router.push("/reset-password");
  };

  const handleCreateAccount = () => {
    router.push("/sign-up");
  };

  return (
    <>
      <SignInPage
        title={
          <span>
            Acesse seu <span className="text-violet-400 font-semibold">Treinamento</span>
          </span>
        }
        description="Entre com suas credenciais para acessar os módulos de capacitação das ópticas."
        heroImageSrc={systemSettings?.loginHeroImageUrl || "https://images.unsplash.com/photo-1591076482161-42ce6da69f68?q=80&w=1200&auto=format&fit=crop"}
        heroTitle={systemSettings?.loginHeroTitle}
        heroSubtitle={systemSettings?.loginHeroSubtitle}
        testimonials={testimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        errorMessage={error}
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
