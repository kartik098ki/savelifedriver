import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import { DriverProvider } from '@/context/DriverContext';

export const metadata: Metadata = {
  title: 'SAVIFE Driver — Emergency Ambulance Dispatch',
  description:
    'Real-time production driver application for SAVIFE emergency ambulance operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <DriverProvider>
          <Header />
          {children}
        </DriverProvider>
      </body>
    </html>
  );
}

