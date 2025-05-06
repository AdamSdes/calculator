import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Калькулятор заработка преподавателя",
  description: "Приложение для расчёта заработка преподавателя за уроки и мастер-классы",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex items-center justify-center min-h-screen`}
      >
        <main className="container max-[1600px] mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
