import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MAGS AI Studio',
  description: 'AI SaaS platform like Cursor / Claude / OpenAI assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
