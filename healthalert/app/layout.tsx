import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HealthAlert — Emergency Health Response System',
  description: 'Nearest hospital ko instant alert bhejo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  )
}
