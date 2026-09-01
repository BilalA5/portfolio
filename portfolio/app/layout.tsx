import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bilal5.me"),
  title: "Bilal Ahmed — ML/AI, Software Engineering & Design",
  description:
    "Portfolio of Bilal Ahmed covering ML/AI, software engineering, and thoughtful interface design.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bilal Ahmed — ML/AI, Software Engineering & Design",
    description:
      "Portfolio of Bilal Ahmed covering ML/AI, software engineering, and thoughtful interface design.",
    url: "/",
    siteName: "Bilal Ahmed Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Bilal Ahmed — ML/AI, Software Engineering & Design",
    description:
      "Portfolio of Bilal Ahmed covering ML/AI, software engineering, and thoughtful interface design.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
