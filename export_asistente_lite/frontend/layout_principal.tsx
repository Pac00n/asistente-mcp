import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Asume que globals.css estará en la misma carpeta o se ajustará la ruta

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Asistente MCP',
  description: 'Asistente con integración MCP y OpenAI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
