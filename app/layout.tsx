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
  keywords: ['Prayer Bank', 'global prayer network', 'share grace', 'catholic prayer chain', 'perpetual adoration', 'online prayer requests'],
  openGraph: {
    title: 'Prayer Bank — A Treasury of Faith',
    description: 'Deposit prayers and share them with people all over the world. Withdraw prayers gifted by the global community.',
    url: 'https://prayerbank.vercel.app',
    siteName: 'Prayer Bank',
    images: [
      {
        url: 'https://image.pollinations.ai/prompt/Sacred%20golden%20treasury%20of%20heavenly%20light%20and%20grace%20ethereal%20glow%20masterpiece?width=1200&height=630&seed=123',
        width: 1200,
        height: 630,
        alt: 'Prayer Bank - A Treasury of Faith',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prayer Bank — A Treasury of Faith',
    description: 'Deposit prayers and share them with people all over the world. Withdraw prayers gifted by the global community.',
    images: ['https://image.pollinations.ai/prompt/Sacred%20golden%20treasury%20of%20heavenly%20light%20and%20grace%20ethereal%20glow%20masterpiece?width=1200&height=630&seed=123'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${lato.variable}`}>
      <body className="min-h-screen bg-parchment dark:bg-parchment-dark text-ink dark:text-ink-dark transition-colors duration-300 font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
