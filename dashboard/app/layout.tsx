import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'YVON — Master Control Plane',
  description: 'Multi-tenant agent fleet dashboard for YVON Engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Sidebar />
        <main className="ml-56 min-h-screen p-8 max-w-[1200px]">
          {children}
        </main>
      </body>
    </html>
  );
}
