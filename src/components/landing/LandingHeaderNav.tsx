"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function LandingHeaderNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className="border-b"
      style={{
        borderColor:
          "color-mix(in srgb, var(--color-primary) 16%, transparent)",
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
        <Link
          href="/"
          className="font-heading inline-flex min-h-11 items-center gap-2 text-lg leading-tight font-semibold tracking-tight transition-opacity hover:opacity-75 sm:text-xl"
        >
          <span>Framea</span>
          <span className="hidden text-xs font-normal opacity-75 sm:inline">
            Wedding Invitation
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 md:flex"
        >
          <a
            href="#fitur"
            className="inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)]"
          >
            Fitur
          </a>
          <a
            href="#cara-pesan"
            className="inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)]"
          >
            Harga &amp; Cara Pesan
          </a>
          <Link
            href="/contoh"
            className="inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-semibold transition-colors hover:bg-[var(--color-secondary)]"
            style={{ color: "var(--color-accent)" }}
          >
            Contoh Undangan
          </Link>
          <Link
            href="/login"
            className="ml-1 inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 34%, transparent)",
              color: "var(--color-text)",
            }}
          >
            Masuk Pemilik
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[var(--color-secondary)] active:opacity-80"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 34%, transparent)",
              color: "var(--color-text)",
            }}
          >
            {isMenuOpen ? "Tutup" : "Menu"}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <nav
          id="landing-mobile-menu"
          aria-label="Navigasi ponsel"
          className="border-t px-5 py-3 md:hidden"
          style={{
            backgroundColor: "var(--color-secondary)",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 16%, transparent)",
          }}
        >
          <div className="flex flex-col gap-1.5">
            <a
              href="#fitur"
              onClick={closeMenu}
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors hover:bg-[var(--color-background)]"
            >
              Fitur Undangan
            </a>
            <a
              href="#cara-pesan"
              onClick={closeMenu}
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors hover:bg-[var(--color-background)]"
            >
              Harga &amp; Cara Pesan
            </a>
            <Link
              href="/contoh"
              onClick={closeMenu}
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition-colors hover:bg-[var(--color-background)]"
              style={{ color: "var(--color-accent)" }}
            >
              Lihat Contoh Undangan
            </Link>
            <Link
              href="/login"
              onClick={closeMenu}
              className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--color-background)",
                borderColor:
                  "color-mix(in srgb, var(--color-primary) 34%, transparent)",
                color: "var(--color-text)",
              }}
            >
              Masuk Pemilik Undangan
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
