import Navbar from '@/components/Navbar'

interface ToolLayoutProps {
  code: string
  title: string
  subtitle: string
  children: React.ReactNode
}

export default function ToolLayout({ code, title, subtitle, children }: ToolLayoutProps) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--page)' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 680, margin: '0 auto', padding: '0 24px', width: '100%' }}>
        <div className="anim-fade-up" style={{ padding: '40px 0 28px', borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
          <p className="mono" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 8 }}>
            {code}
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 6 }}>
            {title}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{subtitle}</p>
        </div>
        <div className="anim-fade-up delay-1" style={{ paddingBottom: 64 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
