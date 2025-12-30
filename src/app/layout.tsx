import type { Metadata } from "next";
import { Inter } from "next/font/google";
// AQUI ESTÁ O SEGREDO: Importar o CSS global
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Poker dos Amigos",
  description: "Gerenciador de Poker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}