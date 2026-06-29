import type { ReactNode } from 'react'

interface AuthLayoutProps {
  /** Page heading (e.g. "Sign In", "Reset Password") */
  title: string
  /** Page description below heading */
  subtitle: string
  /** Form content rendered below the brand header. Omit to show branded skeleton. */
  children?: ReactNode
  /** Whether to show the "TechnoTerminal" brand header. Default: true */
  showBranding?: boolean
}

function Skeleton() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      {/* Brand placeholder */}
      <div className="flex flex-col items-center mb-8 motion-safe:animate-pulse">
        <div className="h-7 w-48 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-24 bg-slate-100 rounded" />
      </div>
      {/* Title placeholder */}
      <div className="text-center mb-8 motion-safe:animate-pulse">
        <div className="h-6 w-36 bg-slate-200 rounded mx-auto mb-2" />
        <div className="h-4 w-56 bg-slate-100 rounded mx-auto" />
      </div>
      {/* Field placeholders */}
      <div className="space-y-4">
        <div className="motion-safe:animate-pulse">
          <div className="h-4 w-12 bg-slate-200 rounded mb-1.5" />
          <div className="h-11 w-full bg-slate-100 rounded-lg" />
        </div>
        <div className="motion-safe:animate-pulse">
          <div className="h-4 w-16 bg-slate-200 rounded mb-1.5" />
          <div className="h-11 w-full bg-slate-100 rounded-lg" />
        </div>
      </div>
      {/* Button placeholder */}
      <div className="motion-safe:animate-pulse pt-2">
        <div className="h-11 w-full bg-slate-200 rounded-lg" />
      </div>
    </div>
  )
}

export function AuthLayout({ title, subtitle, children, showBranding = true }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-surface">
      {/* Page background: repeating terminal symbol matrix */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        aria-hidden="true"
      >
        <defs>
          <pattern id="auth-pattern" width="144" height="144" patternUnits="userSpaceOnUse">
            <text x="24" y="36" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity="0.12">&gt;</text>
            <text x="72" y="36" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity="0.12">_</text>
            <text x="120" y="36" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity="0.12">~</text>
            <text x="24" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity="0.12">$</text>
            <text x="72" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity="0.12">#</text>
            <text x="120" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity="0.12">|</text>
            <text x="24" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity="0.12">&amp;</text>
            <text x="72" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity="0.12">%</text>
            <text x="120" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity="0.12">&lt;</text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-pattern)" />
      </svg>

      {/* Card interior watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <svg className="w-full h-full opacity-[0.04]">
              <defs>
                <pattern id="card-pattern" width="144" height="144" patternUnits="userSpaceOnUse">
                  <text x="24" y="36" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61">&gt;</text>
                  <text x="72" y="36" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61">_</text>
                  <text x="120" y="36" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61">~</text>
                  <text x="24" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61">$</text>
                  <text x="72" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61">#</text>
                  <text x="120" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61">|</text>
                  <text x="24" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61">&amp;</text>
                  <text x="72" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61">%</text>
                  <text x="120" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61">&lt;</text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#card-pattern)" />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-lg">
        <div className="w-full bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-200/60">
          {/* Brand header */}
          {showBranding && (
            <div className="flex flex-col items-center mb-6">
              <span className="material-symbols-outlined text-3xl text-secondary mb-2" aria-hidden="true">terminal</span>
              <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
                TechnoTerminal
              </h1>
            </div>
          )}

          {/* Skeleton or content */}
          {!children ? (
            <Skeleton />
          ) : (
            <>
              {/* Page heading */}
              <div className="text-center mb-8">
                <h2 className="font-headline text-xl font-semibold text-on-surface mb-1">{title}</h2>
                <p className="text-sm text-on-surface-variant">{subtitle}</p>
              </div>

              {children}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
