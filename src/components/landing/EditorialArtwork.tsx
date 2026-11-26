interface ArtworkProps {
  className?: string;
}

export function BotanicalSprig({ className = "" }: ArtworkProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 180 44"
      fill="none"
      className={className}
    >
      <path
        d="M8 24C44 22 92 20 172 22"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M36 22C30 13 36 7 47 9C48 16 43 21 36 22Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M58 21C54 31 62 37 72 34C71 27 65 22 58 21Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M84 21C79 11 87 5 98 8C98 15 92 20 84 21Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M110 21C106 31 114 37 125 33C124 26 118 22 110 21Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M136 21C132 13 140 8 150 11C149 17 143 21 136 21Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="163" cy="17" r="2" fill="currentColor" opacity="0.8" />
      <circle cx="154" cy="28" r="1.8" fill="currentColor" opacity="0.65" />
      <circle cx="22" cy="18" r="1.6" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function BotanicalCorner({ className = "" }: ArtworkProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 110 110"
      fill="none"
      className={className}
    >
      <path
        d="M12 96C18 60 40 30 94 14"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M28 66C14 58 13 44 25 37C35 44 37 56 28 66Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M48 43C38 30 44 18 57 18C62 29 57 38 48 43Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M39 54C52 52 60 58 58 69C47 69 40 62 39 54Z"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />
      <path
        d="M66 28C76 26 83 31 82 40C73 40 67 35 66 28Z"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />
      <circle cx="84" cy="19" r="2.1" fill="currentColor" opacity="0.8" />
      <circle cx="21" cy="81" r="1.9" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function EnvelopeSealIllustration({ className = "" }: ArtworkProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 220 156"
      fill="none"
      className={className}
    >
      <rect
        x="40"
        y="16"
        width="140"
        height="72"
        rx="6"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.65"
      />
      <path
        d="M78 36H142"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M90 48H130"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      <rect
        x="24"
        y="46"
        width="172"
        height="94"
        rx="10"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <path
        d="M27 50L110 100L193 50"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M28 136L82 96"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M192 136L138 96"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle
        cx="110"
        cy="98"
        r="14"
        stroke="currentColor"
        strokeWidth="1.25"
        fill="var(--color-primary)"
      />
      <circle
        cx="110"
        cy="98"
        r="10"
        stroke="currentColor"
        strokeWidth="0.85"
        opacity="0.6"
      />
      <path
        d="M110 104C110 98 112 94 115 92M110 99C107 97 106 94 108 92C111 93 111 96 110 99Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M158 144C174 134 188 118 206 96"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M180 124C178 114 184 107 192 109C191 117 187 122 180 124Z"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />
      <path
        d="M192 114C201 114 207 119 205 127C197 126 192 121 192 114Z"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />
      <circle cx="204" cy="99" r="1.8" fill="currentColor" opacity="0.8" />
    </svg>
  );
}
