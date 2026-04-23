import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment dark:bg-parchment-dark flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <p className="text-gold text-xs tracking-[8px] ornament mx-auto"></p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-ink dark:text-ink-dark">
            Prayer Bank
          </h1>
          <div className="space-y-2">
            <p className="font-serif italic text-2xl text-gold dark:text-gold/80">
              "What is sweeter than telling 'I Love you'?"
            </p>
            <p className="font-serif text-xl text-gray-500 dark:text-gray-400">
              I prayed for you.
            </p>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mx-auto">
          A global treasury of faith and hope.
          Deposit your prayers for others. Withdraw prayers when you need them. 
          Gift prayers to your loved ones. Join a worldwide community of believers 
          sharing spiritual wealth.
        </p>

        <div className="pt-8">
          <Link 
            href="/auth" 
            className="btn-gold inline-flex items-center justify-center font-serif text-lg py-4 px-8 rounded-xl hover:scale-105 transition-transform"
          >
            ✦ Enter the Sanctuary ✦
          </Link>
        </div>
      </div>
    </div>
  )
}
