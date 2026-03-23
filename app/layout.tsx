import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from './ThemeRegistry';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { CategoriesProvider } from '@/lib/contexts/CategoriesContext';
import { PreferencesProvider } from '@/lib/contexts/PreferencesContext';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'FinApp',
    template: 'FinApp - %s',
  },
  description: "Gerencie suas finanças pessoais com facilidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppRouterCacheProvider options={{ key: 'css' }}>
          <AuthProvider>
            <CategoriesProvider>
              <PreferencesProvider>
                <ThemeRegistry>
                  {children}
                </ThemeRegistry>
              </PreferencesProvider>
            </CategoriesProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
