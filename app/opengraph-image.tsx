import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const alt = "IHP - Image Hosting Protocol"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

// Image generation
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 128,
        background: "#000",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <img src="https://img.intercomm.in/v6q4or.png" width={300} height={300} style={{ marginBottom: 40 }} />
      <div style={{ fontSize: 80, fontWeight: "bold" }}>IHP</div>
      <div style={{ fontSize: 40, marginTop: 20 }}>Image Hosting Protocol</div>
    </div>,
    {
      ...size,
    },
  )
}
