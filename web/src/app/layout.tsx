import type { Metadata, Viewport } from "next";
import { Inter, Literata } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ecoa — sua voz, sem rosto",
  description:
    "Uma rede social só de texto e totalmente anônima. Escreva o que você sente. Alguém vai te ler.",
};

// viewport-fit=cover libera env(safe-area-inset-*) em telas com notch
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${literata.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
