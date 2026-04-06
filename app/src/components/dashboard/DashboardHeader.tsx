
interface DashboardHeaderProps {
  title: string
  subtitle: string
  showTime?: boolean
}

export function DashboardHeader({ title, subtitle, showTime = true }: DashboardHeaderProps) {
  const getLocalTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    })
  }

  return (
    <div className="flex items-end justify-between px-8 py-10 pb-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">{title}</h1>
        <p className="font-body text-sm text-on-surface-variant">{subtitle}</p>
      </div>
      {showTime && (
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-secondary">Local Time</span>
          <span className="font-headline text-lg font-medium text-on-surface">{getLocalTime().replace("GMT+2", "")}</span>
        </div>
      )}
    </div>
  )
}
