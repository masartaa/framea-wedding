"use client";

import {
  CLIENT_GUIDE_FAQS,
  CLIENT_GUIDE_STEPS,
  type GuideTabTarget,
} from "@/lib/client-guide-data";
import { buildWhatsAppOrderUrl } from "@/lib/marketing";

interface ClientGuideProps {
  invitationSlug?: string;
  onJumpToTab?: (tab: GuideTabTarget) => void;
  disabledTabs?: ReadonlySet<GuideTabTarget>;
}

export function ClientGuide({
  invitationSlug,
  onJumpToTab,
  disabledTabs,
}: ClientGuideProps) {
  const supportMessage = invitationSlug
    ? `Halo admin Framea, saya pemilik undangan /${invitationSlug}. Saya sudah membaca panduan dan butuh bantuan terkait:`
    : "Halo admin Framea, saya sudah membaca panduan pemilik undangan dan butuh bantuan terkait:";
  const supportWhatsAppUrl = buildWhatsAppOrderUrl(supportMessage);

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="judul-panduan-langkah"
        className="rounded-2xl border px-5 py-6 sm:px-6"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 35%, transparent)",
        }}
      >
        <div>
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--color-accent)" }}
          >
            Alur Cepat Pemilik Undangan
          </p>
          <h2
            id="judul-panduan-langkah"
            className="font-heading mt-1 text-xl font-semibold sm:text-2xl"
          >
            5 Langkah Menyiapkan &amp; Menyebar Undangan
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed opacity-75">
            Ikuti urutan singkat berikut agar undangan siap dikirim ke tamu
            lewat WhatsApp tanpa terlewat satu pun bagian penting.
          </p>
        </div>

        <ol className="mt-5 space-y-4">
          {CLIENT_GUIDE_STEPS.map((step) => {
            const isTargetDisabled = disabledTabs?.has(step.targetTab) ?? false;
            return (
              <li
                key={step.number}
                className="rounded-2xl border p-4 sm:p-5"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-secondary) 42%, var(--color-background))",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 28%, transparent)",
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "var(--color-background)",
                        }}
                      >
                        {step.number}
                      </span>
                      <h3 className="text-sm font-semibold sm:text-base">
                        {step.title}
                      </h3>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed opacity-85">
                      {step.summary}
                    </p>

                    <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed opacity-80">
                      {step.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: "var(--color-accent)" }}
                          />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {onJumpToTab ? (
                    <button
                      type="button"
                      disabled={isTargetDisabled}
                      onClick={() => onJumpToTab(step.targetTab)}
                      title={
                        isTargetDisabled
                          ? "Section ini sedang nonaktif. Aktifkan dulu di tab Section."
                          : undefined
                      }
                      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-45"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                        color: "var(--color-text)",
                      }}
                    >
                      {isTargetDisabled ? "Section Nonaktif" : step.actionLabel}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        aria-labelledby="judul-panduan-faq"
        className="rounded-2xl border px-5 py-6 sm:px-6"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 35%, transparent)",
        }}
      >
        <div>
          <p
            className="text-xs font-semibold"
            style={{ color: "var(--color-accent)" }}
          >
            Tanya Jawab Kendala Umum
          </p>
          <h2
            id="judul-panduan-faq"
            className="font-heading mt-1 text-xl font-semibold sm:text-2xl"
          >
            Jawaban Cepat Sebelum Menghubungi Admin
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed opacity-75">
            Ketuk salah satu pertanyaan di bawah untuk melihat solusinya.
          </p>
        </div>

        <div className="mt-5 space-y-2.5">
          {CLIENT_GUIDE_FAQS.map((item) => {
            const isTargetDisabled = item.targetTab
              ? (disabledTabs?.has(item.targetTab) ?? false)
              : false;
            return (
              <details
                key={item.id}
                className="group rounded-2xl border px-4 py-1"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-secondary) 28%, var(--color-background))",
                  borderColor:
                    "color-mix(in srgb, var(--color-primary) 28%, transparent)",
                }}
              >
                <summary className="flex min-h-11 list-none items-center justify-between gap-3 py-2.5 text-left text-sm font-semibold">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-transform group-open:rotate-45"
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      color: "var(--color-accent)",
                    }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="border-t pt-3 pb-3.5 text-sm leading-relaxed opacity-85"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 18%, transparent)",
                  }}
                >
                  <p>{item.answer}</p>
                  {onJumpToTab && item.targetTab && item.actionLabel ? (
                    <button
                      type="button"
                      disabled={isTargetDisabled}
                      onClick={() => onJumpToTab(item.targetTab!)}
                      className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-xs font-semibold transition-colors hover:bg-[var(--color-secondary)] active:opacity-80 disabled:opacity-45"
                      style={{
                        backgroundColor: "var(--color-background)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                        color: "var(--color-text)",
                      }}
                    >
                      {isTargetDisabled ? "Section Nonaktif" : item.actionLabel}
                    </button>
                  ) : null}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="judul-panduan-bantuan"
        className="rounded-2xl border px-5 py-5 sm:px-6"
        style={{
          backgroundColor: "var(--color-secondary)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 30%, transparent)",
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="judul-panduan-bantuan"
              className="font-heading text-lg font-semibold"
            >
              Masih menemui kendala?
            </h2>
            <p className="mt-1 text-sm leading-relaxed opacity-80">
              Jika jawaban di atas belum menyelesaikan kendala Anda, kirim
              tangkapan layar kendalanya ke WhatsApp admin Framea.
            </p>
          </div>
          <a
            href={supportWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-background)",
            }}
          >
            Hubungi Bantuan WA
          </a>
        </div>
      </section>
    </div>
  );
}
