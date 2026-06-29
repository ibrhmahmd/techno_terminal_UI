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
      <div className="flex flex-col items-center mb-8 animate-pulse">
        <div className="h-7 w-48 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-24 bg-slate-100 rounded" />
      </div>
      {/* Title placeholder */}
      <div className="text-center mb-8 animate-pulse">
        <div className="h-6 w-36 bg-slate-200 rounded mx-auto mb-2" />
        <div className="h-4 w-56 bg-slate-100 rounded mx-auto" />
      </div>
      {/* Field placeholders */}
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 w-12 bg-slate-200 rounded mb-1.5" />
          <div className="h-11 w-full bg-slate-100 rounded-lg" />
        </div>
        <div className="animate-pulse">
          <div className="h-4 w-16 bg-slate-200 rounded mb-1.5" />
          <div className="h-11 w-full bg-slate-100 rounded-lg" />
        </div>
      </div>
      {/* Button placeholder */}
      <div className="animate-pulse pt-2">
        <div className="h-11 w-full bg-slate-200 rounded-lg" />
      </div>
    </div>
  )
}

export function AuthLayout({ title, subtitle, children, showBranding = true }: AuthLayoutProps) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-surface px-4 overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle, var(--color-secondary) 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Soft overlay to tone down the dots */}
      <div className="absolute inset-0 bg-surface/60" aria-hidden="true" />

      <div className="relative w-full max-w-md sm:max-w-md bg-white rounded-2xl p-8 shadow-lg border border-slate-100 sm:w-auto">
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
  )
}
