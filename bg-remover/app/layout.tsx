import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Background Remover - 一键去除图片背景',
  description: '免费在线去除图片背景，支持 PNG、JPG、WebP 格式，快速安全',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
