import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ecoa — sua voz, sem rosto";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#14161A",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="96" height="96" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#1B1E24" />
            <circle cx="24" cy="32" r="6" fill="#7C9CC9" />
            <path
              d="M36 21a19 19 0 0 1 0 22"
              stroke="#7C9CC9"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M45 14a30 30 0 0 1 0 36"
              stroke="#7C9CC9"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
          <div style={{ fontSize: 140, color: "#E8E6E3", display: "flex" }}>
            ecoa
          </div>
        </div>
        <div style={{ fontSize: 42, color: "#7C9CC9", display: "flex" }}>
          sua voz, sem rosto
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#9A9EA6",
            display: "flex",
            marginTop: 16,
          }}
        >
          Escreva o que você sente. Anônimo, só texto, sem fama.
        </div>
      </div>
    ),
    size
  );
}
