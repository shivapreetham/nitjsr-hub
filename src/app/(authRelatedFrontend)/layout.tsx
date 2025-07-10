export const metadata = {
  title: 'NIT JSR Hub',
  description: 'Your goto website for NIT JSR',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div>
        {children}
      </div>
  )
}
