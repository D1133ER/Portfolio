import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nischal Bhandari — Portfolio",
  description: "Windows XP themed portfolio of Nischal Bhandari — IT Professional & Full Stack Developer",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black overflow-hidden touch-none">
        {children}
      </body>
    </html>
  );
}
