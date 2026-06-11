interface AlphabetSliderProps {
  selectedLetter: string | null
  onSelect: (letter: string | null) => void
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function AlphabetSlider({ selectedLetter, onSelect }: AlphabetSliderProps) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded-xl border border-outline-variant/20 h-fit sticky top-4">
      <button
        onClick={() => onSelect(null)}
        className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
          selectedLetter === null
            ? 'bg-secondary text-on-secondary'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
        }`}
        title="Show all"
      >
        All
      </button>
      <div className="w-full h-px bg-outline-variant/30 my-1" />
      {LETTERS.map((letter) => (
        <button
          key={letter}
          onClick={() => onSelect(letter === selectedLetter ? null : letter)}
          className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
            selectedLetter === letter
              ? 'bg-secondary text-on-secondary'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          {letter}
        </button>
      ))}
    </div>
  )
}
