import type React from "react"
import type { Metadata } from "next"
import { Varela_Round } from "next/font/google"
import "./globals.css"

const varela = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Infinite Guesser",
  description: "Guess as many things as you can!",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={varela.className}>{children}</body>
    </html>
  )
}
