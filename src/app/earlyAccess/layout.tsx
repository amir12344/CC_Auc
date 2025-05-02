export const metadata = {
  title: 'Early Access - Commerce Central',
  description: 'Get early access to Commerce Central - the premier surplus inventory marketplace.',
}

export default function EarlyAccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="early-access-layout">
      {children}
    </div>
  )
}
