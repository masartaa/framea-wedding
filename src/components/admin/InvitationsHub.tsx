"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formatEventDateShort } from "@/lib/format";
import {
  isValidInvitationSlug,
  normalizeInvitationSlug,
} from "@/lib/invitation-slug";
import type { InvitationSummary } from "@/lib/invitations";

import { SITE_ORIGIN } from "@/lib/marketing";

interface InvitationsHubProps {
  initialInvitations: InvitationSummary[];
}

const DEFAULT_CLIENT_HANDOVER_TEMPLATE = [
  "Halo Kak, undangan pernikahan digital untuk *{nama}* sudah aktif dan siap dikelola.",
  "",
  "Tautan Undangan Publik:",
  "{link_undangan}",
  "",
  "Login Panel Pemilik:",
  "{link_login}",
  "Slug: {slug}",
  "Sandi: {sandi}",
  "",
  "Panduan Cara Edit, Tambah Tamu & Sebar WA:",
  "{link_panduan}",
  "",
  "Silakan login untuk mengubah teks, foto, tema, tanda kasih, serta membuat tautan nama tamu WhatsApp. Jika butuh langkah cepat, cek juga tab Panduan di dalam dashboard ya Kak.",
].join("\n");

function renderHandoverMessage(
  template: string,
  values: {
    nama: string;
    slug: string;
    sandi: string;
    linkUndangan: string;
    linkLogin: string;
    linkPanduan: string;
  }
): string {
  return template
    .replaceAll("{nama}", values.nama)
    .replaceAll("{slug}", values.slug)
    .replaceAll("{sandi}", values.sandi || "[Isi sandi klien di sini]")
    .replaceAll("{link_undangan}", values.linkUndangan)
    .replaceAll("{link_login}", values.linkLogin)
    .replaceAll("{link_panduan}", values.linkPanduan);
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
      // Clipboard API fails on insecure origins; fall back to execCommand.
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [handoverTemplate, setHandoverTemplate] = useState(
    DEFAULT_CLIENT_HANDOVER_TEMPLATE
  );
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [handoverSlug, setHandoverSlug] = useState<string | null>(null);
  const [sessionPasswords, setSessionPasswords] = useState<
    Record<string, string>
  >({});
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

      const createdInvitation = data.invitation;
      const submittedPassword = password.trim();
      setItems((prev) => [...prev, createdInvitation]);
      if (submittedPassword) {
        setSessionPasswords((prev) => ({
          ...prev,
          [createdInvitation.slug]: submittedPassword,
        }));
      }
      setHandoverSlug(createdInvitation.slug);
      setLabel("");
      setSlug("");
      setHasEditedSlug(false);
      setPassword("");
      setNotice({
        type: "success",
        message: `Undangan "${createdInvitation.label}" (/${createdInvitation.slug}) berhasil dibuat! Pesan kirim slug dan sandi sudah siap disalin di bawah.`,
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
      const submittedEditPassword = editPassword.trim();
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
      setSessionPasswords((prev) => {
        const next = { ...prev };
        const existingPassword = next[currentSlug];
        if (currentSlug !== updated.slug) {
          delete next[currentSlug];
        }
        if (clearPassword) {
          delete next[updated.slug];
        } else if (submittedEditPassword) {
          next[updated.slug] = submittedEditPassword;
        } else if (existingPassword) {
          next[updated.slug] = existingPassword;
        }
        return next;
      });
      if (!clearPassword && submittedEditPassword) {
        setHandoverSlug(updated.slug);
      } else if (handoverSlug === currentSlug) {
        setHandoverSlug(updated.slug);
      }
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
      setSessionPasswords((prev) => {
        const next = { ...prev };
        delete next[targetSlug];
        return next;
      });
      if (handoverSlug === targetSlug) {
        setHandoverSlug(null);
      }
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

  const getOrigin = () =>
    typeof window !== "undefined" ? window.location.origin : SITE_ORIGIN;

  const buildClientHandoverMessage = (item: InvitationSummary): string => {
    const origin = getOrigin();
    return renderHandoverMessage(handoverTemplate, {
      nama: item.label,
      slug: item.slug,
      sandi: sessionPasswords[item.slug]?.trim() ?? "",
      linkUndangan: `${origin}/${item.slug}`,
      linkLogin: `${origin}/login?slug=${encodeURIComponent(item.slug)}`,
      linkPanduan: `${origin}/panduan`,
    });
  };

  const handleCopyLoginLink = async (targetSlug: string) => {
    const loginUrl = `${getOrigin()}/login?slug=${encodeURIComponent(targetSlug)}`;
    const ok = await copyText(loginUrl);
    if (ok) {
      const key = `login:${targetSlug}`;
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2200);
    }
  };

  const handleCopyHandoverMessage = async (item: InvitationSummary) => {
    const message = buildClientHandoverMessage(item);
    const ok = await copyText(message);
    if (ok) {
      const key = `handover:${item.slug}`;
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2200);
    }
  };

  const inputClassName =
    "mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm transition-colors";
  const inputStyle = {
    backgroundColor: "var(--color-background)",
    borderColor: "color-mix(in srgb, var(--color-primary) 45%, transparent)",
    color: "var(--color-text)",
  };

  return (
    <div className="space-y-6">
      <section
        className="rounded-2xl border px-5 py-6 sm:px-6"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 40%, transparent)",
        }}
      >
        <div>
          <h1 className="font-heading text-2xl font-semibold">
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
            className="mt-4 rounded-xl border px-4 py-3 text-sm font-medium"
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
                placeholder="Contoh: Nama Pria & Nama Wanita"
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
                placeholder="nama-pria-wanita"
                className={`${inputClassName} font-mono`}
                style={inputStyle}
              />
              <p className="mt-1 text-[11px] opacity-75">
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
              <p className="mt-1 text-[11px] opacity-75">
                Isi jika teman/pasangan boleh login &amp; edit sendiri.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
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

      <section aria-labelledby="judul-daftar-undangan" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="judul-daftar-undangan"
            className="font-heading text-xl font-semibold"
          >
            Daftar Undangan ({items.length})
          </h2>

          <button
            type="button"
            aria-expanded={isTemplateEditorOpen}
            aria-controls="panel-template-pesan-klien"
            onClick={() => setIsTemplateEditorOpen((prev) => !prev)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
            style={{
              backgroundColor: isTemplateEditorOpen
                ? "var(--color-secondary)"
                : "var(--color-background)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 42%, transparent)",
            }}
          >
            {isTemplateEditorOpen
              ? "Tutup Template Pesan"
              : "Atur Template Pesan Klien"}
          </button>
        </div>

        {isTemplateEditorOpen ? (
          <div
            id="panel-template-pesan-klien"
            className="space-y-3 rounded-2xl border p-4 sm:p-5"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 35%, transparent)",
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">
                  Template Pesan Kirim Slug &amp; Sandi ke Klien
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed opacity-75">
                  Variabel otomatis:{" "}
                  <code className="font-mono">{"{nama}"}</code>,{" "}
                  <code className="font-mono">{"{slug}"}</code>,{" "}
                  <code className="font-mono">{"{sandi}"}</code>,{" "}
                  <code className="font-mono">{"{link_undangan}"}</code>,{" "}
                  <code className="font-mono">{"{link_login}"}</code>,{" "}
                  <code className="font-mono">{"{link_panduan}"}</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setHandoverTemplate(DEFAULT_CLIENT_HANDOVER_TEMPLATE)
                }
                className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3.5 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                }}
              >
                Reset Template
              </button>
            </div>

            <div>
              <label htmlFor="superadmin-handover-template" className="sr-only">
                Isi template pesan serah terima klien
              </label>
              <textarea
                id="superadmin-handover-template"
                rows={10}
                value={handoverTemplate}
                onChange={(event) => setHandoverTemplate(event.target.value)}
                className="w-full rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed sm:text-sm"
                style={inputStyle}
              />
            </div>
          </div>
        ) : null}

        {items.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm opacity-75"
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
              const isHandoverOpen = handoverSlug === item.slug;
              const isConfirmingDelete = confirmDeleteSlug === item.slug;
              const renderedHandover = isHandoverOpen
                ? buildClientHandoverMessage(item)
                : "";
              const whatsappShareHref = renderedHandover
                ? `https://wa.me/?text=${encodeURIComponent(renderedHandover)}`
                : "";

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border p-5"
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
                          className="rounded-md px-2 py-0.5 font-mono text-xs font-medium"
                          style={{
                            backgroundColor: "var(--color-secondary)",
                            color: "var(--color-accent)",
                          }}
                        >
                          /{item.slug}
                        </span>
                        <span
                          className="rounded-md px-2 py-0.5 text-[11px] font-medium"
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

                      <p className="mt-1 text-xs opacity-75">
                        {item.guestCount} tamu · {item.wishCount} ucapan
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/${item.slug}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
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
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-opacity hover:opacity-85 active:opacity-75"
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
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                      }}
                    >
                      {copiedKey === `login:${item.slug}`
                        ? "Link Login Tersalin!"
                        : "Salin Link Login Klien"}
                    </button>

                    <button
                      type="button"
                      aria-expanded={isHandoverOpen}
                      aria-controls={`handover-panel-${item.id}`}
                      onClick={() => {
                        setEditingSlug(null);
                        setConfirmDeleteSlug(null);
                        setHandoverSlug(isHandoverOpen ? null : item.slug);
                      }}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                      style={{
                        backgroundColor: isHandoverOpen
                          ? "var(--color-secondary)"
                          : "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                        color: "var(--color-text)",
                      }}
                    >
                      {isHandoverOpen
                        ? "Tutup Pesan Klien"
                        : "Kirim Slug & Sandi"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setHandoverSlug(null);
                        if (isEditing) {
                          setEditingSlug(null);
                        } else {
                          startEditing(item);
                        }
                      }}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
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
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3.5 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
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
                          className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
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
                        className="ml-auto inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
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

                  {isHandoverOpen ? (
                    <div
                      id={`handover-panel-${item.id}`}
                      className="mt-4 space-y-3.5 rounded-2xl border p-4"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--color-secondary) 42%, var(--color-background))",
                        borderColor: "var(--color-primary)",
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold">
                          Pesan Kirim Slug &amp; Sandi untuk Klien
                        </p>
                        <span className="text-[11px] opacity-75">
                          Sandi tidak disimpan ke browser (hilang saat refresh)
                        </span>
                      </div>

                      <div>
                        <label
                          htmlFor={`handover-pass-${item.id}`}
                          className="block text-xs font-medium"
                        >
                          Sandi Klien (untuk diisikan ke pesan)
                        </label>
                        <input
                          id={`handover-pass-${item.id}`}
                          type="text"
                          maxLength={200}
                          value={sessionPasswords[item.slug] ?? ""}
                          onChange={(event) => {
                            const nextVal = event.target.value;
                            setSessionPasswords((prev) => ({
                              ...prev,
                              [item.slug]: nextVal,
                            }));
                          }}
                          placeholder={
                            item.hasPassword
                              ? "Ketik sandi pasangan untuk dimasukkan ke pesan"
                              : "Login pasangan belum aktif (atur sandi di Ubah Slug / Sandi)"
                          }
                          className={inputClassName}
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <p className="mb-1.5 text-xs font-medium">
                          Pratinjau Pesan Siap Kirim
                        </p>
                        <pre
                          className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border p-3.5 font-sans text-xs leading-relaxed"
                          style={{
                            backgroundColor: "var(--color-background)",
                            borderColor:
                              "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                          }}
                        >
                          {renderedHandover}
                        </pre>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleCopyHandoverMessage(item)}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80"
                          style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-background)",
                          }}
                        >
                          {copiedKey === `handover:${item.slug}`
                            ? "Pesan Tersalin!"
                            : "Salin Pesan"}
                        </button>

                        <a
                          href={whatsappShareHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                          style={{
                            backgroundColor: "var(--color-background)",
                            borderColor: "var(--color-primary)",
                            color: "var(--color-primary)",
                          }}
                        >
                          Buka di WhatsApp
                        </a>
                      </div>
                    </div>
                  ) : null}

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
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
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
                          <span className="text-xs opacity-75">
                            Isi sandi (min. 6 karakter) untuk mengaktifkan login
                            pasangan.
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={isSavingMeta}
                          onClick={() => void handleSaveMeta(item.slug, false)}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
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
