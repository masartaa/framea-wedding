"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import type { GiftAccountItem, SiteConfig } from "@/lib/config-schema";
import {
  compressImageFile,
  formatFileSize,
  MAX_IMAGE_BYTES,
} from "@/lib/media-utils";

interface GiftManagerProps {
  invitationSlug: string;
  gift: SiteConfig["gift"];
  fieldErrors: Record<string, string>;
  onChangeGift: (nextGift: SiteConfig["gift"]) => void;
  onClearError: (key: string) => void;
}

interface UploadResponseBody {
  ok?: boolean;
  url?: string;
  error?: string;
}

const MAX_GIFT_ACCOUNTS = 4;

const BANK_PRESETS = [
  "BCA",
  "Mandiri",
  "BRI",
  "BNI",
  "BSI",
  "DANA",
  "GoPay",
  "OVO",
] as const;

function generateAccountId(): string {
  return `rek-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function GiftManager({
  invitationSlug,
  gift,
  fieldErrors,
  onChangeGift,
  onClearError,
}: GiftManagerProps) {
  const [isUploadingQris, setIsUploadingQris] = useState(false);
  const [notice, setNotice] = useState<{
    type: "info" | "error";
    message: string;
  } | null>(null);

  const accounts = gift.accounts ?? [];
  const qris = gift.qris ?? { imageUrl: "", label: "" };
  const shipping = gift.shipping ?? {
    recipientName: "",
    phone: "",
    address: "",
    note: "",
  };

  const updateMeta = (
    key: "title" | "introText" | "buttonLabel",
    value: string
  ) => {
    onChangeGift({ ...gift, [key]: value });
    onClearError(`gift.${key}`);
  };

  const addAccount = (presetBankName = "") => {
    if (accounts.length >= MAX_GIFT_ACCOUNTS) {
      setNotice({
        type: "error",
        message: `Maksimal ${MAX_GIFT_ACCOUNTS} rekening atau e-wallet per undangan.`,
      });
      return;
    }

    setNotice(null);
    const nextItem: GiftAccountItem = {
      id: generateAccountId(),
      bankName: presetBankName,
      accountNumber: "",
      accountHolder: "",
    };
    onChangeGift({
      ...gift,
      accounts: [...accounts, nextItem],
    });
  };

  const updateAccount = (
    index: number,
    key: "bankName" | "accountNumber" | "accountHolder",
    value: string
  ) => {
    const nextAccounts = accounts.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item
    );
    onChangeGift({ ...gift, accounts: nextAccounts });
    onClearError(`gift.accounts.${index}.${key}`);
  };

  const removeAccount = (index: number) => {
    onChangeGift({
      ...gift,
      accounts: accounts.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const moveAccount = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= accounts.length) {
      return;
    }
    const nextAccounts = [...accounts];
    const [moved] = nextAccounts.splice(index, 1);
    if (!moved) {
      return;
    }
    nextAccounts.splice(targetIndex, 0, moved);
    onChangeGift({ ...gift, accounts: nextAccounts });
  };

  const handleQrisUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setNotice(null);
    setIsUploadingQris(true);
    try {
      const prepared = await compressImageFile(file, 1200);
      if (prepared.file.size > MAX_IMAGE_BYTES) {
        throw new Error(
          "Ukuran gambar QRIS masih melebihi 2 MB setelah dikompres. Pilih gambar lain."
        );
      }

      const formData = new FormData();
      formData.append("file", prepared.file);
      formData.append("kind", "hadiah");
      formData.append("slug", invitationSlug);
      formData.append("sortOrder", "0");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as UploadResponseBody;
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Gagal mengunggah gambar QRIS.");
      }

      onChangeGift({
        ...gift,
        qris: {
          ...qris,
          imageUrl: data.url,
          label: qris.label || "QRIS Tanda Kasih",
        },
      });
      onClearError("gift.qris.imageUrl");

      const sizeInfo =
        prepared.compressedSize < prepared.originalSize
          ? `${formatFileSize(prepared.originalSize)} → ${formatFileSize(prepared.compressedSize)}`
          : formatFileSize(prepared.compressedSize);

      setNotice({
        type: "info",
        message: `Gambar QRIS berhasil diunggah (${sizeInfo}). Klik "Simpan & Publikasikan" untuk menayangkan.`,
      });
    } catch (error: unknown) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengunggah gambar QRIS.",
      });
    } finally {
      setIsUploadingQris(false);
    }
  };

  const updateShipping = (
    key: "recipientName" | "phone" | "address" | "note",
    value: string
  ) => {
    onChangeGift({
      ...gift,
      shipping: {
        ...shipping,
        [key]: value,
      },
    });
    onClearError(`gift.shipping.${key}`);
  };

  const inputClassName =
    "mt-1.5 min-h-11 w-full rounded-xl border px-3.5 text-sm transition-colors";
  const textareaClassName =
    "mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed transition-colors";
  const inputStyle = {
    backgroundColor: "var(--color-background)",
    borderColor: "color-mix(in srgb, var(--color-primary) 45%, transparent)",
    color: "var(--color-text)",
  };

  return (
    <section
      aria-label="Pengaturan Tanda Kasih"
      className="space-y-6 rounded-2xl border px-5 py-6 sm:px-6"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor:
          "color-mix(in srgb, var(--color-primary) 35%, transparent)",
      }}
    >
      <div>
        <h2 className="font-heading text-lg font-semibold">
          Tanda Kasih (Hadiah &amp; Amplop Digital)
        </h2>
        <p className="mt-0.5 text-sm opacity-75">
          Atur rekening bank atau e-wallet, gambar QRIS, dan alamat kirim kado.
          Di halaman undangan, rincian baru terbuka saat tamu menekan tombol{" "}
          <strong>{gift.buttonLabel || "Kirim Tanda Kasih"}</strong>.
        </p>
      </div>

      <div
        className="rounded-xl border px-4 py-3 text-xs leading-relaxed"
        style={{
          backgroundColor: "var(--color-secondary)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        Catatan privasi: nomor rekening, QRIS, dan alamat yang Anda isi akan
        terlihat oleh siapa saja yang membuka tautan undangan. Jika belum ingin
        menampilkan bagian ini, Anda bisa menonaktifkan section{" "}
        <strong>Tanda Kasih</strong> di tab Section.
      </div>

      {notice ? (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className="rounded-xl border px-4 py-3 text-sm font-medium"
          style={{
            backgroundColor:
              notice.type === "info"
                ? "var(--color-secondary)"
                : "color-mix(in srgb, var(--color-accent) 12%, var(--color-background))",
            borderColor:
              notice.type === "info"
                ? "var(--color-primary)"
                : "var(--color-accent)",
            color:
              notice.type === "info"
                ? "var(--color-text)"
                : "var(--color-accent)",
          }}
        >
          {notice.message}
        </div>
      ) : null}

      {/* Judul & Pengantar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gift-title" className="block text-sm font-medium">
            Judul Section
          </label>
          <input
            id="gift-title"
            type="text"
            maxLength={80}
            value={gift.title}
            onChange={(event) => updateMeta("title", event.target.value)}
            placeholder="Tanda Kasih"
            className={inputClassName}
            style={inputStyle}
          />
          {fieldErrors["gift.title"] ? (
            <p
              role="alert"
              className="mt-1 text-xs font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              {fieldErrors["gift.title"]}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="gift-button-label"
            className="block text-sm font-medium"
          >
            Teks Tombol Buka
          </label>
          <input
            id="gift-button-label"
            type="text"
            maxLength={40}
            value={gift.buttonLabel ?? "Kirim Tanda Kasih"}
            onChange={(event) => updateMeta("buttonLabel", event.target.value)}
            placeholder="Kirim Tanda Kasih"
            className={inputClassName}
            style={inputStyle}
          />
          {fieldErrors["gift.buttonLabel"] ? (
            <p
              role="alert"
              className="mt-1 text-xs font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              {fieldErrors["gift.buttonLabel"]}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="gift-intro" className="block text-sm font-medium">
          Kalimat Pengantar
        </label>
        <textarea
          id="gift-intro"
          rows={3}
          maxLength={350}
          value={gift.introText}
          onChange={(event) => updateMeta("introText", event.target.value)}
          className={textareaClassName}
          style={inputStyle}
        />
        {fieldErrors["gift.introText"] ? (
          <p
            role="alert"
            className="mt-1 text-xs font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            {fieldErrors["gift.introText"]}
          </p>
        ) : null}
      </div>

      {/* Rekening Bank / E-Wallet */}
      <div
        className="space-y-4 rounded-2xl border p-4 sm:p-5"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">
              Rekening Bank &amp; E-Wallet
            </h3>
            <p className="text-xs opacity-75">
              Maksimal {MAX_GIFT_ACCOUNTS} akun. Pilih preset cepat atau tambah
              manual.
            </p>
          </div>
          <span
            className="rounded-md px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-accent)",
            }}
          >
            {accounts.length} / {MAX_GIFT_ACCOUNTS} akun
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {BANK_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={accounts.length >= MAX_GIFT_ACCOUNTS}
              onClick={() => addAccount(preset)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3.5 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-40"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 38%, transparent)",
              }}
            >
              + {preset}
            </button>
          ))}
          <button
            type="button"
            disabled={accounts.length >= MAX_GIFT_ACCOUNTS}
            onClick={() => addAccount("")}
            className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            + Bank / E-Wallet Lain
          </button>
        </div>

        {accounts.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-xs opacity-75">
            Belum ada rekening atau e-wallet. Klik salah satu tombol di atas
            untuk menambahkan.
          </p>
        ) : (
          <div className="space-y-4">
            {accounts.map((account, index) => (
              <div
                key={account.id}
                className="space-y-3 rounded-2xl border p-4"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-secondary) 35%, var(--color-background))",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className="rounded-md px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: "var(--color-background)",
                      color: "var(--color-accent)",
                    }}
                  >
                    Akun #{index + 1}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveAccount(index, -1)}
                      aria-label={`Naikkan akun ${index + 1}`}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-sm transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-40"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === accounts.length - 1}
                      onClick={() => moveAccount(index, 1)}
                      aria-label={`Turunkan akun ${index + 1}`}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-sm transition-colors hover:bg-[var(--color-secondary)] disabled:opacity-40"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 40%, transparent)",
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAccount(index)}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3.5 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)]"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-accent) 45%, transparent)",
                        color: "var(--color-accent)",
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor={`gift-bank-${account.id}`}
                      className="block text-xs font-medium"
                    >
                      Nama Bank / E-Wallet
                    </label>
                    <input
                      id={`gift-bank-${account.id}`}
                      type="text"
                      maxLength={40}
                      value={account.bankName}
                      onChange={(event) =>
                        updateAccount(index, "bankName", event.target.value)
                      }
                      placeholder="Contoh: BCA / DANA"
                      className={inputClassName}
                      style={inputStyle}
                    />
                    {fieldErrors[`gift.accounts.${index}.bankName`] ? (
                      <p
                        role="alert"
                        className="mt-1 text-xs font-medium"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {fieldErrors[`gift.accounts.${index}.bankName`]}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor={`gift-number-${account.id}`}
                      className="block text-xs font-medium"
                    >
                      Nomor Rekening / HP
                    </label>
                    <input
                      id={`gift-number-${account.id}`}
                      type="text"
                      maxLength={40}
                      value={account.accountNumber}
                      onChange={(event) =>
                        updateAccount(index, "accountNumber", event.target.value)
                      }
                      placeholder="Contoh: 1234567890"
                      className={`${inputClassName} tabular-nums`}
                      style={inputStyle}
                    />
                    {fieldErrors[`gift.accounts.${index}.accountNumber`] ? (
                      <p
                        role="alert"
                        className="mt-1 text-xs font-medium"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {fieldErrors[`gift.accounts.${index}.accountNumber`]}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor={`gift-holder-${account.id}`}
                      className="block text-xs font-medium"
                    >
                      Atas Nama
                    </label>
                    <input
                      id={`gift-holder-${account.id}`}
                      type="text"
                      maxLength={80}
                      value={account.accountHolder}
                      onChange={(event) =>
                        updateAccount(index, "accountHolder", event.target.value)
                      }
                      placeholder="Nama pemilik rekening"
                      className={inputClassName}
                      style={inputStyle}
                    />
                    {fieldErrors[`gift.accounts.${index}.accountHolder`] ? (
                      <p
                        role="alert"
                        className="mt-1 text-xs font-medium"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {fieldErrors[`gift.accounts.${index}.accountHolder`]}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QRIS */}
      <div
        className="space-y-4 rounded-2xl border p-4 sm:p-5"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <div>
          <h3 className="text-sm font-semibold">Gambar QRIS (Opsional)</h3>
          <p className="text-xs opacity-75">
            Unggah tangkapan layar QRIS utuh (dengan tepi putihnya agar mudah
            dipindai tamu). Maksimal 2 MB.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: "var(--color-secondary)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 35%, transparent)",
            }}
          >
            {qris.imageUrl ? (
              <Image
                src={qris.imageUrl}
                alt={qris.label || "Pratinjau QRIS"}
                fill
                sizes="144px"
                className="object-contain p-1.5"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs opacity-75">
                Belum ada QRIS
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label
                htmlFor="gift-qris-label"
                className="block text-xs font-medium"
              >
                Label QRIS
              </label>
              <input
                id="gift-qris-label"
                type="text"
                maxLength={60}
                value={qris.label}
                onChange={(event) => {
                  onChangeGift({
                    ...gift,
                    qris: { ...qris, label: event.target.value },
                  });
                  onClearError("gift.qris.label");
                }}
                placeholder="Contoh: QRIS BCA a.n. Nama Mempelai"
                className={inputClassName}
                style={inputStyle}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-semibold transition-opacity hover:opacity-90 active:opacity-80 ${
                  isUploadingQris ? "pointer-events-none opacity-60" : ""
                }`}
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                }}
              >
                <span>
                  {isUploadingQris
                    ? "Mengunggah QRIS..."
                    : qris.imageUrl
                      ? "Ganti Gambar QRIS"
                      : "Unggah Gambar QRIS"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => void handleQrisUpload(event)}
                  disabled={isUploadingQris}
                  className="sr-only"
                />
              </label>

              {qris.imageUrl ? (
                <button
                  type="button"
                  disabled={isUploadingQris}
                  onClick={() =>
                    onChangeGift({
                      ...gift,
                      qris: { ...qris, imageUrl: "" },
                    })
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-50"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--color-accent) 45%, transparent)",
                    color: "var(--color-accent)",
                  }}
                >
                  Hapus QRIS
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Alamat Kirim Kado Fisik */}
      <div
        className="space-y-4 rounded-2xl border p-4 sm:p-5"
        style={{
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <div>
          <h3 className="text-sm font-semibold">
            Alamat Kirim Kado Fisik (Opsional)
          </h3>
          <p className="text-xs opacity-75">
            Isi nama penerima dan alamat lengkap jika ingin menampilkan opsi
            pengiriman kado fisik. Kosongkan jika tidak dipakai.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="gift-shipping-recipient"
              className="block text-xs font-medium"
            >
              Nama Penerima
            </label>
            <input
              id="gift-shipping-recipient"
              type="text"
              maxLength={80}
              value={shipping.recipientName}
              onChange={(event) =>
                updateShipping("recipientName", event.target.value)
              }
              placeholder="Contoh: Nama Mempelai / Keluarga"
              className={inputClassName}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              htmlFor="gift-shipping-phone"
              className="block text-xs font-medium"
            >
              No. HP Penerima (Opsional)
            </label>
            <input
              id="gift-shipping-phone"
              type="text"
              maxLength={30}
              value={shipping.phone}
              onChange={(event) => updateShipping("phone", event.target.value)}
              placeholder="Contoh: 0812-xxxx-xxxx"
              className={inputClassName}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="gift-shipping-address"
            className="block text-xs font-medium"
          >
            Alamat Lengkap
          </label>
          <textarea
            id="gift-shipping-address"
            rows={3}
            maxLength={300}
            value={shipping.address}
            onChange={(event) => updateShipping("address", event.target.value)}
            placeholder="Jl. ..., RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
            className={textareaClassName}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            htmlFor="gift-shipping-note"
            className="block text-xs font-medium"
          >
            Patokan / Catatan (Opsional)
          </label>
          <input
            id="gift-shipping-note"
            type="text"
            maxLength={120}
            value={shipping.note}
            onChange={(event) => updateShipping("note", event.target.value)}
            placeholder="Contoh: Rumah pagar hitam sebelah masjid"
            className={inputClassName}
            style={inputStyle}
          />
        </div>
      </div>
    </section>
  );
}
