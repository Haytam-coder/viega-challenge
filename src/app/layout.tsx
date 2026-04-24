import type { Metadata } from "next";
import { Syne, Space_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Viega Compass — Market Intelligence",
  description: "AI-powered market signal detection and product decision intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${syne.variable} ${spaceMono.variable} h-full`}>
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 min-h-0 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
