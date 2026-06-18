interface CategoryItem {
  key: string
}

/**
 * Compute the active category key from grouped data.
 * Returns the selected key if it exists, otherwise the first category key.
 */
export function computeActiveCategory<T extends CategoryItem>(
  groupedData: T[],
  selectedCategoryKey: string
): string {
  if (groupedData.length === 0) return ''
  const exists = groupedData.some(g => g.key === selectedCategoryKey)
  return exists ? selectedCategoryKey : groupedData[0].key
}
