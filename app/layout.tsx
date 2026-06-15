import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1d0f12",
};

export const metadata: Metadata = {
  title: "暧昧检测局 · 她到底什么意思，我帮你看",
  description:
    "贴一段聊天记录，AI帮你分析暧昧信号。不管你们聊的是注射器还是量子力学，我只看她的行为。",
  openGraph: {
    title: "暧昧检测局 · 她到底什么意思，我帮你看",
    description:
      "贴一段聊天记录，AI帮你分析暧昧信号。不管你们聊的是注射器还是量子力学，我只看她的行为。",
    url: "https://aimai.starfluxes.com",
    siteName: "暧昧检测局",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen">
        {children}
      </body>
    </html>
  );
}
