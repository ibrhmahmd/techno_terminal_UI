// ViewToggle — component contract
// Props:
interface ViewToggleProps {
  value: 'table' | 'cards'
  onChange: (mode: 'table' | 'cards') => void
}
// Renders: segmented pill toggle (table icon | grid icon) matching GroupBySelector style
// Integrated into GroupBySelector bar area
