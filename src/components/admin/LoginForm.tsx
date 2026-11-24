"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { normalizeInvitationSlug } from "@/lib/invitation-slug";

type LoginMode = "couple" | "superadmin";

interface LoginResponseBody {
  ok?: boolean;
  redirectTo?: string;
  error?: string;
}

function subscribeToLocation(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getPreFilledSlugFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("slug");
  return raw ? normalizeInvitationSlug(raw) : "";
}

function getServerSlug(): string {
  return "";
}

export function LoginForm() {
  const router = useRouter();
  const urlSlug = useSyncExternalStore(
    subscribeToLocation,
    getPreFilledSlugFromUrl,
    getServerSlug
  );

  const [hasChosenMode, setHasChosenMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState<LoginMode>("superadmin");
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [slugInput, setSlugInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mode: LoginMode = hasChosenMode
    ? selectedMode
    : urlSlug
      ? "couple"
      : "superadmin";
  const slugValue = hasEditedSlug ? slugInput : urlSlug;

  const handleModeChange = (nextMode: LoginMode) => {
    setHasChosenMode(true);
    setSelectedMode(nextMode);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (mode === "couple" && !normalizeInvitationSlug(slugValue)) {
      setErrorMessage("Slug undangan wajib diisi.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Sandi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload =
        mode === "couple"
          ? {
              mode: "couple" as const,
              slug: normalizeInvitationSlug(slugValue),
              password,
            }
          : {
              mode: "superadmin" as const,
              password,
            };

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as LoginResponseBody;

      if (!response.ok) {
        setErrorMessage(data.error ?? "Gagal masuk. Silakan coba lagi.");
        return;
      }

      router.replace(data.redirectTo ?? "/admin");
      router.refresh();
    } catch {
      setErrorMessage(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-background)",
    borderColor: "color-mix(in srgb, var(--color-primary) 50%, transparent)",
    color: "var(--color-text)",
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
      <div
        role="tablist"
        aria-label="Pilih peran login"
        className="grid grid-cols-2 gap-1.5 rounded-2xl p-1"
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "couple"}
          onClick={() => handleModeChange("couple")}
          className="min-h-11 cursor-pointer rounded-xl px-2 text-xs font-semibold transition-colors"
          style={{
            backgroundColor:
              mode === "couple" ? "var(--color-primary)" : "transparent",
            color:
              mode === "couple"
                ? "var(--color-background)"
                : "var(--color-text)",
          }}
        >
          Pemilik Undangan
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "superadmin"}
          onClick={() => handleModeChange("superadmin")}
          className="min-h-11 cursor-pointer rounded-xl px-2 text-xs font-semibold transition-colors"
          style={{
            backgroundColor:
              mode === "superadmin" ? "var(--color-primary)" : "transparent",
            color:
              mode === "superadmin"
                ? "var(--color-background)"
                : "var(--color-text)",
          }}
        >
          Super Admin
        </button>
      </div>

      {mode === "couple" ? (
        <div>
          <label
            htmlFor="invitation-slug"
            className="block text-sm font-medium opacity-85"
          >
            Slug Undangan
          </label>
          <input
            id="invitation-slug"
            name="slug"
            type="text"
            autoComplete="username"
            required
            value={slugValue}
            onChange={(event) => {
              setHasEditedSlug(true);
              setSlugInput(event.target.value);
            }}
            disabled={isSubmitting}
            placeholder="contoh: raka-dina"
            className="mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors focus:ring-2"
            style={inputStyle}
          />
          <p className="mt-1 text-xs opacity-65">
            Bagian akhir tautan undangan Anda (misal{" "}
            <code className="font-mono">/raka-dina</code> → isi{" "}
            <code className="font-mono">raka-dina</code>).
          </p>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="admin-password"
          className="block text-sm font-medium opacity-85"
        >
          {mode === "couple" ? "Sandi Undangan" : "Sandi Super Admin"}
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
            placeholder={
              mode === "couple"
                ? "Masukkan sandi undangan"
                : "Masukkan sandi Super Admin"
            }
            className="min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors focus:ring-2"
            style={inputStyle}
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
