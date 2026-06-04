export interface MobileTopBarProps {
  title: string
}

export function MobileTopBar({ title }: MobileTopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 lg:hidden">
      <h1 className="font-headline text-lg text-white font-bold tracking-tight">
        TechnoTerminal
      </h1>
      <span className="text-teal-400 text-sm font-medium">
        {title}
      </span>
    </header>
  )
}
