import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/header';
import { BackToTop } from '@/components/back-to-top';
import { PWAInstaller } from '@/components/pwa-installer';
import { SupportButton } from '@/components/support-button';
import { Toaster } from 'react-hot-toast';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Ankita Sharma | Services',
  description: 'Premium services and content from Ankita Sharma',
  metadataBase: new URL('https://ankita-sharma.vercel.app'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ankita Sharma'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.className}>
      <body className="min-h-screen">
        <Providers>
          <PWAInstaller />
          <div className="relative min-h-screen">
            <Header />
            {children}
            <BackToTop />
            <SupportButton />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(11, 11, 29, 0.95)',
                color: '#fff',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: {
                  primary: '#a855f7',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
