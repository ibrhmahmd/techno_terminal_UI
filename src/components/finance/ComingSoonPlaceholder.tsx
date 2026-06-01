interface ComingSoonPlaceholderProps {
  title?: string
  description?: string
  icon?: string
}

export function ComingSoonPlaceholder({
  title = 'Coming Soon',
  description = 'This feature is under development and will be available soon.',
  icon = 'construction',
}: ComingSoonPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">{icon}</span>
      <h3 className="font-headline text-xl font-semibold text-on-surface mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md">{description}</p>
    </div>
  )
}
