import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "独角兽早知道 Video Agent MVP",
  description: "文章转微信视频号生产包的 Batch 00 项目骨架"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
