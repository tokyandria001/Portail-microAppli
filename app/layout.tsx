import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portail MicroApps",
  description: "Interface inspirée de Spotify Backstage",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
