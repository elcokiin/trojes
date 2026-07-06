import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from '@/components/providers/session-provider'
import { PwaRegister } from '@/components/providers/pwa-register'
import { HotkeysRootProvider } from '@/components/providers/hotkeys-root-provider'
import { DevtoolsClient } from '@/components/providers/devtools-client'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: 'Trojes - Capture Ideas Anywhere',
  description: 'A personal idea management system for frictionless capture and thoughtful review.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: '/favicon.ico?v=trojes',
        sizes: 'any',
      },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.ico?v=trojes',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#6f5be8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <HotkeysRootProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
              <DevtoolsClient />
            </HotkeysRootProvider>
          </ThemeProvider>
        </SessionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <PwaRegister />
      </body>
    </html>
  )
}
