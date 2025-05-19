'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes'; // Asegurarse de que next-themes esté en package.json

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
