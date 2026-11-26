import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#3B2820",
        }}
      >
        <svg
          width="180"
          height="180"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="0" width="64" height="64" fill="#3B2820" />
          <rect
            x="5"
            y="5"
            width="54"
            height="54"
            rx="12"
            fill="none"
            stroke="#FAF7F2"
            strokeOpacity="0.22"
            strokeWidth="1.25"
          />
          <path
            d="M32 10.5L33.5 14L37 15.5L33.5 17L32 20.5L30.5 17L27 15.5L30.5 14Z"
            fill="#E6C98E"
          />
          <circle
            cx="25"
            cy="35"
            r="13.5"
            fill="none"
            stroke="#FAF7F2"
            strokeWidth="3.8"
          />
          <circle
            cx="39"
            cy="35"
            r="13.5"
            fill="none"
            stroke="#E6C98E"
            strokeWidth="3.8"
          />
          <path
            d="M26.88 21.63A13.5 13.5 0 0 1 36.19 27.45"
            fill="none"
            stroke="#3B2820"
            strokeWidth="6.8"
            strokeLinecap="butt"
          />
          <path
            d="M26.88 21.63A13.5 13.5 0 0 1 36.19 27.45"
            fill="none"
            stroke="#FAF7F2"
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          <path
            d="M37.12 48.37A13.5 13.5 0 0 1 27.81 42.55"
            fill="none"
            stroke="#3B2820"
            strokeWidth="6.8"
            strokeLinecap="butt"
          />
          <path
            d="M37.12 48.37A13.5 13.5 0 0 1 27.81 42.55"
            fill="none"
            stroke="#E6C98E"
            strokeWidth="3.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
