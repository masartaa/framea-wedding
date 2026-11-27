import Link from "next/link";
import { buildWhatsAppOrderUrl, CONTACT_INFO } from "@/lib/marketing";

export function SiteFooter() {
  const whatsappUrl = buildWhatsAppOrderUrl(
    "Halo Framea, saya ingin menanyakan informasi layanan undangan pernikahan digital."
  );

  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: "var(--color-secondary)",
        borderColor:
          "color-mix(in srgb, var(--color-primary) 18%, transparent)",
        color: "var(--color-text)",
      }}
    >
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link
              href="/"
              className="font-heading inline-flex min-h-11 items-center text-lg font-semibold tracking-tight transition-opacity hover:opacity-75"
            >
              {CONTACT_INFO.brandName}
            </Link>
            <p className="mt-2 max-w-md text-sm leading-relaxed opacity-80">
              Layanan undangan pernikahan digital bergaya kartu cetak yang
              ringan dibuka dari WhatsApp, lengkap dengan panel pengelolaan
              mandiri untuk setiap pasangan.
            </p>

            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex flex-wrap items-center gap-x-2">
                <dt className="text-xs font-semibold opacity-75">Email:</dt>
                <dd>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {CONTACT_INFO.email}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap items-center gap-x-2">
                <dt className="text-xs font-semibold opacity-75">WhatsApp:</dt>
                <dd>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {CONTACT_INFO.whatsappDisplay}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 pt-1 text-xs opacity-75">
                <dt className="font-semibold">Wilayah Layanan:</dt>
                <dd>{CONTACT_INFO.country}</dd>
              </div>
            </dl>
          </div>

          <div className="md:col-span-3">
            <h2
              className="text-xs font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              Layanan
            </h2>
            <ul className="mt-2.5 space-y-0.5 text-sm">
              <li>
                <Link
                  href="/contoh"
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Contoh Undangan
                </Link>
              </li>
              <li>
                <Link
                  href="/panduan"
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Panduan Pemilik
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Masuk Pemilik
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2
              className="text-xs font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              Kebijakan &amp; Ketentuan
            </h2>
            <ul className="mt-2.5 space-y-0.5 text-sm">
              <li>
                <Link
                  href="/syarat-ketentuan"
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Syarat &amp; Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="/privasi"
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/pengembalian-dana"
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  Pengembalian Dana
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-5 text-xs opacity-75"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-primary) 18%, transparent)",
          }}
        >
          <span>
            Hak Cipta &copy; 2026 {CONTACT_INFO.brandName}. Seluruh hak
            dilindungi.
          </span>
          <span>Tautan undangan klien bersifat privat</span>
        </div>
      </div>
    </footer>
  );
}
