export const metadata = {
  title: 'NIT JSR Hub - Your goto website for NIT Jamshedpur',
  description: 'Your goto website for NIT Jamshedpur - Exclusive social platform for NIT Jamshedpur students',
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
