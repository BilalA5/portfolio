import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";
export const socialImageAlt = "Bilal Ahmed — ML/AI | SWE & Design";

export async function renderSocialImage() {
  const heroData = `data:image/png;base64,${(await readFile(
    join(process.cwd(), "public/hero.png"),
  )).toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <img
        alt={socialImageAlt}
        height={socialImageSize.height}
        src={heroData}
        style={{ height: "100%", objectFit: "contain", width: "100%" }}
        width={socialImageSize.width}
      />
    </div>,
    socialImageSize,
  );
}
