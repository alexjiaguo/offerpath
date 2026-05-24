import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "OfferPath — From Search to Signed Offer",
  description:
    "The end-to-end job hunting platform. Discover roles, track your pipeline, build tailored resumes, and ace interviews — all in one place.",
  keywords: [
    "job search",
    "resume builder",
    "interview prep",
    "job tracker",
    "career tools",
    "AI resume",
    "job application tracker",
  ],
  authors: [{ name: "OfferPath" }],
  openGraph: {
    title: "OfferPath — From Search to Signed Offer",
    description:
      "The end-to-end job hunting platform. Discover roles, track your pipeline, build tailored resumes, and ace interviews.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head />
      <body className={`${outfit.variable} ${plusJakarta.variable} font-sans antialiased bg-surface-50 text-surface-400`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "white",
              color: "#383d3b",
              border: "1px solid #eee5e9",
            },
          }}
        />
      </body>
    </html>
  );
}
