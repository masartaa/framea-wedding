import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Framea Wedding Invitation",
  description: "Panel admin untuk mengelola undangan pernikahan Framea.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
