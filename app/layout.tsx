import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Óptica Na Prática | Plataforma Corporativa de Treinamentos",
  description: "Ambiente corporativo de capacitação profissional e certificação para equipes de lojas ópticas.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="light">
      <body className="min-h-screen bg-[#F7F7F1] text-[#0A0A0A] antialiased selection:bg-[#C7FF2E] selection:text-[#0A0A0A] transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
