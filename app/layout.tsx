import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plataforma de Treinamentos para Ópticas | Linha Gold Comfort & Smartplay",
  description: "Ambiente corporativo de capacitação profissional e certificação para equipes de lojas ópticas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#fafafa] antialiased selection:bg-violet-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
