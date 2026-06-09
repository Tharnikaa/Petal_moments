import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Link from "next/link";

import { UserMenu } from "@/components/UserMenu";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Petal Moments",
  description: "Track important dates and generate hyper-personalized greetings.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col text-foreground">
        <Providers>
          <header className="py-5 px-8 flex items-center justify-between border-b border-border bg-card/85 backdrop-blur-md shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Petal Moments Logo" className="h-9 w-9 rounded-full object-cover shadow-sm border border-primary/20" />
              <h1 className="text-2xl font-bold tracking-wide text-primary font-[family-name:var(--font-playfair)] italic">Petal Moments</h1>
            </div>
            <div className="flex items-center gap-4">
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-transparent">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
