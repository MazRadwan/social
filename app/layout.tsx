import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Social-Listening',
  description: 'Created by Beam WIL Gigachads',
  generator: 'Maz Radwan',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
