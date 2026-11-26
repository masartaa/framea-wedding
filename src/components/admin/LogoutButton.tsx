"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  redirectTo?: string;
}

export function LogoutButton({ redirectTo = "/admin/login" }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace(redirectTo);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex min-h-11 items-center justify-center rounded-xl border px-5 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-60"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor: "var(--color-primary)",
        color: "var(--color-text)",
      }}
    >
      {isLoading ? "Keluar..." : "Keluar"}
    </button>
  );
}
