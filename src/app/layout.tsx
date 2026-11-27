import type { Metadata } from "next";
import { ALL_FONT_VARIABLES } from "@/lib/fonts";
import { SITE_ORIGIN } from "@/lib/marketing";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "Framea Wedding Invitation",
  description: "Undangan pernikahan digital Framea Wedding Invitation.",
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
    <html lang="id" className={ALL_FONT_VARIABLES}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
