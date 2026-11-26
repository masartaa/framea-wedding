import Image from "next/image";
import type { SiteConfig } from "@/lib/config-schema";
import { Ornament } from "./Ornament";
import { Reveal } from "./Reveal";

interface StorySectionProps {
  story: SiteConfig["story"];
  ornaments: boolean;
}

export function StorySection({ story, ornaments }: StorySectionProps) {
  const title = story?.title?.trim() || "Kisah Kami";
  const introText = story?.introText?.trim() || "";
  const items = Array.isArray(story?.items) ? story.items : [];

  return (
    <section
      id="kisah"
      aria-labelledby="judul-kisah"
      className="px-5 py-14 text-center"
    >
      <Reveal>
        <p
          className="text-xs font-medium tracking-wider"
          style={{ color: "var(--color-accent)" }}
        >
          Our Story
        </p>
        <h2
          id="judul-kisah"
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

        {items.length === 0 ? (
          <div
            className="mt-6 rounded-2xl border border-dashed px-6 py-8 text-sm opacity-75"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-secondary) 55%, var(--color-background))",
              borderColor:
                "color-mix(in srgb, var(--color-primary) 45%, transparent)",
            }}
          >
            Runtutan kisah mempelai belum diisi.
          </div>
        ) : (
          <ol className="relative mt-8 space-y-5 text-left">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-4 bottom-4 left-3.5 w-px"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-primary) 40%, transparent)",
              }}
            />

            {items.map((item, index) => (
              <li key={item.id} className="relative pl-10">
                <span
                  aria-hidden="true"
                  className="absolute top-5 left-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor: "var(--color-primary)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  />
                </span>

                <article
                  className="overflow-hidden rounded-2xl border"
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? "color-mix(in srgb, var(--color-secondary) 55%, var(--color-background))"
                        : "var(--color-background)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 35%, transparent)",
                  }}
                >
                  {item.photoUrl?.trim() ? (
                    <div
                      className="relative aspect-[4/3] w-full overflow-hidden border-b"
                      style={{
                        backgroundColor: "var(--color-secondary)",
                        borderColor:
                          "color-mix(in srgb, var(--color-primary) 25%, transparent)",
                      }}
                    >
                      <Image
                        src={item.photoUrl}
                        alt={item.title || `Foto kisah ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 82vw, 400px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="px-5 py-4">
                    <span
                      className="inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: "var(--color-secondary)",
                        color: "var(--color-accent)",
                      }}
                    >
                      {item.period}
                    </span>

                    <h3 className="font-heading mt-2 text-lg font-semibold leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed opacity-85">
                      {item.description}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </Reveal>
    </section>
  );
}
