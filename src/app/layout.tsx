import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Framea — Undangan Pernikahan Digital",
  description: "Undangan pernikahan digital Framea.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
