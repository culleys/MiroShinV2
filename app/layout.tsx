import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { BookOpen, Settings } from 'lucide-react';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Miroshin Web Komik',
  description: 'Mobile-friendly web comic platform',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen flex flex-col`} suppressHydrationWarning>
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-emerald-500">
              <BookOpen className="w-6 h-6" />
              <span>Miroshin</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/admin" className="text-zinc-400 hover:text-zinc-50 transition-colors flex items-center gap-1 text-sm font-medium">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-zinc-800 py-8 mt-12 bg-zinc-950">
          <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Miroshin Web Komik. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
