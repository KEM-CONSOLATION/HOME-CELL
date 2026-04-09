"use client";

import { ThemeProvider } from "next-themes";
import { Figtree } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <main className={`${figtree.variable} font-sans`}>
        {children}
        <Toaster />
      </main>
    </ThemeProvider>
  );
}

