import './globals.css';

export const metadata = {
  title: 'Persona Garden',
  description: '映照內心的植物園',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}