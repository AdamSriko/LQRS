import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { DevSeederShortcut } from "@/components/DevSeederShortcut";
import { GenerationProvider } from "@/contexts/GenerationContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fdf8f6",
};

export const metadata: Metadata = {
  title: "LQRS — Lavanya & Qahwtea Reality Show",
  description:
    "The Drama Engine: turn Qahwtea café moments into reality-TV scripts.",
  manifest: "/manifest.json",
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body className="font-sans min-h-screen">
        <GenerationProvider>
          {children}
          <DevSeederShortcut />
        </GenerationProvider>
      </body>
    </html>
  );
}
