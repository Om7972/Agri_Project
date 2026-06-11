import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MandiPrime | Premium Agri Commodity Exchange & Marketplace',
  description: 'Trade agriculture like a global commodity market. Connect farmers, wholesale distributors, and exporters through secure escrow smart contracts and logistics validation.',
  keywords: [
    'agriculture marketplace',
    'agri trading platform',
    'commodity exchange',
    'crop prices',
    'smart escrow agriculture',
    'Dubai agricultural exports',
    'India mandi prices',
    'direct crop sourcing',
  ],
  authors: [{ name: 'MandiPrime Team' }],
  creator: 'MandiPrime Exchange Group',
  metadataBase: new URL('https://mandiprime.com'),
  openGraph: {
    title: 'MandiPrime | Premium Agri Commodity Exchange',
    description: 'Trade physical agriculture commodities with instant settlement, transparency, and verified logistics.',
    url: 'https://mandiprime.com',
    siteName: 'MandiPrime',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MandiPrime | Premium Agri Commodity Exchange',
    description: 'Trade physical agriculture commodities with instant settlement, transparency, and verified logistics.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="bg-[#020617] text-slate-100 min-h-screen antialiased flex flex-col font-sans selection:bg-teal-500/35 selection:text-white">
        {children}
      </body>
    </html>
  );
}
