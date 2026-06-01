import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: { default: "Recibo", template: "%s | Recibo" },
  description: "Multimodal AI with voice, files, and on-chain payments on Arbitrum",
  keywords: ["AI", "voice", "blockchain", "Arbitrum", "payments", "multimodal"],
  robots: { index: false, follow: false },
  openGraph: {
    title: "Recibo",
    description: "Multimodal AI with voice, files, and on-chain payments",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
