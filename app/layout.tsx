import type { Metadata } from "next";
import { Oswald, Manrope } from "next/font/google"; // The "Cinema" fonts
import { Toaster } from "sonner";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PCA Cinemax | Immersive Experience",
  description: "Defining the gold standard of cinematic entertainment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${oswald.variable} ${manrope.variable} font-sans antialiased bg-[#020202] text-white selection:bg-[#e50914] selection:text-white`}
      >
        {children}
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  );
}
