import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://nischalbhandari.com.np";

export const metadata: Metadata = {
  title: "Nischal Bhandari — Full Stack Developer & IT Professional",
  description:
    "Windows XP themed portfolio of Nischal Bhandari — Full Stack Developer & IT Professional with 3+ years of experience in JavaScript, Angular, Python, Node.js and more.",
  keywords: [
    "Nischal Bhandari",
    "Full Stack Developer",
    "IT Professional",
    "Portfolio",
    "JavaScript",
    "Angular",
    "React",
    "Node.js",
    "Python",
  ],
  authors: [{ name: "Nischal Bhandari" }],
  creator: "Nischal Bhandari",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Nischal Bhandari — Full Stack Developer & IT Professional",
    description:
      "Windows XP themed portfolio of Nischal Bhandari — Full Stack Developer & IT Professional.",
    siteName: "Nischal Bhandari Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nischal Bhandari — Full Stack Developer",
    description:
      "Windows XP themed portfolio of Nischal Bhandari — Full Stack Developer & IT Professional.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nischal Bhandari",
  jobTitle: "Full Stack Developer & IT Professional",
  url: siteUrl,
  sameAs: [
    "https://github.com/Nischal00",
    "https://www.linkedin.com/in/nischal-bhandari-708b712a3/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-black overflow-hidden touch-none">
        {children}
      </body>
    </html>
  );
}
