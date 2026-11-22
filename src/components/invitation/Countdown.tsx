"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetTimestamp: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeLeft(targetTimestamp: number, now: number): TimeLeft {
  const diff = targetTimestamp - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isPast: false };
}

function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}

export function Countdown({ targetTimestamp }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => {
      setTimeLeft(calculateTimeLeft(targetTimestamp, Date.now()));
    };

    const initialTimer = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 1000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [targetTimestamp]);

  if (timeLeft?.isPast) {
    return (
      <div
        className="mt-6 rounded-2xl border px-4 py-3 text-center text-sm font-medium"
        style={{
          backgroundColor: "var(--color-secondary)",
          borderColor:
            "color-mix(in srgb, var(--color-primary) 45%, transparent)",
          color: "var(--color-accent)",
        }}
      >
        Hari bahagia telah tiba
      </div>
    );
  }

  const items = [
    { label: "Hari", value: timeLeft ? String(timeLeft.days) : "--" },
    { label: "Jam", value: timeLeft ? padTwo(timeLeft.hours) : "--" },
    { label: "Menit", value: timeLeft ? padTwo(timeLeft.minutes) : "--" },
    { label: "Detik", value: timeLeft ? padTwo(timeLeft.seconds) : "--" },
  ];

  return (
    <div
      aria-label="Hitung mundur menuju acara"
      className="mt-6 grid grid-cols-4 gap-2.5"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border px-2 py-3 text-center"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-secondary) 80%, var(--color-background))",
            borderColor:
              "color-mix(in srgb, var(--color-primary) 40%, transparent)",
          }}
        >
          <p
            className="font-heading text-xl font-semibold tabular-nums sm:text-2xl"
            style={{ color: "var(--color-accent)" }}
          >
            {item.value}
          </p>
          <p className="mt-0.5 text-[11px] tracking-wide uppercase opacity-75">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
