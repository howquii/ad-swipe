import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ad Swipe — Meta Ad Intelligence',
  description: 'Discover and analyze top performing Meta ads',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
