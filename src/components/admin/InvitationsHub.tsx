"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formatEventDateShort } from "@/lib/format";
import {
  isValidInvitationSlug,
  normalizeInvitationSlug,
} from "@/lib/invitation-slug";
import type { InvitationSummary } from "@/lib/invitations";

interface InvitationsHubProps {
  initialInvitations: InvitationSummary[];
}

interface CreateResponse {
  ok?: boolean;
  invitation?: InvitationSummary;
  error?: string;
}

interface PatchResponse {
  ok?: boolean;
  invitation?: {
    id: number;
    slug: string;
    label: string;
    hasPassword: boolean;
    updatedAt: string;
  };
  error?: string;
}

async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback di bawah
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function InvitationsHub({ initialInvitations }: InvitationsHubProps) {
  const [items, setItems] = useState<InvitationSummary[]>(initialInvitations);
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editNextSlug, setEditNextSlug] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(
    null
  );
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const normalizedCreateSlug = normalizeInvitationSlug(
    hasEditedSlug ? slug : label
  );

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (!label.trim()) {
      setNotice({ type: "error", message: "Nama undangan wajib diisi." });
      return;
    }

    if (!isValidInvitationSlug(normalizedCreateSlug)) {
      setNotice({
        type: "error",
        message:
          "Slug tidak valid. Gunakan minimal 2 karakter huruf kecil, angka, atau tanda hubung (-) dan bukan kata sistem (admin/api/login).",
      });
      return;
    }

    if (password.trim() && password.trim().length < 6) {
      setNotice({
        type: "error",
        message: "Sandi pasangan minimal 6 karakter (atau kosongkan).",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          slug: normalizedCreateSlug,
          password: password.trim(),
        }),
      });

      const data = (await response.json()) as CreateResponse;
      if (!response.ok || !data.invitation) {
        setNotice({
          type: "error",
          message: data.error ?? "Gagal membuat undangan baru.",
        });
        return;
      }

      setItems((prev) => [...prev, data.invitation!]);
      setLabel("");
      setSlug("");
      setHasEditedSlug(false);
      setPassword("");
      setNotice({
        type: "success",
        message: `Undangan "${data.invitation.label}" (/${data.invitation.slug}) berhasil dibuat!`,
      });
    } catch {
      setNotice({
        type: "error",
        message: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (item: InvitationSummary) => {
    setEditingSlug(item.slug);
    setEditLabel(item.label);
    setEditNextSlug(item.slug);
    setEditPassword("");
    setConfirmDeleteSlug(null);
    setNotice(null);
  };

  const handleSaveMeta = async (
    currentSlug: string,
    clearPassword = false
  ) => {
    setNotice(null);
    const nextSlugClean = normalizeInvitationSlug(editNextSlug);
    if (!editLabel.trim()) {
      setNotice({ type: "error", message: "Nama undangan tidak boleh kosong." });
      return;
    }
    if (!isValidInvitationSlug(nextSlugClean)) {
      setNotice({
        type: "error",
        message:
          "Slug baru tidak valid. Gunakan huruf kecil, angka, atau tanda hubung (-).",
      });
      return;
    }
    if (!clearPassword && editPassword.trim() && editPassword.trim().length < 6) {
      setNotice({
        type: "error",
        message: "Sandi pasangan baru minimal 6 karakter.",
      });
      return;
    }

    setIsSavingMeta(true);
    try {
      const payload: {
        label: string;
        slug: string;
        password?: string | null;
      } = {
        label: editLabel.trim(),
        slug: nextSlugClean,
      };
      if (clearPassword) {
        payload.password = null;
      } else if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      const response = await fetch(
        `/api/admin/invitations/${encodeURIComponent(currentSlug)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = (await response.json()) as PatchResponse;
      if (!response.ok || !data.invitation) {
        setNotice({
          type: "error",
          message: data.error ?? "Gagal memperbarui pengaturan undangan.",
        });
        return;
      }

      const updated = data.invitation;
      setItems((prev) =>
        prev.map((row) =>
          row.slug === currentSlug
            ? {
                ...row,
                slug: updated.slug,
                label: updated.label,
                hasPassword: updated.hasPassword,
                updatedAt: updated.updatedAt,
              }
            : row
        )
      );
      setEditingSlug(null);
      setEditPassword("");
      setNotice({
        type: "success",
        message: `Pengaturan undangan "${updated.label}" (/${updated.slug}) berhasil diperbarui.`,
      });
    } catch {
      setNotice({
        type: "error",
        message: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleDelete = async (targetSlug: string) => {
    setDeletingSlug(targetSlug);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/admin/invitations/${encodeURIComponent(targetSlug)}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setNotice({
          type: "error",
          message: data.error ?? "Gagal menghapus undangan.",
        });
        return;
      }

      setItems((prev) => prev.filter((row) => row.slug !== targetSlug));
      setConfirmDeleteSlug(null);
      setNotice({
        type: "success",
        message: `Undangan "/${targetSlug}" beserta data tamu, ucapan, dan medianya telah dihapus.`,
      });
    } catch {
      setNotice({
        type: "error",
        message: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleCopyLoginLink = async (targetSlug: string) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const loginUrl = `${origin}/admin/login?slug=${encodeURIComponent(targetSlug)}`;
    const ok = await copyText(loginUrl);
    if (ok) {
      setCopiedSlug(targetSlug);
      window.setTimeout(() => {
        setCopiedSlug((prev) => (prev === targetSlug ? null : prev));
      }, 2000);
    }
  };

  const inputClassName =
    "mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none focus:ring-2";
  const inputStyle = {
    backgroundColor: "var(--color-background)",
    borderColor: "color-mix(in srgb, var(--color-primary) 45%, transparent)",
    color: "var(--color-text)",
  };

  return (
    <div className="space-y-6">
      {/* Form Buat Undangan Baru */}
      <section
        className="rounded-3xl border px-5 py-6 sm:px-6"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 40%, transparent)",
        }}
      >
        <div>
          <p
            className="text-xs font-medium tracking-[0.18em] uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Panel Super Admin
          </p>
          <h1 className="font-heading mt-1 text-2xl font-semibold">
            Kelola Semua Undangan
          </h1>
          <p className="mt-1 text-sm opacity-75">
            Buat undangan baru untuk Anda, teman, atau keluarga. Setiap undangan
            memiliki tautan, foto, tamu, ucapan, dan sandi login sendiri.
          </p>
        </div>

        {notice ? (
          <div
            role={notice.type === "error" ? "alert" : "status"}
            className="mt-4 rounded-2xl border px-4 py-3 text-sm font-medium"
            style={{
              backgroundColor:
                notice.type === "success"
                  ? "var(--color-secondary)"
                  : "color-mix(in srgb, var(--color-accent) 12%, var(--color-background))",
              borderColor:
                notice.type === "success"
                  ? "var(--color-primary)"
                  : "var(--color-accent)",
              color:
                notice.type === "success"
                  ? "var(--color-text)"
                  : "var(--color-accent)",
            }}
          >
            {notice.message}
          </div>
        ) : null}

        <form
          onSubmit={handleCreate}
          noValidate
          className="mt-5 space-y-4 rounded-2xl border p-4 sm:p-5"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-secondary) 38%, var(--color-background))",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 30%, transparent)",
          }}
        >
          <h2 className="font-heading text-base font-semibold">
            Buat Undangan Baru
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="new-invitation-label"
                className="block text-sm font-medium"
              >
                Nama Undangan
              </label>
              <input
                id="new-invitation-label"
                type="text"
                maxLength={120}
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                disabled={isCreating}
                placeholder="Contoh: Raka & Dina"
                className={inputClassName}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="new-invitation-slug"
                className="block text-sm font-medium"
              >
                Slug Tautan (URL)
              </label>
              <input
                id="new-invitation-slug"
                type="text"
                maxLength={80}
                value={hasEditedSlug ? slug : normalizedCreateSlug}
                onChange={(event) => {
                  setHasEditedSlug(true);
                  setSlug(event.target.value);
                }}
                disabled={isCreating}
                placeholder="raka-dina"
                className={`${inputClassName} font-mono`}
                style={inputStyle}
              />
              <p className="mt-1 text-[11px] opacity-70">
                Tautan publik:{" "}
                <code className="font-mono">
                  /{normalizedCreateSlug || "slug-anda"}
                </code>
              </p>
            </div>

            <div>
              <label
                htmlFor="new-invitation-password"
                className="block text-sm font-medium"
              >
                Sandi Pemilik (Opsional)
              </label>
              <input
                id="new-invitation-password"
                type="text"
                maxLength={200}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isCreating}
                placeholder="Min. 6 karakter"
                className={inputClassName}
                style={inputStyle}
              />
              <p className="mt-1 text-[11px] opacity-70">
                Isi jika teman/pasangan boleh login &amp; edit sendiri.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-6 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              }}
            >
              {isCreating ? "Membuat..." : "+ Buat Undangan"}
            </button>
          </div>
        </form>
      </section>

      {/* Daftar Undangan */}
      <section aria-labelledby="judul-daftar-undangan" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="judul-daftar-undangan"
            className="font-heading text-xl font-semibold"
          >
            Daftar Undangan ({items.length})
          </h2>
        </div>

        {items.length === 0 ? (
          <div
            className="rounded-3xl border border-dashed px-6 py-10 text-center text-sm opacity-75"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 40%, transparent)",
            }}
          >
            Belum ada undangan tersimpan. Gunakan formulir di atas untuk membuat
            undangan pertama Anda.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isEditing = editingSlug === item.slug;
              const isConfirmingDelete = confirmDeleteSlug === item.slug;

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border p-5"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 35%, transparent)",
                  }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-xl font-semibold">
                          {item.label}
                        </h3>
                        <span
                          className="rounded-full px-2.5 py-0.5 font-mono text-xs font-medium"
                          style={{
                            backgroundColor: "var(--color-secondary)",
                            color: "var(--color-accent)",
                          }}
                        >
                          /{item.slug}
                        </span>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: item.hasPassword
                              ? "var(--color-secondary)"
                              : "color-mix(in srgb, var(--color-text) 8%, transparent)",
                            color: item.hasPassword
                              ? "var(--color-accent)"
                              : "var(--color-text)",
                          }}
                        >
                          {item.hasPassword
                            ? "Login Pasangan Aktif"
                            : "Hanya Super Admin"}
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm opacity-80">
                        {item.coupleTitle} ·{" "}
                        {formatEventDateShort(item.eventDate)}
                      </p>

                      <p className="mt-1 text-xs opacity-65">
                        {item.guestCount} tamu · {item.wishCount} ucapan
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/${item.slug}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "var(--color-background)",
                        }}
                      >
                        Kelola Undangan
                      </Link>

                      <Link
                        href={`/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-xs font-medium"
                        style={{
                          backgroundColor: "var(--color-secondary)",
                          borderColor:
                            "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                        }}
                      >
                        Buka /{item.slug}
                      </Link>
                    </div>
                  </div>

                  <div
                    className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3.5"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 22%, transparent)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => void handleCopyLoginLink(item.slug)}
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                      }}
                    >
                      {copiedSlug === item.slug
                        ? "Link Login Tersalin!"
                        : "Salin Link Login Pasangan"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        isEditing ? setEditingSlug(null) : startEditing(item)
                      }
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium"
                      style={{
                        backgroundColor: isEditing
                          ? "var(--color-secondary)"
                          : "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                      }}
                    >
                      {isEditing ? "Tutup Pengaturan" : "Ubah Slug / Sandi"}
                    </button>

                    {isConfirmingDelete ? (
                      <div className="ml-auto flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          disabled={deletingSlug === item.slug}
                          onClick={() => setConfirmDeleteSlug(null)}
                          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-3.5 text-xs font-medium"
                          style={{
                            backgroundColor: "var(--color-background)",
                            borderColor:
                              "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                          }}
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={deletingSlug === item.slug}
                          onClick={() => void handleDelete(item.slug)}
                          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-4 text-xs font-semibold"
                          style={{
                            backgroundColor: "var(--color-accent)",
                            color: "var(--color-background)",
                          }}
                        >
                          {deletingSlug === item.slug
                            ? "Menghapus..."
                            : "Yakin Hapus Permanen"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlug(null);
                          setConfirmDeleteSlug(item.slug);
                        }}
                        className="ml-auto inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium"
                        style={{
                          backgroundColor: "var(--color-background)",
                          borderColor:
                            "color-mix(in srgb, var(--color-accent) 45%, transparent)",
                          color: "var(--color-accent)",
                        }}
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div
                      className="mt-4 space-y-3.5 rounded-2xl border p-4"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--color-secondary) 40%, var(--color-background))",
                        borderColor: "var(--color-primary)",
                      }}
                    >
                      <p className="text-xs font-semibold">
                        Pengaturan Undangan &amp; Sandi Pasangan
                      </p>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label
                            htmlFor={`edit-label-${item.id}`}
                            className="block text-xs font-medium"
                          >
                            Nama Undangan
                          </label>
                          <input
                            id={`edit-label-${item.id}`}
                            type="text"
                            maxLength={120}
                            value={editLabel}
                            onChange={(event) =>
                              setEditLabel(event.target.value)
                            }
                            className={inputClassName}
                            style={inputStyle}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-slug-${item.id}`}
                            className="block text-xs font-medium"
                          >
                            Slug Tautan
                          </label>
                          <input
                            id={`edit-slug-${item.id}`}
                            type="text"
                            maxLength={80}
                            value={editNextSlug}
                            onChange={(event) =>
                              setEditNextSlug(event.target.value)
                            }
                            className={`${inputClassName} font-mono`}
                            style={inputStyle}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`edit-pass-${item.id}`}
                            className="block text-xs font-medium"
                          >
                            Sandi Pasangan Baru
                          </label>
                          <input
                            id={`edit-pass-${item.id}`}
                            type="text"
                            maxLength={200}
                            value={editPassword}
                            onChange={(event) =>
                              setEditPassword(event.target.value)
                            }
                            placeholder="Kosongkan jika tetap"
                            className={inputClassName}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {item.hasPassword ? (
                          <button
                            type="button"
                            disabled={isSavingMeta}
                            onClick={() => void handleSaveMeta(item.slug, true)}
                            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border px-4 text-xs font-medium"
                            style={{
                              backgroundColor: "var(--color-background)",
                              borderColor:
                                "color-mix(in srgb, var(--color-accent) 45%, transparent)",
                              color: "var(--color-accent)",
                            }}
                          >
                            Matikan Login Pasangan
                          </button>
                        ) : (
                          <span className="text-xs opacity-70">
                            Isi sandi (min. 6 karakter) untuk mengaktifkan login
                            pasangan.
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={isSavingMeta}
                          onClick={() => void handleSaveMeta(item.slug, false)}
                          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-5 text-xs font-semibold disabled:opacity-60"
                          style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-background)",
                          }}
                        >
                          {isSavingMeta ? "Menyimpan..." : "Simpan Pengaturan"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
