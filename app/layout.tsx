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
  title: "Gissallt",
  description: "Guess as many things as you can!",
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
