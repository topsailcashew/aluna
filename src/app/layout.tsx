
import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { WellnessLogProvider } from '@/context/wellness-log-provider';

export const metadata: Metadata = {
  title: 'Mindful Charts',
  description: 'A wellness check-in app to chart your feelings over time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <WellnessLogProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </WellnessLogProvider>
      </body>
    </html>
  );
}
