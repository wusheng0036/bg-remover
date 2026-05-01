import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Background Remover - Remove Image Backgrounds Instantly',
  description: 'Remove image backgrounds in seconds with AI. Free online tool supporting PNG, JPG, WebP. No Photoshop needed, 4K HD output.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

