interface TerminalPatternProps {
  className?: string
  opacity?: number
  id?: string
}

export function TerminalPattern({ 
  className = '', 
  opacity = 0.12, 
  id = 'terminal-pattern' 
}: TerminalPatternProps) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width="144" height="144" patternUnits="userSpaceOnUse">
          <text x="24" y="36" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity={opacity}>&gt;</text>
          <text x="72" y="36" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity={opacity}>_</text>
          <text x="120" y="36" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity={opacity}>~</text>
          <text x="24" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity={opacity}>$</text>
          <text x="72" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity={opacity}>#</text>
          <text x="120" y="84" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity={opacity}>|</text>
          <text x="24" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity={opacity}>&amp;</text>
          <text x="72" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity={opacity}>%</text>
          <text x="120" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="18" fill="#006a61" fillOpacity={opacity}>&lt;</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export default TerminalPattern
