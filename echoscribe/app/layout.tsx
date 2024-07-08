import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>"Free Podcast Transcription"</title>
        <meta name="description" content="Easily transcribe your podcast episodes for free. No hidden fees or costs." />
      </head>
      <body>
        <h1 className="text-4xl font-bold mb-4">Podcast Transcription</h1>
        <h2 className="text-3xl font-semibold mb-4">Transcribe Your Podcast, For Free</h2>
        <p className="text-lg mb-4">Introducing the ultimate free and safe solution for transcribing your podcast episodes! It runs completely on your local device, ensuring the highest level of privacy and security.</p>
        {children}
      </body>
    </html>
  );
}