import { ImageResponse } from "next/og";
import { PACKAGE_PRICING } from "@/lib/marketing";

export const alt =
  "Framea Wedding Invitation - Undangan Pernikahan Digital";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#FAF7F2",
          color: "#261A15",
          padding: "56px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "2px solid rgba(59, 40, 32, 0.28)",
            borderRadius: "28px",
            padding: "48px 56px",
            backgroundColor: "#FAF7F2",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  backgroundColor: "#3B2820",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="42"
                  height="42"
                  viewBox="0 0 64 64"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="25"
                    cy="34"
                    r="13"
                    fill="none"
                    stroke="#FAF7F2"
                    strokeWidth="4"
                  />
                  <circle
                    cx="39"
                    cy="34"
                    r="13"
                    fill="none"
                    stroke="#E6C98E"
                    strokeWidth="4"
                  />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#261A15",
                  }}
                >
                  Framea Wedding Invitation
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    color: "#7A4E2D",
                    fontFamily: "sans-serif",
                  }}
                >
                  frameainvitation.my.id
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#EFE9DF",
                border: "1px solid rgba(59, 40, 32, 0.25)",
                borderRadius: "14px",
                padding: "12px 22px",
                fontFamily: "sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "#3B2820",
              }}
            >
              Promo {PACKAGE_PRICING.promoFormatted}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxWidth: "880px",
            }}
          >
            <div
              style={{
                fontSize: "54px",
                lineHeight: 1.12,
                fontWeight: 700,
                color: "#261A15",
              }}
            >
              Undangan pernikahan digital yang rapi dibuka dari WhatsApp.
            </div>
            <div
              style={{
                fontSize: "24px",
                lineHeight: 1.45,
                color: "#52433C",
                fontFamily: "sans-serif",
              }}
            >
              Tautan nama tamu personal, 5 preset tema, rangkaian acara dengan
              Google Maps, RSVP, ucapan, dan panel edit mandiri.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(59, 40, 32, 0.18)",
              paddingTop: "22px",
              fontFamily: "sans-serif",
              fontSize: "20px",
              color: "#52433C",
            }}
          >
            <span>Lihat contoh langsung di /contoh</span>
            <span style={{ color: "#7A4E2D", fontWeight: 600 }}>
              Normal {PACKAGE_PRICING.originalFormatted}, hemat{" "}
              {PACKAGE_PRICING.savingsFormatted}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
