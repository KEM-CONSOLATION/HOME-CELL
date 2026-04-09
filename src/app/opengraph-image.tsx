import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          padding: 64,
          borderRadius: 32,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0b6fb3",
            color: "#ffffff",
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: -2,
          }}
        >
          SM
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#0b6fb3" }}>
            HOME-CELL
          </div>
          <div style={{ fontSize: 26, color: "rgba(0,0,0,0.65)" }}>
            Attendance & Communication Management
          </div>
          <div style={{ fontSize: 22, color: "rgba(0,0,0,0.55)" }}>
            Salvation Ministries
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
