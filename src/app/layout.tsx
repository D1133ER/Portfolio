import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nischal Bhandari — Portfolio",
  description: "Windows XP themed portfolio of Nischal Bhandari — IT Professional & Full Stack Developer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black overflow-hidden">
        {children}
      </body>
    </html>
  );
}
