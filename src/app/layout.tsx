import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${jetbrainsMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
