import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

const AppProvider = dynamic(
  () => import("@/components/providers/app-provider").then((module) => module.AppProvider),
  { ssr: false },
);

export const metadata: Metadata = {
  title: "Mullet Guide",
  description: "AI-powered A2UI DeFi Yield Assistant powered by LI.FI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
