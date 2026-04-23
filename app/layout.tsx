import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Prayer Bank — A Treasury of Faith',
  description: 'Deposit prayers and share them with people all over the world. Withdraw prayers gifted by the global community.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-parchment dark:bg-parchment-dark text-ink dark:text-ink-dark transition-colors duration-300">
        {children}
      </body>
    </html>
  )
}
