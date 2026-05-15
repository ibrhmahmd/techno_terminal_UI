// GroupCategoryTabs — component contract
// Props:
interface GroupCategoryTabsProps {
  categories: Array<{ key: string; label: string; count: number }>
  activeKey: string
  onChange: (key: string) => void
}
// Renders: dark-themed horizontal tab bar with category name + count badge
// Used in grouped card view (when isGroupedView && viewMode === 'cards')
