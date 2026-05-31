import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recibo",
  description: "Multimodal AI with voice, files, and on-chain payments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
