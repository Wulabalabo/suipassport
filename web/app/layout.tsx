import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { MainNav } from '@/components/MainNav'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sui Passport',
  description: 'Sui Passport',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <MainNav />
          {children}
          <footer className="w-full bg-white">
            <div className="px-6 md:px-12 lg:px-24 py-6 lg:py-10 flex justify-center lg:justify-end items-center">
              <p className="text-gray-500 text-sm font-medium leading-loose tracking-tight lg:text-base text-center">
                @2024 Sui Passport
              </p>
            </div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
