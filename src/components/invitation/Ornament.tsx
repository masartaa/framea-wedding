interface OrnamentProps {
  enabled: boolean;
  className?: string;
}

export function Ornament({ enabled, className = "" }: OrnamentProps) {
  if (!enabled) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-3 ${className}`}
      style={{ color: "var(--color-primary)" }}
    >
      <span
        className="h-px w-12 opacity-60"
        style={{ backgroundColor: "var(--color-primary)" }}
      />
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0 opacity-85"
      >
        <path
          d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      </svg>
      <span
        className="h-px w-12 opacity-60"
        style={{ backgroundColor: "var(--color-primary)" }}
      />
    </div>
  );
}
