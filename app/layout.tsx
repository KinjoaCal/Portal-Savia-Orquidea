import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Condominio Savia Orquidea | Portal Vecinal',
  description: 'Portal oficial del condominio Residencial Savia Orquidea. Consulta el estado financiero, obras en proceso y conoce a tu mesa directiva.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/Savia Logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/Savia Logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/Savia Logo.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/Savia Logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
