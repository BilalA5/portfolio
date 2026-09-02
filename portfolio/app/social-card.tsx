import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";
export const socialImageAlt = "Bilal Ahmed — ML/AI | SWE & Design";

const socialStarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="star-gradient" x1="32" y1="30" x2="164" y2="182" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0E6FFF"/><stop offset="0.5" stop-color="#FFD749"/><stop offset="1" stop-color="#F2371F"/></linearGradient></defs><path fill="url(#star-gradient)" d="M15.535 188.281c40.654-30.669 60.98-46.003 84.465-46.003 23.485 0 43.812 15.334 84.466 46.003L200 200l-11.719-15.534c-30.669-40.654-46.003-60.981-46.003-84.466 0-23.484 15.334-43.811 46.003-84.465L200 0l-15.534 11.72C143.812 42.388 123.485 57.722 100 57.722c-23.484 0-43.811-15.334-84.465-46.003L0 0l11.72 15.535C42.387 56.19 57.721 76.515 57.721 100c0 23.485-15.334 43.812-46.002 84.465L0 200l15.535-11.719z"/></svg>`;

export async function renderSocialImage() {
  const starData = `data:image/svg+xml;base64,${Buffer.from(socialStarSvg).toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        backgroundColor: "#090909",
        boxSizing: "border-box",
        color: "#f2f2f2",
        display: "flex",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px 84px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 400,
            letterSpacing: "-3px",
            lineHeight: 1,
          }}
        >
          Bilal Ahmed
        </div>
        <div
          style={{
            color: "#909090",
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}
        >
          ML/AI | SWE &amp; Design
        </div>
      </div>
      <img alt="" height={236} src={starData} width={236} />
    </div>,
    socialImageSize,
  );
}
