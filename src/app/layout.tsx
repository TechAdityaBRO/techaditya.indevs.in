import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aditya Kumar Sethi — Developer & Founder',
  description: 'Portfolio and interactive OSINT workbench of Aditya Kumar Sethi — Founder of BRO GANG and creator of PGlove, Bro Gang AI CLI, and Nexa Search.',
  openGraph: {
    title: 'Aditya Kumar Sethi — Developer & Founder',
    description: 'Portfolio and interactive OSINT workbench of Aditya Kumar Sethi — Founder of BRO GANG and creator of PGlove, Bro Gang AI CLI, and Nexa Search.',
    type: 'website',
    images: ['/src/assets/images/hero_developer_workspace_1794909230550.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aditya Kumar Sethi — Developer & Founder',
    description: 'Portfolio and interactive OSINT workbench of Aditya Kumar Sethi — Founder of BRO GANG and creator of PGlove, Bro Gang AI CLI, and Nexa Search.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#060608] text-[#F4F4F6] antialiased selection:bg-[#2563EB]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
