"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LoginResponseBody {
  ok?: boolean;
  error?: string;
}

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!password.trim()) {
      setErrorMessage("Sandi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as LoginResponseBody;

      if (!response.ok) {
        setErrorMessage(data.error ?? "Gagal masuk. Silakan coba lagi.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setErrorMessage(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
      <div>
        <label
          htmlFor="admin-password"
          className="block text-sm font-medium opacity-85"
        >
          Sandi Admin
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            placeholder="Masukkan sandi admin"
            className="min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors focus:ring-2"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 50%, transparent)",
              color: "var(--color-text)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
            className="inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border px-3 text-xs font-medium"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 45%, transparent)",
              color: "var(--color-text)",
            }}
          >
            {showPassword ? "Tutup" : "Lihat"}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-xl border px-3.5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-accent) 12%, var(--color-background))",
            borderColor: "var(--color-accent)",
            color: "var(--color-accent)",
          }}
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full px-6 text-sm font-medium tracking-wide transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-background)",
        }}
      >
        {isSubmitting ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
