"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { SiteConfig } from "@/lib/config-schema";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";

interface GiftSectionProps {
  giftConfig: SiteConfig["gift"];
  ornaments: boolean;
  previewMode?: boolean;
}

async function copyText(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fallback ke execCommand pada browser tanpa izin Clipboard API
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
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

export function GiftSection({
  giftConfig,
  ornaments,
  previewMode = false,
}: GiftSectionProps) {
  const title = giftConfig?.title?.trim() || "Tanda Kasih";
  const introText =
    giftConfig?.introText?.trim() ||
    "Doa restu Bapak/Ibu/Saudara/i merupakan karunia terindah bagi kami. Namun jika berkenan memberikan tanda kasih, dapat disampaikan melalui tautan di bawah ini.";
  const buttonLabel = giftConfig?.buttonLabel?.trim() || "Kirim Tanda Kasih";

  const accounts = (giftConfig?.accounts ?? []).filter(
    (item) =>
      item.bankName.trim() &&
      item.accountNumber.trim() &&
      item.accountHolder.trim()
  );
  const qrisImageUrl = giftConfig?.qris?.imageUrl?.trim() ?? "";
  const qrisLabel = giftConfig?.qris?.label?.trim() || "QRIS Tanda Kasih";
  const shippingRecipient = giftConfig?.shipping?.recipientName?.trim() ?? "";
  const shippingPhone = giftConfig?.shipping?.phone?.trim() ?? "";
  const shippingAddress = giftConfig?.shipping?.address?.trim() ?? "";
  const shippingNote = giftConfig?.shipping?.note?.trim() ?? "";
  const hasShipping = Boolean(shippingRecipient && shippingAddress);

  const hasAnyGiftContent =
    accounts.length > 0 || Boolean(qrisImageUrl) || hasShipping;

  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isQrisZoomOpen, setIsQrisZoomOpen] = useState(false);
  const qrisTriggerRef = useRef<HTMLButtonElement | null>(null);
  const qrisCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isQrisZoomOpen) {
      return undefined;
    }

    qrisCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsQrisZoomOpen(false);
        requestAnimationFrame(() => qrisTriggerRef.current?.focus());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQrisZoomOpen]);

  if (!hasAnyGiftContent && !previewMode) {
    return null;
  }

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2200);
    }
  };

  const fullShippingCopyText = [
    shippingRecipient,
    shippingPhone ? `HP: ${shippingPhone}` : "",
    shippingAddress,
    shippingNote ? `Catatan: ${shippingNote}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <section
      id="hadiah"
      aria-labelledby="judul-hadiah"
      className="px-5 py-14 text-center"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-secondary) 42%, var(--color-background))",
      }}
    >
      <Reveal>
        <p
          className="text-xs font-medium tracking-wider"
          style={{ color: "var(--color-accent)" }}
        >
          Wedding Gift
        </p>
        <h2
          id="judul-hadiah"
          className="font-heading mt-2 text-2xl font-semibold sm:text-3xl"
        >
          {title}
        </h2>
        <Ornament enabled={ornaments} className="my-4" />

        {introText ? (
          <p className="mx-auto max-w-sm whitespace-pre-line break-words text-sm leading-relaxed opacity-85">
            {introText}
          </p>
        ) : null}

        {!hasAnyGiftContent ? (
          <div
            className="mt-6 rounded-2xl border border-dashed px-5 py-7 text-sm opacity-75"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 45%, transparent)",
            }}
          >
            Belum ada rekening, QRIS, atau alamat kado yang diisi. Tambahkan di
            tab Hadiah agar tampil untuk tamu.
          </div>
        ) : (
          <div className="mt-6">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls="panel-hadiah-detail"
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex min-h-11 min-w-48 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity duration-150 hover:opacity-90 active:opacity-80"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              }}
            >
              <svg
                aria-hidden="true"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="8" width="18" height="4" rx="1" />
                <path d="M12 8v13" />
                <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
              </svg>
              <span>{isOpen ? "Sembunyikan Tanda Kasih" : buttonLabel}</span>
            </button>

            <div
              id="panel-hadiah-detail"
              hidden={!isOpen}
              className="mt-6 space-y-4 text-left"
            >
              <span className="sr-only" aria-live="polite">
                {copiedKey ? "Berhasil disalin ke papan klip." : ""}
              </span>

              {accounts.map((account) => {
                const copyId = `acc-${account.id}`;
                const isCopied = copiedKey === copyId;

                return (
                  <article
                    key={account.id}
                    className="rounded-3xl border px-5 py-5"
                    style={{
                      backgroundColor: "var(--color-background)",
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 38%, transparent)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="text-xs font-semibold tracking-wider uppercase"
                          style={{ color: "var(--color-accent)" }}
                        >
                          {account.bankName}
                        </p>
                        <p className="font-heading mt-1.5 text-xl font-semibold tracking-wide break-all tabular-nums">
                          {account.accountNumber}
                        </p>
                        <p className="mt-1 text-sm opacity-80 break-words">
                          a.n. {account.accountHolder}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void handleCopy(copyId, account.accountNumber)
                      }
                      aria-label={`Salin nomor ${account.bankName} atas nama ${account.accountHolder}`}
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                      style={{
                        backgroundColor: isCopied
                          ? "var(--color-primary)"
                          : "var(--color-secondary)",
                        borderColor: "var(--color-primary)",
                        color: isCopied
                          ? "var(--color-background)"
                          : "var(--color-text)",
                      }}
                    >
                      {isCopied ? "Nomor Tersalin!" : "Salin Nomor Rekening"}
                    </button>
                  </article>
                );
              })}

              {qrisImageUrl ? (
                <article
                  className="rounded-3xl border px-5 py-5 text-center"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 38%, transparent)",
                  }}
                >
                  <p
                    className="text-xs font-semibold tracking-wider uppercase"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {qrisLabel}
                  </p>

                  <div
                    className="relative mx-auto mt-4 aspect-square w-56 max-w-full overflow-hidden rounded-2xl border"
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      borderColor:
                        "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                    }}
                  >
                    <Image
                      src={qrisImageUrl}
                      alt={qrisLabel}
                      fill
                      sizes="224px"
                      className="object-contain p-2"
                    />
                  </div>

                  <button
                    ref={qrisTriggerRef}
                    type="button"
                    onClick={() => setIsQrisZoomOpen(true)}
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border px-5 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      borderColor: "var(--color-primary)",
                      color: "var(--color-text)",
                    }}
                  >
                    Perbesar QRIS
                  </button>
                </article>
              ) : null}

              {hasShipping ? (
                <article
                  className="rounded-3xl border px-5 py-5"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 38%, transparent)",
                  }}
                >
                  <p
                    className="text-xs font-semibold tracking-wider uppercase"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Kirim Kado Fisik
                  </p>
                  <p className="font-heading mt-1.5 text-lg font-semibold break-words">
                    {shippingRecipient}
                  </p>
                  {shippingPhone ? (
                    <p className="mt-0.5 text-xs font-medium opacity-80">
                      HP: {shippingPhone}
                    </p>
                  ) : null}
                  <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed opacity-85">
                    {shippingAddress}
                  </p>
                  {shippingNote ? (
                    <p className="mt-1.5 text-xs opacity-75 break-words">
                      Catatan: {shippingNote}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      void handleCopy("shipping-addr", fullShippingCopyText)
                    }
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
                    style={{
                      backgroundColor:
                        copiedKey === "shipping-addr"
                          ? "var(--color-primary)"
                          : "var(--color-secondary)",
                      borderColor: "var(--color-primary)",
                      color:
                        copiedKey === "shipping-addr"
                          ? "var(--color-background)"
                          : "var(--color-text)",
                    }}
                  >
                    {copiedKey === "shipping-addr"
                      ? "Alamat Tersalin!"
                      : "Salin Alamat Pengiriman"}
                  </button>
                </article>
              ) : null}
            </div>
          </div>
        )}
      </Reveal>

      {isQrisZoomOpen && qrisImageUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau perbesar QRIS"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-text) 90%, black)",
          }}
          onClick={() => {
            setIsQrisZoomOpen(false);
            requestAnimationFrame(() => qrisTriggerRef.current?.focus());
          }}
        >
          <div
            className="relative flex w-full max-w-sm flex-col items-center rounded-3xl border p-5"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor: "var(--color-primary)",
              color: "var(--color-text)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex w-full items-center justify-between gap-2">
              <p className="text-sm font-semibold">{qrisLabel}</p>
              <button
                ref={qrisCloseRef}
                type="button"
                onClick={() => {
                  setIsQrisZoomOpen(false);
                  requestAnimationFrame(() => qrisTriggerRef.current?.focus());
                }}
                aria-label="Tutup pratinjau QRIS"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border text-sm font-medium transition-opacity hover:opacity-85 active:opacity-75"
                style={{
                  borderColor: "var(--color-primary)",
                  backgroundColor: "var(--color-secondary)",
                  color: "var(--color-text)",
                }}
              >
                ✕
              </button>
            </div>

            <div
              className="relative aspect-square w-full overflow-hidden rounded-2xl border"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 28%, transparent)",
              }}
            >
              <Image
                src={qrisImageUrl}
                alt={qrisLabel}
                fill
                sizes="(max-width: 640px) 88vw, 360px"
                className="object-contain p-3"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
