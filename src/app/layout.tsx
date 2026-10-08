import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Variable width axis lets headings use the condensed cut of the same family.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Knights Hack Club | Niagara College",
  description:
    "Knights Hack Club is an NCSAC student club at Niagara College for anyone curious about coding — beginners welcome. Workshops, vibe coding, project showcases and a mini hackathon.",
  openGraph: {
    title: "Knights Hack Club | Niagara College",
    description:
      "Your coding crew on campus. Build, learn and ship projects with fellow Niagara College students.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Lets Next.js jump (not glide) to the top on page changes; anchor links still scroll smoothly.
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${jetbrainsMono.variable} h-full scroll-smooth antialiased motion-reduce:scroll-auto`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
