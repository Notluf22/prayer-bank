import type { Metadata } from 'next'
import '../styles/globals.css'
import { LanguageProvider } from '@/lib/LanguageContext'
import { Cormorant_Garamond, Lato } from 'next/font/google'

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Prayer Bank — A Treasury of Faith',
  description: 'Deposit prayers and share them with people all over the world. Withdraw prayers gifted by the global community.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lato.variable} dark`}>
      <body className="min-h-screen bg-parchment dark:bg-parchment-dark text-ink dark:text-ink-dark transition-colors duration-300 font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
